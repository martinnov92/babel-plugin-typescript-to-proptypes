/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import { types as t } from '@babel/core';
interface Response {
    defaultImport: string;
    namedImport: string;
    namedImports: string[];
}
interface UpsertOptions {
    checkForDefault?: string;
    checkForNamed?: string;
}
export default function upsertImport(imp: t.ImportDeclaration, options?: UpsertOptions): Response;
export {};
