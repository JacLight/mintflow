import ivm from 'isolated-vm';
import { logger } from './logger';

/**
 * runIsolatedCode:
 *  - Creates an isolate with a memory limit.
 *  - Creates a new context and sets the "input" variable.
 *  - Wraps user code in an IIFE that calls the exported function (default "main" if functionName is not provided).
 *  - Executes the code and returns the result.
 */
export async function runIsolatedCode(code: string, functionName: string | undefined, input: any) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 }); // 128 MB, adjust as needed
    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set('input', new ivm.ExternalCopy(input).copyInto());

    const actualFuncName = functionName || 'main';

    const wrappedCode = `
    (function() {
      ${code}
      if (typeof ${actualFuncName} !== 'function') {
        throw new Error("Function '${actualFuncName}' not found in user code");
      }
      return ${actualFuncName}(globalThis.input);
    })();
  `;

    logger.info('[Sandbox] Running code with isolate-vm', { functionName: actualFuncName });
    const script = await isolate.compileScript(wrappedCode);
    try {
        const resultRef = await script.run(context, { timeout: 5000 });
        return await resultRef.copy();
    } catch (err: any) {
        logger.error('[Sandbox] Error running code in isolate-vm', { error: err.message });
        throw err;
    }
}
