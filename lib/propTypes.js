"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
function hasCustomPropTypeSuffix(name, suffixes) {
    return !!suffixes && suffixes.some(suffix => name.endsWith(suffix));
}
exports.hasCustomPropTypeSuffix = hasCustomPropTypeSuffix;
function isReactTypeMatch(name, type, reactImportedName) {
    return name === type || name === `React.${type}` || name === `${reactImportedName}.${type}`;
}
exports.isReactTypeMatch = isReactTypeMatch;
function wrapIsRequired(propType, optional) {
    return optional ? propType : core_1.types.memberExpression(propType, core_1.types.identifier('isRequired'));
}
exports.wrapIsRequired = wrapIsRequired;
function createMember(value, propTypesImportedName) {
    return core_1.types.memberExpression(core_1.types.identifier(propTypesImportedName), value);
}
exports.createMember = createMember;
function createCall(value, args, propTypesImportedName) {
    return core_1.types.callExpression(createMember(value, propTypesImportedName), args);
}
exports.createCall = createCall;
function createPropTypesObject(propTypes, state) {
    const object = core_1.types.objectExpression(propTypes);
    // Wrap with forbid
    return state.options.forbidExtraProps
        ? core_1.types.callExpression(core_1.types.identifier(state.airbnbPropTypes.forbidImport), [object])
        : object;
}
exports.createPropTypesObject = createPropTypesObject;
function mergePropTypes(expr, propTypes, state, wrapForbid = true) {
    if (core_1.types.isCallExpression(expr)) {
        if (core_1.types.isIdentifier(expr.callee, { name: 'forbidExtraProps' })) {
            expr.arguments.forEach((arg, index) => {
                expr.arguments[index] = mergePropTypes(arg, propTypes, state, false);
            });
        }
        return expr;
    }
    if (!core_1.types.isObjectExpression(expr)) {
        return expr;
    }
    const { properties } = expr;
    const existingProps = {};
    // Extract existing props so that we don't duplicate
    properties.forEach(property => {
        if (core_1.types.isObjectProperty(property) && core_1.types.isIdentifier(property.key)) {
            existingProps[property.key.name] = true;
        }
    });
    // Add to the beginning of the array so existing/custom prop types aren't overwritten
    propTypes.forEach(propType => {
        if (core_1.types.isIdentifier(propType.key) && !existingProps[propType.key.name]) {
            properties.unshift(propType);
        }
    });
    // Wrap with forbid
    if (wrapForbid && state.options.forbidExtraProps) {
        return core_1.types.callExpression(core_1.types.identifier(state.airbnbPropTypes.forbidImport), [expr]);
    }
    return expr;
}
exports.mergePropTypes = mergePropTypes;
let installedVersion = 0.0;
function getInstalledPropTypesVersion() {
    if (installedVersion) {
        return installedVersion;
    }
    try {
        // eslint-disable-next-line global-require
        installedVersion = parseFloat(require('prop-types/package.json').version);
    }
    catch (_a) {
        // Swallow
    }
    return installedVersion;
}
exports.getInstalledPropTypesVersion = getInstalledPropTypesVersion;
