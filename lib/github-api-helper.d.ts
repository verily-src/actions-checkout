export declare function downloadRepository(authToken: string, owner: string, repo: string, ref: string, commit: string, repositoryPath: string, baseUrl?: string): Promise<void>;
/**
 * Looks up the default branch name
 */
export declare function getDefaultBranch(authToken: string, owner: string, repo: string, baseUrl?: string): Promise<string>;
