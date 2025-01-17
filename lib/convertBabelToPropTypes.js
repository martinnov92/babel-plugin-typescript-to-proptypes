"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-use-before-define */
const core_1 = require("@babel/core");
const convertTSToPropTypes_1 = require("./convertTSToPropTypes");
const getTypeName_1 = __importDefault(require("./getTypeName"));
const propTypes_1 = require("./propTypes");
const NATIVE_BUILT_INS = ['Date', 'Error', 'RegExp', 'Map', 'WeakMap', 'Set', 'WeakSet', 'Promise'];
const PROP_TYPES_15_7 = 15.7;
function convert(type, state, depth) {
    const { reactImportedName, propTypes } = state;
    const propTypesImportedName = propTypes.defaultImport;
    const isMaxDepth = depth >= state.options.maxDepth;
    // Remove wrapping parens
    if (core_1.types.isTSParenthesizedType(type)) {
        type = type.typeAnnotation;
    }
    state.propTypes.count += 1;
    // any -> PropTypes.any
    if (core_1.types.isTSAnyKeyword(type)) {
        return propTypes_1.createMember(core_1.types.identifier('any'), propTypesImportedName);
        // string -> PropTypes.string
    }
    else if (core_1.types.isTSStringKeyword(type)) {
        return propTypes_1.createMember(core_1.types.identifier('string'), propTypesImportedName);
        // number -> PropTypes.number
    }
    else if (core_1.types.isTSNumberKeyword(type)) {
        return propTypes_1.createMember(core_1.types.identifier('number'), propTypesImportedName);
        // boolean -> PropTypes.bool
    }
    else if (core_1.types.isTSBooleanKeyword(type)) {
        return propTypes_1.createMember(core_1.types.identifier('bool'), propTypesImportedName);
        // symbol -> PropTypes.symbol
    }
    else if (core_1.types.isTSSymbolKeyword(type)) {
        return propTypes_1.createMember(core_1.types.identifier('symbol'), propTypesImportedName);
        // object -> PropTypes.object
    }
    else if (core_1.types.isTSObjectKeyword(type)) {
        return propTypes_1.createMember(core_1.types.identifier('object'), propTypesImportedName);
        // null -> PropTypes.oneOf([null])
    }
    else if (core_1.types.isTSNullKeyword(type)) {
        return propTypes_1.createCall(core_1.types.identifier('oneOf'), [core_1.types.arrayExpression([core_1.types.nullLiteral()])], propTypesImportedName);
        // 'foo' -> PropTypes.oneOf(['foo'])
    }
    else if (core_1.types.isTSLiteralType(type)) {
        return propTypes_1.createCall(core_1.types.identifier('oneOf'), [core_1.types.arrayExpression([type.literal])], propTypesImportedName);
        // (() => void) -> PropTypes.func
    }
    else if (core_1.types.isTSFunctionType(type)) {
        return propTypes_1.createMember(core_1.types.identifier('func'), propTypesImportedName);
        // React.ReactNode -> PropTypes.node
        // React.ReactElement -> PropTypes.element
        // React.MouseEvent -> PropTypes.object
        // React.MouseEventHandler -> PropTypes.func
        // React.Ref -> PropTypes.oneOfType()
        // JSX.Element -> PropTypes.element
        // FooShape, FooPropType -> FooShape, FooPropType
        // Date, Error, RegExp -> Date, Error, RegExp
        // CustomType -> PropTypes.any
    }
    else if (core_1.types.isTSTypeReference(type)) {
        const name = getTypeName_1.default(type.typeName);
        // node
        if (propTypes_1.isReactTypeMatch(name, 'ReactText', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'ReactNode', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'ReactType', reactImportedName)) {
            return propTypes_1.createMember(core_1.types.identifier('node'), propTypesImportedName);
            // function
        }
        else if (propTypes_1.isReactTypeMatch(name, 'ComponentType', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'ComponentClass', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'StatelessComponent', reactImportedName)) {
            return propTypes_1.getInstalledPropTypesVersion() >= PROP_TYPES_15_7
                ? propTypes_1.createMember(core_1.types.identifier('elementType'), propTypesImportedName)
                : propTypes_1.createMember(core_1.types.identifier('func'), propTypesImportedName);
            // element
        }
        else if (propTypes_1.isReactTypeMatch(name, 'Element', 'JSX') ||
            propTypes_1.isReactTypeMatch(name, 'ReactElement', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'ComponentElement', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'FunctionComponentElement', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'DOMElement', reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, 'SFCElement', reactImportedName)) {
            return propTypes_1.createMember(core_1.types.identifier('element'), propTypesImportedName);
            // oneOfType
        }
        else if (propTypes_1.isReactTypeMatch(name, 'Ref', reactImportedName)) {
            return propTypes_1.createCall(core_1.types.identifier('oneOfType'), [
                core_1.types.arrayExpression([
                    propTypes_1.createMember(core_1.types.identifier('string'), propTypesImportedName),
                    propTypes_1.createMember(core_1.types.identifier('func'), propTypesImportedName),
                    propTypes_1.createMember(core_1.types.identifier('object'), propTypesImportedName),
                ]),
            ], propTypesImportedName);
            // function
        }
        else if (name.endsWith('Handler')) {
            return propTypes_1.createMember(core_1.types.identifier('func'), propTypesImportedName);
            // object
        }
        else if (name.endsWith('Event')) {
            return propTypes_1.createMember(core_1.types.identifier('object'), propTypesImportedName);
            // native built-ins
        }
        else if (NATIVE_BUILT_INS.includes(name)) {
            return propTypes_1.createCall(core_1.types.identifier('instanceOf'), [core_1.types.identifier(name)], propTypesImportedName);
            // inline references
        }
        else if (state.referenceTypes[name]) {
            return convert(state.referenceTypes[name], state, depth);
            // custom prop type variables
        }
        else if (propTypes_1.hasCustomPropTypeSuffix(name, state.options.customPropTypeSuffixes)) {
            return core_1.types.identifier(name);
            // external references (uses type checker)
        }
        else if (state.typeChecker) {
            return convertTSToPropTypes_1.convertSymbolFromSource(state.filePath, name, state);
        }
        // any (we need to support all these in case of unions)
        return propTypes_1.createMember(core_1.types.identifier('any'), propTypesImportedName);
        // [] -> PropTypes.arrayOf(), PropTypes.array
    }
    else if (core_1.types.isTSArrayType(type)) {
        const args = convertArray([type.elementType], state, depth);
        return args.length > 0
            ? propTypes_1.createCall(core_1.types.identifier('arrayOf'), args, propTypesImportedName)
            : propTypes_1.createMember(core_1.types.identifier('array'), propTypesImportedName);
        // {} -> PropTypes.object
        // { [key: string]: string } -> PropTypes.objectOf(PropTypes.string)
        // { foo: string } -> PropTypes.shape({ foo: PropTypes.string })
    }
    else if (core_1.types.isTSTypeLiteral(type)) {
        // object
        if (type.members.length === 0 || isMaxDepth) {
            return propTypes_1.createMember(core_1.types.identifier('object'), propTypesImportedName);
            // objectOf
        }
        else if (type.members.length === 1 && core_1.types.isTSIndexSignature(type.members[0])) {
            const index = type.members[0];
            if (index.typeAnnotation && index.typeAnnotation.typeAnnotation) {
                const result = convert(index.typeAnnotation.typeAnnotation, state, depth);
                if (result) {
                    return propTypes_1.createCall(core_1.types.identifier('objectOf'), [result], propTypesImportedName);
                }
            }
            // shape
        }
        else {
            return propTypes_1.createCall(core_1.types.identifier('shape'), [
                core_1.types.objectExpression(convertListToProps(type.members.filter(member => core_1.types.isTSPropertySignature(member)), state, [], depth + 1)),
            ], propTypesImportedName);
        }
        // string | number -> PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        // 'foo' | 'bar' -> PropTypes.oneOf(['foo', 'bar'])
    }
    else if (core_1.types.isTSUnionType(type) || core_1.types.isTSIntersectionType(type)) {
        const isAllLiterals = type.types.every(param => core_1.types.isTSLiteralType(param));
        const containsAny = type.types.some(param => core_1.types.isTSAnyKeyword(param));
        let label;
        let args;
        if (isAllLiterals) {
            args = type.types.map(param => param.literal);
            label = core_1.types.identifier('oneOf');
            if (state.options.maxSize) {
                args = args.slice(0, state.options.maxSize);
            }
        }
        else if (containsAny) {
            return propTypes_1.createMember(core_1.types.identifier('any'), propTypesImportedName);
        }
        else {
            args = convertArray(type.types, state, depth);
            label = core_1.types.identifier('oneOfType');
        }
        if (label && args.length > 0) {
            return propTypes_1.createCall(label, [core_1.types.arrayExpression(args)], propTypesImportedName);
        }
        // interface Foo {}
    }
    else if (core_1.types.isTSInterfaceDeclaration(type)) {
        if (type.body.body.length === 0 || isMaxDepth) {
            return propTypes_1.createMember(core_1.types.identifier('object'), propTypesImportedName);
        }
        return propTypes_1.createCall(core_1.types.identifier('shape'), [
            core_1.types.objectExpression(convertListToProps(type.body.body.filter(property => core_1.types.isTSPropertySignature(property)), state, [], depth + 1)),
        ], propTypesImportedName);
        // type Foo = {};
    }
    else if (core_1.types.isTSTypeAliasDeclaration(type)) {
        return convert(type.typeAnnotation, state, depth);
        // Type['prop']
    }
    else if (core_1.types.isTSIndexedAccessType(type)) {
        const { objectType, indexType } = type;
        if (core_1.types.isTSTypeReference(objectType) && core_1.types.isTSLiteralType(indexType)) {
            const ref = state.referenceTypes[objectType.typeName.name];
            let properties;
            if (core_1.types.isTSInterfaceDeclaration(ref)) {
                properties = ref.body.body;
            }
            else if (core_1.types.isTSTypeAliasDeclaration(ref) && core_1.types.isTSTypeLiteral(ref.typeAnnotation)) {
                properties = ref.typeAnnotation.members;
            }
            else {
                return null;
            }
            const property = properties.find(prop => core_1.types.isTSPropertySignature(prop) && prop.key.name === indexType.literal.value);
            return property ? convert(property.typeAnnotation.typeAnnotation, state, depth) : null;
        }
        // typeof foo
    }
    else if (core_1.types.isTSTypeQuery(type)) {
        return propTypes_1.createMember(core_1.types.identifier('any'), propTypesImportedName);
        // keyof foo
    }
    else if (core_1.types.isTSTypeOperator(type) && type.operator === 'keyof') {
        return propTypes_1.createMember(core_1.types.identifier('any'), propTypesImportedName);
    }
    state.propTypes.count -= 1;
    return null;
}
function mustBeOptional(type) {
    // Unions that contain undefined or null cannot be required by design
    if (core_1.types.isTSUnionType(type)) {
        return type.types.some(value => core_1.types.isTSAnyKeyword(value) || core_1.types.isTSNullKeyword(value) || core_1.types.isTSUndefinedKeyword(value));
    }
    return false;
}
function convertArray(types, state, depth) {
    const propTypes = [];
    types.forEach(type => {
        const prop = convert(type, state, depth);
        if (prop) {
            propTypes.push(prop);
        }
    });
    return propTypes;
}
function convertListToProps(properties, state, defaultProps, depth) {
    const propTypes = [];
    let hasChildren = false;
    let size = 0;
    properties.some(property => {
        if (state.options.maxSize && size === state.options.maxSize) {
            return true;
        }
        if (!property.typeAnnotation) {
            return false;
        }
        const type = property.typeAnnotation.typeAnnotation;
        const propType = convert(type, state, depth);
        const { name } = property.key;
        if (propType) {
            propTypes.push(core_1.types.objectProperty(property.key, propTypes_1.wrapIsRequired(propType, property.optional || defaultProps.includes(name) || mustBeOptional(type))));
            if (name === 'children') {
                hasChildren = true;
            }
            size += 1;
        }
        return false;
    });
    // Only append implicit children when the root list is being created
    if (!hasChildren && depth === 0 && propTypes.length > 0 && state.options.implicitChildren) {
        propTypes.push(core_1.types.objectProperty(core_1.types.identifier('children'), propTypes_1.createMember(core_1.types.identifier('node'), state.propTypes.defaultImport)));
    }
    return propTypes;
}
function convertToPropTypes(types, typeNames, state, defaultProps) {
    const properties = [];
    typeNames.forEach(typeName => {
        if (types[typeName]) {
            properties.push(...convertListToProps(types[typeName], state, defaultProps, 0));
        }
    });
    return properties;
}
exports.default = convertToPropTypes;
