"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
const getTypeName_1 = __importDefault(require("./getTypeName"));
function extractGenericTypeNames(node) {
    const names = [];
    // <Foo>
    if (core_1.types.isTSTypeParameterInstantiation(node)) {
        node.params.forEach(param => {
            names.push(...extractGenericTypeNames(param));
        });
        // Foo
    }
    else if (core_1.types.isTSTypeReference(node)) {
        names.push(getTypeName_1.default(node.typeName));
        // Foo & Bar, Foo | Bar
    }
    else if (core_1.types.isTSIntersectionType(node) || core_1.types.isTSUnionType(node)) {
        node.types.forEach(param => {
            names.push(...extractGenericTypeNames(param));
        });
    }
    return names;
}
exports.default = extractGenericTypeNames;
