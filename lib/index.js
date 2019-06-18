"use strict";
/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_plugin_utils_1 = require("@babel/helper-plugin-utils");
const helper_module_imports_1 = require("@babel/helper-module-imports");
const plugin_syntax_typescript_1 = __importDefault(require("@babel/plugin-syntax-typescript"));
const core_1 = require("@babel/core");
const addToClass_1 = __importDefault(require("./addToClass"));
const addToFunctionOrVar_1 = __importDefault(require("./addToFunctionOrVar"));
const extractTypeProperties_1 = __importDefault(require("./extractTypeProperties"));
const typeChecker_1 = require("./typeChecker");
const upsertImport_1 = __importDefault(require("./upsertImport"));
const BABEL_VERSION = 7;
const MAX_DEPTH = 3;
const MAX_SIZE = 25;
const REACT_FC_NAMES = ['SFC', 'StatelessComponent', 'FC', 'FunctionComponent'];
function isNotTS(name) {
    return name.endsWith('.js') || name.endsWith('.jsx');
}
function isComponentName(name) {
    return !!name.match(/^[A-Z]/u);
}
function isPropsParam(param) {
    return (
    // (props: Props)
    (core_1.types.isIdentifier(param) && !!param.typeAnnotation) ||
        // ({ ...props }: Props)
        (core_1.types.isObjectPattern(param) && !!param.typeAnnotation));
}
exports.default = helper_plugin_utils_1.declare((api, options, root) => {
    api.assertVersion(BABEL_VERSION);
    return {
        inherits: plugin_syntax_typescript_1.default,
        manipulateOptions(opts, parserOptions) {
            // Some codebases are only partially TypeScript, so we need to support
            // regular JS and JSX files, otherwise the Babel parser blows up.
            parserOptions.plugins.push('jsx');
        },
        post() {
            // Free up any memory we're hogging
            this.state = null;
        },
        pre() {
            // Setup initial state
            this.state = {
                airbnbPropTypes: {
                    count: 0,
                    forbidImport: '',
                    hasImport: false,
                    namedImports: [],
                },
                componentTypes: {},
                filePath: '',
                options: Object.assign({ customPropTypeSuffixes: [], forbidExtraProps: false, maxDepth: MAX_DEPTH, maxSize: MAX_SIZE, typeCheck: false }, options),
                propTypes: {
                    count: 0,
                    defaultImport: '',
                    hasImport: false,
                },
                reactImportedName: '',
                referenceTypes: {},
            };
        },
        visitor: {
            Program: {
                enter(programPath, { filename }) {
                    const state = this.state;
                    state.filePath = filename;
                    if (isNotTS(filename)) {
                        return;
                    }
                    if (options.typeCheck) {
                        state.typeProgram = typeChecker_1.loadProgram(options.typeCheck, root);
                        state.typeChecker = state.typeProgram.getTypeChecker();
                    }
                    // Find existing `react` and `prop-types` imports
                    programPath.node.body.forEach(node => {
                        if (!core_1.types.isImportDeclaration(node)) {
                            return;
                        }
                        if (node.source.value === 'prop-types') {
                            const response = upsertImport_1.default(node, {
                                checkForDefault: 'PropTypes',
                            });
                            state.propTypes.hasImport = true;
                            state.propTypes.defaultImport = response.defaultImport;
                        }
                        if (node.source.value === 'airbnb-prop-types') {
                            const response = upsertImport_1.default(node, { checkForNamed: 'forbidExtraProps' });
                            state.airbnbPropTypes.hasImport = true;
                            state.airbnbPropTypes.namedImports = response.namedImports;
                            state.airbnbPropTypes.forbidImport = response.namedImport;
                        }
                        if (node.source.value === 'react') {
                            const response = upsertImport_1.default(node, {
                                checkForDefault: 'React',
                            });
                            state.reactImportedName = response.defaultImport;
                        }
                    });
                    // Add `prop-types` import if it does not exist.
                    // We need to do this without a visitor as we need to modify
                    // the AST before anything else has can run.
                    if (!state.propTypes.hasImport && state.reactImportedName) {
                        state.propTypes.defaultImport = helper_module_imports_1.addDefault(programPath, 'prop-types', {
                            nameHint: 'pt',
                        }).name;
                    }
                    if (!state.airbnbPropTypes.hasImport &&
                        state.reactImportedName &&
                        options.forbidExtraProps) {
                        state.airbnbPropTypes.forbidImport = helper_module_imports_1.addNamed(programPath, 'forbidExtraProps', 'airbnb-prop-types').name;
                        state.airbnbPropTypes.count += 1;
                    }
                    // Abort early if we're definitely not in a file that needs conversion
                    if (!state.propTypes.defaultImport && !state.reactImportedName) {
                        return;
                    }
                    const transformers = [];
                    programPath.traverse({
                        // airbnbPropTypes.componentWithName()
                        CallExpression({ node }) {
                            const { namedImports } = state.airbnbPropTypes;
                            if (options.forbidExtraProps &&
                                core_1.types.isIdentifier(node.callee) &&
                                namedImports.includes(node.callee.name)) {
                                state.airbnbPropTypes.count += 1;
                            }
                        },
                        // `class Foo extends React.Component<Props> {}`
                        // @ts-ignore
                        'ClassDeclaration|ClassExpression': (path) => {
                            const { node } = path;
                            // prettier-ignore
                            const valid = node.superTypeParameters && (
                            // React.Component, React.PureComponent
                            (core_1.types.isMemberExpression(node.superClass) &&
                                core_1.types.isIdentifier(node.superClass.object, { name: state.reactImportedName }) && (core_1.types.isIdentifier(node.superClass.property, { name: 'Component' }) ||
                                core_1.types.isIdentifier(node.superClass.property, { name: 'PureComponent' }))) ||
                                // Component, PureComponent
                                (state.reactImportedName && (core_1.types.isIdentifier(node.superClass, { name: 'Component' }) ||
                                    core_1.types.isIdentifier(node.superClass, { name: 'PureComponent' }))));
                            if (valid) {
                                transformers.push(() => addToClass_1.default(node, state));
                            }
                        },
                        // `function Foo(props: Props) {}`
                        FunctionDeclaration(path) {
                            const { node } = path;
                            const valid = !!state.reactImportedName &&
                                isComponentName(node.id.name) &&
                                isPropsParam(node.params[0]);
                            if (valid) {
                                transformers.push(() => addToFunctionOrVar_1.default(path, node.id.name, state));
                            }
                        },
                        // airbnbPropTypes.nonNegativeInteger
                        Identifier({ node }) {
                            const { namedImports } = state.airbnbPropTypes;
                            if (options.forbidExtraProps && namedImports.includes(node.name)) {
                                state.airbnbPropTypes.count += 1;
                            }
                        },
                        // PropTypes.*
                        MemberExpression({ node }) {
                            if (core_1.types.isIdentifier(node.object, { name: state.propTypes.defaultImport })) {
                                state.propTypes.count += 1;
                            }
                        },
                        // `interface FooProps {}`
                        TSInterfaceDeclaration({ node }) {
                            state.componentTypes[node.id.name] = extractTypeProperties_1.default(node, state.componentTypes);
                            state.referenceTypes[node.id.name] = node;
                        },
                        // `type FooProps = {}`
                        TSTypeAliasDeclaration({ node }) {
                            state.componentTypes[node.id.name] = extractTypeProperties_1.default(node, state.componentTypes);
                            state.referenceTypes[node.id.name] = node;
                        },
                        // `const Foo = (props: Props) => {};`
                        // `const Foo: React.FC<Props> = () => {};`
                        VariableDeclaration(path) {
                            const { node } = path;
                            if (node.declarations.length === 0) {
                                return;
                            }
                            const decl = node.declarations[0];
                            const id = decl.id;
                            let valid = false;
                            // const Foo: React.FC<Props> = () => {};
                            if (id.typeAnnotation && id.typeAnnotation.typeAnnotation) {
                                const type = id.typeAnnotation.typeAnnotation;
                                // prettier-ignore
                                valid = core_1.types.isTSTypeReference(type) &&
                                    !!type.typeParameters &&
                                    type.typeParameters.params.length > 0 && (
                                // React.FC, React.FunctionComponent
                                (core_1.types.isTSQualifiedName(type.typeName) &&
                                    core_1.types.isIdentifier(type.typeName.left, { name: state.reactImportedName }) &&
                                    REACT_FC_NAMES.some(name => core_1.types.isIdentifier(type.typeName.right, { name }))) ||
                                    // FC, FunctionComponent
                                    (!!state.reactImportedName &&
                                        REACT_FC_NAMES.some(name => core_1.types.isIdentifier(type.typeName, { name }))));
                                // const Foo = (props: Props) => {};
                            }
                            else if (core_1.types.isArrowFunctionExpression(decl.init)) {
                                valid =
                                    !!state.reactImportedName &&
                                        isComponentName(id.name) &&
                                        isPropsParam(decl.init.params[0]);
                            }
                            if (valid) {
                                transformers.push(() => addToFunctionOrVar_1.default(path, id.name, state));
                            }
                        },
                    });
                    // After we have extracted all our information, run all transformers
                    transformers.forEach(transformer => {
                        transformer();
                    });
                },
                exit(path, { filename }) {
                    const state = this.state;
                    if (isNotTS(filename)) {
                        return;
                    }
                    // Remove the `prop-types` import of no components exist,
                    // and be sure not to remove pre-existing imports.
                    path.get('body').forEach(bodyPath => {
                        if (state.propTypes.count === 0 &&
                            core_1.types.isImportDeclaration(bodyPath.node) &&
                            bodyPath.node.source.value === 'prop-types') {
                            bodyPath.remove();
                        }
                    });
                },
            },
        },
    };
});
