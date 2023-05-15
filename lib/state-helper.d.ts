/**
 * Indicates whether the POST action is running
 */
export declare const IsPost: boolean;
/**
 * The repository path for the POST action. The value is empty during the MAIN action.
 */
export declare const RepositoryPath: string;
/**
 * The set-safe-directory for the POST action. The value is set if input: 'safe-directory' is set during the MAIN action.
 */
export declare const PostSetSafeDirectory: boolean;
/**
 * The SSH key path for the POST action. The value is empty during the MAIN action.
 */
export declare const SshKeyPath: string;
/**
 * The SSH known hosts path for the POST action. The value is empty during the MAIN action.
 */
export declare const SshKnownHostsPath: string;
/**
 * Save the repository path so the POST action can retrieve the value.
 */
export declare function setRepositoryPath(repositoryPath: string): void;
/**
 * Save the SSH key path so the POST action can retrieve the value.
 */
export declare function setSshKeyPath(sshKeyPath: string): void;
/**
 * Save the SSH known hosts path so the POST action can retrieve the value.
 */
export declare function setSshKnownHostsPath(sshKnownHostsPath: string): void;
/**
 * Save the set-safe-directory input so the POST action can retrieve the value.
 */
export declare function setSafeDirectory(): void;
