"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
function getTypeName(typeName) {
    if (core_1.types.isIdentifier(typeName)) {
        return typeName.name;
    }
    else if (core_1.types.isTSQualifiedName(typeName)) {
        return `${getTypeName(typeName.left)}.${typeName.right.name}`;
    }
    return '';
}
exports.default = getTypeName;
