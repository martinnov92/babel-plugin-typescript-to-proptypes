"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
function upsertImport(imp, options = {}) {
    const { checkForDefault, checkForNamed } = options;
    const response = {
        defaultImport: '',
        namedImport: '',
        namedImports: [],
    };
    let hasDefault = false;
    let hasNamed = false;
    response.namedImports = imp.specifiers
        .filter(spec => {
        if (core_1.types.isImportDefaultSpecifier(spec) || core_1.types.isImportNamespaceSpecifier(spec)) {
            response.defaultImport = spec.local.name;
            hasDefault = true;
            return false;
        }
        return true;
    })
        .map(spec => {
        const { name } = spec.local;
        if (name === checkForNamed) {
            response.namedImport = name;
            hasNamed = true;
        }
        return name;
    });
    // Add default import if it doesn't exist
    if (checkForDefault && !hasDefault) {
        imp.specifiers.unshift(core_1.types.importDefaultSpecifier(core_1.types.identifier(checkForDefault)));
        response.defaultImport = checkForDefault;
    }
    // Add named import if it doesn't exist
    if (checkForNamed && !hasNamed) {
        imp.specifiers.push(core_1.types.importSpecifier(core_1.types.identifier(checkForNamed), core_1.types.identifier(checkForNamed)));
        response.namedImport = checkForNamed;
    }
    return response;
}
exports.default = upsertImport;
