"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
const core_1 = require("@babel/core");
const typescript_1 = __importDefault(require("typescript"));
const propTypes_1 = require("./propTypes");
function convert(type, state, depth) {
    const { reactImportedName, propTypes } = state;
    const propTypesImportedName = propTypes.defaultImport;
    const isMaxDepth = depth >= (state.options.maxDepth || 3);
    // Remove wrapping parens
    // if (ts.isParenthesizedExpression(type)) {
    //   type = type.typeAnnotation;
    // }
    state.propTypes.count += 1;
    // any -> PropTypes.any
    if (type.flags & typescript_1.default.TypeFlags.Any) {
        return propTypes_1.createMember(core_1.types.identifier("any"), propTypesImportedName);
        // string -> PropTypes.string
    }
    else if (type.flags & typescript_1.default.TypeFlags.StringLike) {
        return propTypes_1.createMember(core_1.types.identifier("string"), propTypesImportedName);
        // number -> PropTypes.number
    }
    else if (type.flags & typescript_1.default.TypeFlags.NumberLike) {
        return propTypes_1.createMember(core_1.types.identifier("number"), propTypesImportedName);
        // boolean -> PropTypes.bool
    }
    else if (type.flags & typescript_1.default.TypeFlags.BooleanLike) {
        return propTypes_1.createMember(core_1.types.identifier("bool"), propTypesImportedName);
        // symbol -> PropTypes.symbol
    }
    else if (type.flags & typescript_1.default.TypeFlags.ESSymbolLike) {
        return propTypes_1.createMember(core_1.types.identifier("symbol"), propTypesImportedName);
        // object -> PropTypes.object
    }
    else if (type.flags & typescript_1.default.TypeFlags.Object) {
        const objType = type;
        if (objType.objectFlags & typescript_1.default.ObjectFlags.Interface) {
            // TODO
        }
        else if (objType.objectFlags & typescript_1.default.ObjectFlags.Reference) {
            // TODO
        }
        else if (objType.objectFlags & typescript_1.default.ObjectFlags.Tuple) {
            // TODO
        }
        else if (objType.objectFlags & typescript_1.default.ObjectFlags.Mapped) {
            // TODO
        }
        else if (objType.objectFlags & typescript_1.default.ObjectFlags.Instantiated) {
            // TODO
        }
        else if (objType.objectFlags & typescript_1.default.ObjectFlags.ObjectLiteral) {
            // TODO
        }
        // mn3: PROOF OF CONCEPT
        const _propTypes = [];
        objType.symbol.members.forEach(member => {
            const propType = convert(member, state, depth);
            if (propType) {
                _propTypes.push(core_1.types.objectProperty(core_1.types.identifier(member.escapedName), propType));
            }
        });
        return propTypes_1.createCall(core_1.types.identifier("shape"), [core_1.types.objectExpression(_propTypes)], propTypesImportedName);
        // (() => void) -> PropTypes.func
        // TODO
    }
    else if (type.flags & typescript_1.default.TypeFlags.Any) {
        return propTypes_1.createMember(core_1.types.identifier("func"), propTypesImportedName);
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
        const name = ""; // getTypeName(type.typeName);
        // node
        if (propTypes_1.isReactTypeMatch(name, "ReactText", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "ReactNode", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "ReactType", reactImportedName)) {
            return propTypes_1.createMember(core_1.types.identifier("node"), propTypesImportedName);
            // function
        }
        else if (propTypes_1.isReactTypeMatch(name, "ComponentType", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "ComponentClass", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "StatelessComponent", reactImportedName)) {
            return propTypes_1.createMember(core_1.types.identifier("func"), propTypesImportedName);
            // element
        }
        else if (propTypes_1.isReactTypeMatch(name, "Element", "JSX") ||
            propTypes_1.isReactTypeMatch(name, "ReactElement", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "ComponentElement", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "FunctionComponentElement", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "DOMElement", reactImportedName) ||
            propTypes_1.isReactTypeMatch(name, "SFCElement", reactImportedName)) {
            return propTypes_1.createMember(core_1.types.identifier("element"), propTypesImportedName);
            // oneOfType
        }
        else if (propTypes_1.isReactTypeMatch(name, "Ref", reactImportedName)) {
            return propTypes_1.createCall(core_1.types.identifier("oneOfType"), [
                core_1.types.arrayExpression([
                    propTypes_1.createMember(core_1.types.identifier("string"), propTypesImportedName),
                    propTypes_1.createMember(core_1.types.identifier("func"), propTypesImportedName),
                    propTypes_1.createMember(core_1.types.identifier("object"), propTypesImportedName)
                ])
            ], propTypesImportedName);
            // function
        }
        else if (name.endsWith("Handler")) {
            return propTypes_1.createMember(core_1.types.identifier("func"), propTypesImportedName);
            // object
        }
        else if (name.endsWith("Event")) {
            return propTypes_1.createMember(core_1.types.identifier("object"), propTypesImportedName);
            // native built-ins
            // } else if (NATIVE_BUILT_INS.includes(name)) {
            //   return createCall(t.identifier('instanceOf'), [t.identifier(name)], propTypesImportedName);
            // inline references
            // } else if (state.referenceTypes[name]) {
            //   return convert(state.referenceTypes[name], state, depth);
            // custom prop type variables
        }
        else if (propTypes_1.hasCustomPropTypeSuffix(name, state.options.customPropTypeSuffixes)) {
            return core_1.types.identifier(name);
            // external references (uses type checker)
        }
        else if (state.typeChecker) {
            return convertSymbolFromSource(state.filePath, name, state);
        }
        // any (we need to support all these in case of unions)
        return propTypes_1.createMember(core_1.types.identifier("any"), propTypesImportedName);
        // [] -> PropTypes.arrayOf(), PropTypes.array
    }
    else if (core_1.types.isTSArrayType(type)) {
        // const args = convertArray([type.elementType], state, depth);
        // return args.length > 0
        //   ? createCall(t.identifier('arrayOf'), args, propTypesImportedName)
        //   : createMember(t.identifier('array'), propTypesImportedName);
        // {} -> PropTypes.object
        // { [key: string]: string } -> PropTypes.objectOf(PropTypes.string)
        // { foo: string } -> PropTypes.shape({ foo: PropTypes.string })
    }
    else if (core_1.types.isTSTypeLiteral(type)) {
        // object
        if (type.members.length === 0 || isMaxDepth) {
            return propTypes_1.createMember(core_1.types.identifier("object"), propTypesImportedName);
            // objectOf
        }
        else if (type.members.length === 1 &&
            core_1.types.isTSIndexSignature(type.members[0])) {
            // const index = type.members[0] as t.TSIndexSignature;
            // if (index.typeAnnotation && index.typeAnnotation.typeAnnotation) {
            //   const result = convert(index.typeAnnotation.typeAnnotation, state, depth);
            //   if (result) {
            //     return createCall(t.identifier('objectOf'), [result], propTypesImportedName);
            //   }
            // }
            // shape
        }
        else {
            // return createCall(
            //   t.identifier('shape'),
            //   [
            //     t.objectExpression(
            //       convertListToProps(
            //         type.members.filter(member =>
            //           t.isTSPropertySignature(member),
            //         ) as t.TSPropertySignature[],
            //         state,
            //         [],
            //         depth + 1,
            //       ),
            //     ),
            //   ],
            //   propTypesImportedName,
            // );
        }
        // string | number -> PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        // 'foo' | 'bar' -> PropTypes.oneOf(['foo', 'bar'])
    }
    else if (core_1.types.isTSUnionType(type) || core_1.types.isTSIntersectionType(type)) {
        // const isAllLiterals = type.types.every(param => t.isTSLiteralType(param));
        // let label;
        // let args;
        // if (isAllLiterals) {
        //   args = type.types.map(param => (param as t.TSLiteralType).literal);
        //   label = t.identifier('oneOf');
        // } else {
        //   args = convertArray(type.types, state, depth);
        //   label = t.identifier('oneOfType');
        // }
        // if (label && args.length > 0) {
        //   return createCall(label, [t.arrayExpression(args)], propTypesImportedName);
        // }
        // interface Foo {}
    }
    else if (core_1.types.isTSInterfaceDeclaration(type)) {
        // if (type.body.body.length === 0 || isMaxDepth) {
        //   return createMember(t.identifier('object'), propTypesImportedName);
        // }
        // return createCall(
        //   t.identifier('shape'),
        //   [
        //     t.objectExpression(
        //       convertListToProps(
        //         type.body.body.filter(property =>
        //           t.isTSPropertySignature(property),
        //         ) as t.TSPropertySignature[],
        //         state,
        //         [],
        //         depth + 1,
        //       ),
        //     ),
        //   ],
        //   propTypesImportedName,
        // );
        // type Foo = {};
    }
    else if (core_1.types.isTSTypeAliasDeclaration(type)) {
        // return convert(type.typeAnnotation, state, depth);
    }
    state.propTypes.count -= 1;
    return null;
}
exports.convert = convert;
function convertSymbolFromSource(filePath, symbolName, state) {
    const program = state.typeProgram;
    const checker = state.typeChecker;
    const source = program.getSourceFile(filePath);
    if (!source) {
        return null;
    }
    let refNode = null;
    // Type references we're looking for are always from imports
    source.statements.some(node => {
        if (typescript_1.default.isImportDeclaration(node) && node.importClause) {
            const { name, namedBindings } = node.importClause;
            if (name && name.text === symbolName) {
                refNode = name;
                return true;
            }
            if (!refNode && namedBindings && typescript_1.default.isNamedImports(namedBindings)) {
                return namedBindings.elements.some(element => {
                    if (element.name.text === symbolName) {
                        refNode = element.name;
                        return true;
                    }
                    return false;
                });
            }
        }
        return false;
    });
    if (!refNode) {
        return null;
    }
    // ------------------------------------------------------------------------
    const symbol = checker.getSymbolAtLocation(refNode);
    if (!symbol) {
        return null;
    }
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    if (!type) {
        return null;
    }
    // const declarations = type.getSymbol().getDeclarations();
    // for (let x = 0; x < declarations.length; x++) {
    // 	const declaration = declarations[x];
    // for (let y = 0; y < members.length; y++) {
    //   	const member = members[y];
    // d.members.forEach((m) => console.log(m.symbol.flags, typescript_1.default.TypeFlags.StringLike, m.symbol.flags & typescript_1.default.TypeFlags.StringLike))
    // }
    // }
    return convert(type, state, state.options.maxDepth);
}
exports.convertSymbolFromSource = convertSymbolFromSource;
