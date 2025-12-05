import 'reflect-metadata';

// Suppress Node.js warnings during tests
const originalEmitWarning = process.emitWarning.bind(process);
process.emitWarning = (warning: string | Error, ...args: unknown[]) => {
  if (typeof warning === 'string' && warning.includes('localstorage-file')) {
    return;
  }
  originalEmitWarning(warning, ...args);
};
