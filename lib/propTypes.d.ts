/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import { types as t } from '@babel/core';
import { ConvertState, PropType } from './types';
export declare function hasCustomPropTypeSuffix(name: string, suffixes?: string[]): boolean;
export declare function isReactTypeMatch(name: string, type: string, reactImportedName: string): boolean;
export declare function wrapIsRequired(propType: PropType, optional?: boolean | null): PropType;
export declare function createMember(value: t.Identifier, propTypesImportedName: string): t.MemberExpression;
export declare function createCall(value: t.Identifier, args: (PropType | t.ArrayExpression | t.ObjectExpression)[], propTypesImportedName: string): t.CallExpression;
export declare function createPropTypesObject(propTypes: t.ObjectProperty[], state: ConvertState): t.CallExpression | t.ObjectExpression;
export declare function mergePropTypes(expr: any, propTypes: t.ObjectProperty[], state: ConvertState, wrapForbid?: boolean): t.CallExpression | t.ObjectExpression;
export declare function getInstalledPropTypesVersion(): number;
