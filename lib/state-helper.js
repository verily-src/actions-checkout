"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSafeDirectory = exports.setSshKnownHostsPath = exports.setSshKeyPath = exports.setRepositoryPath = exports.SshKnownHostsPath = exports.SshKeyPath = exports.PostSetSafeDirectory = exports.RepositoryPath = exports.IsPost = void 0;
const core = __importStar(require("@actions/core"));
/**
 * Indicates whether the POST action is running
 */
exports.IsPost = !!core.getState('isPost');
/**
 * The repository path for the POST action. The value is empty during the MAIN action.
 */
exports.RepositoryPath = core.getState('repositoryPath');
/**
 * The set-safe-directory for the POST action. The value is set if input: 'safe-directory' is set during the MAIN action.
 */
exports.PostSetSafeDirectory = core.getState('setSafeDirectory') === 'true';
/**
 * The SSH key path for the POST action. The value is empty during the MAIN action.
 */
exports.SshKeyPath = core.getState('sshKeyPath');
/**
 * The SSH known hosts path for the POST action. The value is empty during the MAIN action.
 */
exports.SshKnownHostsPath = core.getState('sshKnownHostsPath');
/**
 * Save the repository path so the POST action can retrieve the value.
 */
function setRepositoryPath(repositoryPath) {
    core.saveState('repositoryPath', repositoryPath);
}
exports.setRepositoryPath = setRepositoryPath;
/**
 * Save the SSH key path so the POST action can retrieve the value.
 */
function setSshKeyPath(sshKeyPath) {
    core.saveState('sshKeyPath', sshKeyPath);
}
exports.setSshKeyPath = setSshKeyPath;
/**
 * Save the SSH known hosts path so the POST action can retrieve the value.
 */
function setSshKnownHostsPath(sshKnownHostsPath) {
    core.saveState('sshKnownHostsPath', sshKnownHostsPath);
}
exports.setSshKnownHostsPath = setSshKnownHostsPath;
/**
 * Save the set-safe-directory input so the POST action can retrieve the value.
 */
function setSafeDirectory() {
    core.saveState('setSafeDirectory', 'true');
}
exports.setSafeDirectory = setSafeDirectory;
// Publish a variable so that when the POST action runs, it can determine it should run the cleanup logic.
// This is necessary since we don't have a separate entry point.
if (!exports.IsPost) {
    core.saveState('isPost', 'true');
}
