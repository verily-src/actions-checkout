/// <reference types="node" />
import { IGitSourceSettings } from './git-source-settings';
import { URL } from 'url';
export declare function getFetchUrl(settings: IGitSourceSettings): string;
export declare function getServerUrl(url?: string): URL;
export declare function getServerApiUrl(url?: string): string;
export declare function isGhes(url?: string): boolean;
