/**
 * @copyright   2018-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */
import ts from 'typescript';
export declare function loadTSConfig(): ts.CompilerOptions;
export declare function loadProgram(pattern: true | string, root: string): ts.Program;
