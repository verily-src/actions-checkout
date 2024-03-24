import * as actionsCore from "@actions/core/lib/core";

/**
 * Indicates whether the POST action is running
 */
export const IsPost = !!process.env["STATE_isPost"];

/**
 * The repository path for the POST action. The value is empty during the MAIN action.
 */
export const RepositoryPath =
  (process.env["STATE_repositoryPath"] as string) || "";

/**
 * The SSH key path for the POST action. The value is empty during the MAIN action.
 */
export const SshKeyPath = (process.env["STATE_sshKeyPath"] as string) || "";

/**
 * The SSH known hosts path for the POST action. The value is empty during the MAIN action.
 */
export const SshKnownHostsPath =
  (process.env["STATE_sshKnownHostsPath"] as string) || "";

/**
 * Save the repository path so the POST action can retrieve the value.
 */
export function setRepositoryPath(repositoryPath: string) {
  actionsCore.saveState("repositoryPath", repositoryPath);
}

/**
 * Save the SSH key path so the POST action can retrieve the value.
 */
export function setSshKeyPath(sshKeyPath: string) {
  actionsCore.saveState("sshKeyPath", sshKeyPath);
}

/**
 * Save the SSH known hosts path so the POST action can retrieve the value.
 */
export function setSshKnownHostsPath(sshKnownHostsPath: string) {
  actionsCore.saveState("sshKnownHostsPath", sshKnownHostsPath);
}

// Publish a variable so that when the POST action runs, it can determine it should run the cleanup logic.
// This is necessary since we don't have a separate entry point.
if (!IsPost) {
  actionsCore.saveState("isPost", "true");
}
