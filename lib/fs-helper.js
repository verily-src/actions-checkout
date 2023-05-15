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
exports.fileExistsSync = exports.existsSync = exports.directoryExistsSync = void 0;
const fs = __importStar(require("fs"));
function directoryExistsSync(path, required) {
    var _a, _b, _c;
    if (!path) {
        throw new Error("Arg 'path' must not be empty");
    }
    let stats;
    try {
        stats = fs.statSync(path);
    }
    catch (error) {
        if (((_a = error) === null || _a === void 0 ? void 0 : _a.code) === 'ENOENT') {
            if (!required) {
                return false;
            }
            throw new Error(`Directory '${path}' does not exist`);
        }
        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${(_c = (_b = error) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : error}`);
    }
    if (stats.isDirectory()) {
        return true;
    }
    else if (!required) {
        return false;
    }
    throw new Error(`Directory '${path}' does not exist`);
}
exports.directoryExistsSync = directoryExistsSync;
function existsSync(path) {
    var _a, _b, _c;
    if (!path) {
        throw new Error("Arg 'path' must not be empty");
    }
    try {
        fs.statSync(path);
    }
    catch (error) {
        if (((_a = error) === null || _a === void 0 ? void 0 : _a.code) === 'ENOENT') {
            return false;
        }
        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${(_c = (_b = error) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : error}`);
    }
    return true;
}
exports.existsSync = existsSync;
function fileExistsSync(path) {
    var _a, _b, _c;
    if (!path) {
        throw new Error("Arg 'path' must not be empty");
    }
    let stats;
    try {
        stats = fs.statSync(path);
    }
    catch (error) {
        if (((_a = error) === null || _a === void 0 ? void 0 : _a.code) === 'ENOENT') {
            return false;
        }
        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${(_c = (_b = error) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : error}`);
    }
    if (!stats.isDirectory()) {
        return true;
    }
    return false;
}
exports.fileExistsSync = fileExistsSync;
