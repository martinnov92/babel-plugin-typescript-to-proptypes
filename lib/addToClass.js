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
function findStaticProperty(node, name) {
    return node.body.body.find(property => core_1.types.isClassProperty(property, { static: true }) &&
        core_1.types.isIdentifier(property.key, { name }) &&
        (core_1.types.isObjectExpression(property.value) || core_1.types.isCallExpression(property.value)));
}
function addToClass(node, state) {
    if (!node.superTypeParameters || node.superTypeParameters.params.length <= 0) {
        return;
    }
    const defaultProps = findStaticProperty(node, 'defaultProps');
    const defaultPropsKeyList = [];
    if (defaultProps && core_1.types.isClassProperty(defaultProps) && core_1.types.isObjectExpression(defaultProps.value)) {
        defaultProps.value.properties.forEach(prop => {
            if (core_1.types.isProperty(prop) && core_1.types.isIdentifier(prop.key)) {
                defaultPropsKeyList.push(prop.key.name);
            }
        });
    }
    const typeNames = extractGenericTypeNames_1.default(node.superTypeParameters.params[0]);
    const propTypesList = convertBabelToPropTypes_1.default(state.componentTypes, typeNames, state, defaultPropsKeyList);
    if (typeNames.length === 0 || propTypesList.length === 0) {
        return;
    }
    const propTypes = findStaticProperty(node, 'propTypes');
    if (propTypes) {
        propTypes.value = propTypes_1.mergePropTypes(propTypes.value, propTypesList, state);
    }
    else {
        const staticProperty = core_1.types.classProperty(core_1.types.identifier('propTypes'), propTypes_1.createPropTypesObject(propTypesList, state));
        // @ts-ignore
        staticProperty.static = true;
        node.body.body.unshift(staticProperty);
    }
}
exports.default = addToClass;
