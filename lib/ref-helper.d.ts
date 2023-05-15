import { IGitCommandManager } from './git-command-manager';
export interface ICheckoutInfo {
    ref: string;
    startPoint: string;
}
export declare function getCheckoutInfo(git: IGitCommandManager, ref: string, commit: string): Promise<ICheckoutInfo>;
export declare function getRefSpec(ref: string, commit: string): string[];
