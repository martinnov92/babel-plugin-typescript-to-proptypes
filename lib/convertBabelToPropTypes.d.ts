/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import { types as t } from '@babel/core';
import { TypePropertyMap, ConvertState } from './types';
export default function convertToPropTypes(types: TypePropertyMap, typeNames: string[], state: ConvertState, defaultProps: string[]): t.ObjectProperty[];
