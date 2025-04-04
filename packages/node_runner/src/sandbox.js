const ivm = require('isolated-vm');
const { logger } = require('./logger');

/**
 * runIsolatedCode:
 *  - Creates an isolate with a memory limit.
 *  - Creates a new context and sets the "input" variable.
 *  - Wraps user code in an IIFE that calls the exported function (default "main" if functionName is not provided).
 *  - Executes the code and returns the result.
 */
async function runIsolatedCode(code, functionName = 'main', input) {
    const isolate = new ivm.Isolate({ memoryLimit: 128 }); // 128 MB, adjust as needed
    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set('input', new ivm.ExternalCopy(input).copyInto());

    const actualFuncName = functionName || 'main';

    // Transform ES module syntax to CommonJS
    const transformedCode = transformEsModules(code);

    const wrappedCode = `
    (function() {
      ${transformedCode}
      if (typeof ${actualFuncName} !== 'function') {
        throw new Error("Function '${actualFuncName}' not found in user code");
      }
      return ${actualFuncName}(globalThis.input);
    })();
  `;

    logger.info(`Running code with isolate-vm`, { functionName: actualFuncName });
    const script = await isolate.compileScript(wrappedCode);
    try {
        const resultRef = await script.run(context, { timeout: 5000 });
        if (resultRef === undefined) {
            logger.warn('Script returned undefined, returning empty object');
            return {};
        }
        return await resultRef.copy();
    } catch (err) {
        logger.error(`Error running code in isolate-vm`, { error: err.message });
        throw err;
    }
}

/**
 * Transform ES module syntax to a format that works in the sandbox
 * This is a simple transformation that handles basic cases
 */
function transformEsModules(code) {
    // For imports, we'll just remove them since we're running in an isolated environment
    // and we're only interested in the plugin's actions
    let transformed = code.replace(/import\s+{\s*([^}]*)\s*}\s*from\s+['"]([^'"]+)['"]/g, '// Import removed');
    transformed = transformed.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, '// Import removed');
    
    // Replace export statements
    transformed = transformed.replace(/export\s+const\s+(\w+)/g, 'const $1');
    transformed = transformed.replace(/export\s+function\s+(\w+)/g, 'function $1');
    transformed = transformed.replace(/export\s+default\s+/g, '');
    
    return transformed;
}

module.exports = {
    runIsolatedCode
};
