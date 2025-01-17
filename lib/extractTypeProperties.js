"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
function extractTypeProperties(node, types) {
    const properties = [];
    const mapToPropertySignature = (data) => {
        data.forEach(prop => {
            if (core_1.types.isTSPropertySignature(prop)) {
                properties.push(prop);
            }
        });
    };
    // Props
    if (core_1.types.isIdentifier(node)) {
        if (types[node.name]) {
            properties.push(...types[node.name]);
        }
        // Props
    }
    else if (core_1.types.isTSTypeReference(node)) {
        properties.push(...extractTypeProperties(node.typeName, types));
        // interface {}
    }
    else if (core_1.types.isTSInterfaceDeclaration(node)) {
        (node.extends || []).forEach(ext => {
            properties.push(...extractTypeProperties(ext.expression, types));
        });
        mapToPropertySignature(node.body.body);
        // type = {}
    }
    else if (core_1.types.isTSTypeAliasDeclaration(node)) {
        properties.push(...extractTypeProperties(node.typeAnnotation, types));
        // {}
    }
    else if (core_1.types.isTSTypeLiteral(node)) {
        mapToPropertySignature(node.members);
        // Props & {}, Props | {}
    }
    else if (core_1.types.isTSIntersectionType(node) || core_1.types.isTSUnionType(node)) {
        node.types.forEach(intType => {
            properties.push(...extractTypeProperties(intType, types));
        });
    }
    return properties;
}
exports.default = extractTypeProperties;
