/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import { types as t } from '@babel/core';
import { Path, ConvertState } from './types';
export default function addToFunctionOrVar(path: Path<t.FunctionDeclaration | t.VariableDeclaration>, name: string, state: ConvertState): void;
