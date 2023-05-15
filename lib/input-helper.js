"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fsHelper = __importStar(require("./fs-helper"));
const github = __importStar(require("@actions/github"));
const path = __importStar(require("path"));
function getInputs() {
    const result = {};
    // GitHub workspace
    let githubWorkspacePath = process.env['GITHUB_WORKSPACE'];
    if (!githubWorkspacePath) {
        throw new Error('GITHUB_WORKSPACE not defined');
    }
    githubWorkspacePath = path.resolve(githubWorkspacePath);
    core.debug(`GITHUB_WORKSPACE = '${githubWorkspacePath}'`);
    fsHelper.directoryExistsSync(githubWorkspacePath, true);
    result.repositoryOwner = github.context.repo.owner;
    result.repositoryName = core.getInput('repository') || `${github.context.repo.repo}`;
    // Repository path
    result.repositoryPath = core.getInput('path') || '.';
    result.repositoryPath = path.resolve(githubWorkspacePath, result.repositoryPath);
    if (!(result.repositoryPath + path.sep).startsWith(githubWorkspacePath + path.sep)) {
        throw new Error(`Repository path '${result.repositoryPath}' is not under '${githubWorkspacePath}'`);
    }
    // Workflow repository?
    const isWorkflowRepository = result.repositoryName.toUpperCase() ===
        `${github.context.repo.repo}`.toUpperCase();
    // Source branch, source version
    result.ref = core.getInput('ref');
    if (!result.ref) {
        if (isWorkflowRepository) {
            result.ref = github.context.ref;
            result.commit = github.context.sha;
            // Some events have an unqualifed ref. For example when a PR is merged (pull_request closed event),
            // the ref is unqualifed like "master" instead of "refs/heads/master".
            if (result.commit && result.ref && !result.ref.startsWith('refs/')) {
                result.ref = `refs/heads/${result.ref}`;
            }
        }
        if (!result.ref && !result.commit) {
            result.ref = 'refs/heads/master';
        }
    }
    // SHA?
    else if (result.ref.match(/^[0-9a-fA-F]{40}$/)) {
        result.commit = result.ref;
        result.ref = '';
    }
    core.debug(`ref = '${result.ref}'`);
    core.debug(`commit = '${result.commit}'`);
    // Clean
    result.clean = (core.getInput('clean') || 'true').toUpperCase() === 'TRUE';
    core.debug(`clean = ${result.clean}`);
    // Fetch depth
    result.fetchDepth = Math.floor(Number(core.getInput('fetch-depth') || '1'));
    if (isNaN(result.fetchDepth) || result.fetchDepth < 0) {
        result.fetchDepth = 0;
    }
    core.debug(`fetch depth = ${result.fetchDepth}`);
    // LFS
    result.lfs = (core.getInput('lfs') || 'false').toUpperCase() === 'TRUE';
    core.debug(`lfs = ${result.lfs}`);
    // Submodules
    result.submodules = true;
    result.nestedSubmodules = true;
    core.debug(`submodules = ${result.submodules}`);
    core.debug(`recursive submodules = ${result.nestedSubmodules}`);
    // Auth token
    result.authToken = core.getInput('token');
    // SSH
    result.sshKey = core.getInput('ssh-key');
    result.sshKnownHosts = core.getInput('ssh-known-hosts');
    result.sshStrict =
        (core.getInput('ssh-strict') || 'true').toUpperCase() === 'TRUE';
    // Persist credentials
    result.persistCredentials =
        (core.getInput('persist-credentials') || 'false').toUpperCase() === 'TRUE';
    return result;
}
exports.getInputs = getInputs;
