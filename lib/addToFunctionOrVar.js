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
const convertBabelToPropTypes_1 = __importDefault(require("./convertBabelToPropTypes"));
const extractGenericTypeNames_1 = __importDefault(require("./extractGenericTypeNames"));
const propTypes_1 = require("./propTypes");
function extractTypeNames(path) {
    if (core_1.types.isFunctionDeclaration(path.node)) {
        return extractGenericTypeNames_1.default(path.node.params[0].typeAnnotation.typeAnnotation);
    }
    if (core_1.types.isVariableDeclaration(path.node)) {
        const decl = path.node.declarations[0];
        const id = decl.id;
        if (id.typeAnnotation && id.typeAnnotation.typeAnnotation) {
            return extractGenericTypeNames_1.default(id.typeAnnotation.typeAnnotation.typeParameters.params[0]);
        }
        else if (decl.init && core_1.types.isArrowFunctionExpression(decl.init)) {
            return extractGenericTypeNames_1.default(decl.init.params[0].typeAnnotation.typeAnnotation);
        }
    }
    return [];
}
function findStaticProperty(path, funcName, name) {
    const expr = path
        .getAllNextSiblings()
        .find(sibPath => core_1.types.isExpressionStatement(sibPath.node) &&
        core_1.types.isAssignmentExpression(sibPath.node.expression, { operator: '=' }) &&
        core_1.types.isMemberExpression(sibPath.node.expression.left) &&
        core_1.types.isObjectExpression(sibPath.node.expression.right) &&
        core_1.types.isIdentifier(sibPath.node.expression.left.object, { name: funcName }) &&
        core_1.types.isIdentifier(sibPath.node.expression.left.property, { name }));
    // @ts-ignore
    return expr && expr.node.expression;
}
function addToFunctionOrVar(path, name, state) {
    const rootPath = core_1.types.isExportNamedDeclaration(path.parent) || core_1.types.isExportDefaultDeclaration(path.parent)
        ? path.parentPath
        : path;
    const defaultProps = findStaticProperty(rootPath, name, 'defaultProps');
    const defaultPropsKeyList = [];
    if (defaultProps &&
        core_1.types.isAssignmentExpression(defaultProps) &&
        core_1.types.isObjectExpression(defaultProps.right)) {
        defaultProps.right.properties.forEach(prop => {
            if (core_1.types.isProperty(prop) && core_1.types.isIdentifier(prop.key)) {
                defaultPropsKeyList.push(prop.key.name);
            }
        });
    }
    const typeNames = extractTypeNames(path);
    const propTypesList = convertBabelToPropTypes_1.default(state.componentTypes, typeNames, state, defaultPropsKeyList);
    if (typeNames.length === 0 || propTypesList.length === 0) {
        return;
    }
    const propTypes = findStaticProperty(rootPath, name, 'propTypes');
    if (propTypes) {
        propTypes.right = propTypes_1.mergePropTypes(propTypes.right, propTypesList, state);
    }
    else {
        rootPath.insertAfter(core_1.types.expressionStatement(core_1.types.assignmentExpression('=', core_1.types.memberExpression(core_1.types.identifier(name), core_1.types.identifier('propTypes')), propTypes_1.createPropTypesObject(propTypesList, state))));
    }
}
exports.default = addToFunctionOrVar;
