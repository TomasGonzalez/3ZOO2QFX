import structuredClonePolyfill from 'structured-clone';

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = structuredClonePolyfill;
}