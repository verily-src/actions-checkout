import * as core from '@actions/core'
import * as fsHelper from './fs-helper'
import * as gitAuthHelper from './git-auth-helper'
import * as gitCommandManager from './git-command-manager'
import * as gitDirectoryHelper from './git-directory-helper'
import * as githubApiHelper from './github-api-helper'
import * as io from '@actions/io'
import * as path from 'path'
import * as refHelper from './ref-helper'
import * as stateHelper from './state-helper'
import * as urlHelper from './url-helper'
import {IGitCommandManager} from './git-command-manager'
import {IGitSourceSettings} from './git-source-settings'

export async function getSource(settings: IGitSourceSettings): Promise<void> {
  // Repository URL
  core.info(
    `Syncing repository: ${settings.repositoryOwner}/${settings.repositoryName}`
  )
  const repositoryUrl = urlHelper.getFetchUrl(settings)

  // Remove conflicting file path
  if (fsHelper.fileExistsSync(settings.repositoryPath)) {
    await io.rmRF(settings.repositoryPath)
  }

  // Create directory
  let isExisting = true
  if (!fsHelper.directoryExistsSync(settings.repositoryPath)) {
    isExisting = false
    await io.mkdirP(settings.repositoryPath)
  }

  // Git command manager
  core.startGroup('Getting Git version info')
  const git = await getGitCommandManager(settings)
  core.endGroup()

  // Prepare existing directory, otherwise recreate
  if (isExisting) {
    await gitDirectoryHelper.prepareExistingDirectory(
      git,
      settings.repositoryPath,
      repositoryUrl,
      settings.clean
    )
  }

  if (!git) {
    // Downloading using REST API
    core.info(`The repository will be downloaded using the GitHub REST API`)
    core.info(
      `To create a local Git repository instead, add Git ${gitCommandManager.MinimumGitVersion} or higher to the PATH`
    )
    if (settings.submodules) {
      throw new Error(
        `Input 'submodules' not supported when falling back to download using the GitHub REST API. To create a local Git repository instead, add Git ${gitCommandManager.MinimumGitVersion} or higher to the PATH.`
      )
    } else if (settings.sshKey) {
      throw new Error(
        `Input 'ssh-key' not supported when falling back to download using the GitHub REST API. To create a local Git repository instead, add Git ${gitCommandManager.MinimumGitVersion} or higher to the PATH.`
      )
    }

    await githubApiHelper.downloadRepository(
      settings.authToken,
      settings.repositoryOwner,
      settings.repositoryName,
      settings.ref,
      settings.commit,
      settings.repositoryPath
    )
    return
  }

  // Save state for POST action
  stateHelper.setRepositoryPath(settings.repositoryPath)

  // Initialize the repository
  if (
    !fsHelper.directoryExistsSync(path.join(settings.repositoryPath, '.git'))
  ) {
    core.startGroup('Initializing the repository')
    await git.init()
    await git.remoteAdd('origin', repositoryUrl)
    core.endGroup()
  }

  // Disable automatic garbage collection
  core.startGroup('Disabling automatic garbage collection')
  if (!(await git.tryDisableAutomaticGarbageCollection())) {
    core.warning(
      `Unable to turn off git automatic garbage collection. The git fetch operation may trigger garbage collection and cause a delay.`
    )
  }
  core.endGroup()

  const authHelper = gitAuthHelper.createAuthHelper(git, settings)
  try {
    // Configure auth
    core.startGroup('Setting up auth')
    await authHelper.configureAuth()
    core.endGroup()

    // LFS install
    if (settings.lfs) {
      await git.lfsInstall()
    }

    // Fetch
    core.startGroup('Fetching the repository')
    const refSpec = refHelper.getRefSpec(settings.ref, settings.commit)
    await git.fetch(settings.fetchDepth, refSpec)
    core.endGroup()

    // Checkout info
    core.startGroup('Determining the checkout info')
    const checkoutInfo = await refHelper.getCheckoutInfo(
      git,
      settings.ref,
      settings.commit
    )
    core.endGroup()

    // LFS fetch
    // Explicit lfs-fetch to avoid slow checkout (fetches one lfs object at a time).
    // Explicit lfs fetch will fetch lfs objects in parallel.
    if (settings.lfs) {
      core.startGroup('Fetching LFS objects')
      await git.lfsFetch(checkoutInfo.startPoint || checkoutInfo.ref)
      core.endGroup()
    }

    // Checkout
    core.startGroup('Checking out the ref')
    await git.checkout(checkoutInfo.ref, checkoutInfo.startPoint)
    core.endGroup()

    // Submodules
    if (settings.submodules) {
      try {
        // Temporarily override global config
        core.startGroup('Setting up auth for fetching submodules')
        await authHelper.configureGlobalAuth()
        core.endGroup()
        core.startGroup('Decidint whether to fetch specific submodules')
        core.debug(`submoduleList = ${settings.submoduleList}`)
        core.debug(`submoduleList.length = ${settings.submoduleList.length}`)
        core.endGroup()

        if(settings.submoduleList.length > 0) {
          // Checkout specific submodules
          core.startGroup('Fetching specific submodules')
          await git.submoduleUpdateSpecific(
            settings.fetchDepth,
            settings.nestedSubmodules,
            settings.submoduleList
          )
        }
        else {
          // Checkout submodules
          // core.startGroup('Fetching submodules')
          // await git.submoduleSync(settings.nestedSubmodules)
          // await git.submoduleUpdate(
          //   settings.fetchDepth,
          //   settings.nestedSubmodules
          // )
          core.startGroup("you shouldn't be here")
          core.endGroup()
        }

        // Check all submodules
        const parseOwner = /github\.com[:\/]([^\/]*)\/[^\/]*\.git/
        const output = await git.submoduleForeach(
          'git remote get-url origin',
          settings.nestedSubmodules
        )
        for (let line of output.split('\n')) {
          let match = line.match(parseOwner) || []
          if (match.length == 2 && match[1] != settings.repositoryOwner) {
            throw new Error(
              `Submodule '${match[0]}' is invalid. Expected '${settings.repositoryOwner}' as owner.`
            )
          }
        }

        await git.submoduleForeach(
          'git config --local gc.auto 0',
          settings.nestedSubmodules
        )
        core.endGroup()

        // Persist credentials
        if (settings.persistCredentials) {
          core.startGroup('Persisting credentials for submodules')
          await authHelper.configureSubmoduleAuth()
          core.endGroup()
        }
      } finally {
        // Remove temporary global config override
        await authHelper.removeGlobalAuth()
      }
    }

    // Dump some info about the checked out commit
    await git.log1()
  } finally {
    // Remove auth
    if (!settings.persistCredentials) {
      core.startGroup('Removing auth')
      await authHelper.removeAuth()
      core.endGroup()
    }
  }
}

export async function cleanup(repositoryPath: string): Promise<void> {
  // Repo exists?
  if (
    !repositoryPath ||
    !fsHelper.fileExistsSync(path.join(repositoryPath, '.git', 'config'))
  ) {
    return
  }

  let git: IGitCommandManager
  try {
    git = await gitCommandManager.createCommandManager(repositoryPath, false)
  } catch {
    return
  }

  // Remove auth
  const authHelper = gitAuthHelper.createAuthHelper(git)
  await authHelper.removeAuth()
}

async function getGitCommandManager(
  settings: IGitSourceSettings
): Promise<IGitCommandManager | undefined> {
  core.info(`Working directory is '${settings.repositoryPath}'`)
  try {
    return await gitCommandManager.createCommandManager(
      settings.repositoryPath,
      settings.lfs
    )
  } catch (err) {
    // Git is required for LFS
    if (settings.lfs) {
      throw err
    }

    // Otherwise fallback to REST API
    return undefined
  }
}
