"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const typescript_1 = __importDefault(require("typescript"));
let config;
let program;
function loadTSConfig() {
    if (config) {
        return config;
    }
    const { config: maybeConfig, error } = typescript_1.default.readConfigFile(path_1.default.join(process.cwd(), 'tsconfig.json'), filePath => fs_1.default.readFileSync(filePath, 'utf8'));
    if (error) {
        throw error;
    }
    const { options, errors } = typescript_1.default.parseJsonConfigFileContent(maybeConfig, typescript_1.default.sys, process.cwd());
    if (errors.length > 0) {
        throw errors[0];
    }
    config = options;
    return options;
}
exports.loadTSConfig = loadTSConfig;
function loadProgram(pattern, root) {
    if (program) {
        return program;
    }
    program = typescript_1.default.createProgram(fast_glob_1.default.sync(pattern === true ? './src/**/*.ts' : pattern, { absolute: true, cwd: root }), loadTSConfig());
    return program;
}
exports.loadProgram = loadProgram;
