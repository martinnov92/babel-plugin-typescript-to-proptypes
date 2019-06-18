/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import { types as t, traverse } from '@babel/core';
import ts from 'typescript';
export declare type Path<N> = traverse.NodePath<N>;
export interface TypePropertyMap {
    [key: string]: t.TSPropertySignature[];
}
export declare type PropType = t.MemberExpression | t.CallExpression | t.Identifier;
export interface PluginOptions {
    customPropTypeSuffixes?: string[];
    forbidExtraProps?: boolean;
    implicitChildren?: boolean;
    maxDepth?: number;
    maxSize?: number;
    typeCheck?: boolean | string;
}
export interface ConvertState {
    airbnbPropTypes: {
        count: number;
        forbidImport: string;
        hasImport: boolean;
        namedImports: string[];
    };
    componentTypes: TypePropertyMap;
    filePath: string;
    options: Required<PluginOptions>;
    propTypes: {
        count: number;
        defaultImport: string;
        hasImport: boolean;
    };
    reactImportedName: string;
    referenceTypes: {
        [key: string]: t.TSInterfaceDeclaration | t.TSTypeAliasDeclaration;
    };
    typeChecker?: ts.TypeChecker;
    typeProgram?: ts.Program;
}
