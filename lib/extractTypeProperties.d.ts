/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import { types as t } from '@babel/core';
import { TypePropertyMap } from './types';
export default function extractTypeProperties(node: any, types: TypePropertyMap): t.TSPropertySignature[];
