/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import ts from "typescript";
import { ConvertState, PropType } from "./types";
export declare function convert(type: ts.Type, state: ConvertState, depth: number): PropType | null;
export declare function convertSymbolFromSource(filePath: string, symbolName: string, state: ConvertState): PropType | null;
