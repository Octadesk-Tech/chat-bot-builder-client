export interface CodeValidationResult {
  valid: boolean
  violations: string[]
}

// Mirror of chat-bot-service's server-side blocklist (actions/set-variable-code/code-validator.ts).
// Client-side it is instant feedback only; the server validates again and the isolate is the gate.
const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /process\s*[.[]/, label: 'process' },
  { pattern: /require\s*\(/, label: 'require()' },
  { pattern: /import\s*\(/, label: 'import()' },
  { pattern: /global(This)?\b/, label: 'global/globalThis' },
  { pattern: /child_process/, label: 'child_process' },
  { pattern: /\beval\s*\(/, label: 'eval()' },
  { pattern: /\bFunction\s*\(/, label: 'Function()' },
  { pattern: /__proto__/, label: '__proto__' },
  { pattern: /constructor\s*\[/, label: 'constructor[...]' },
  { pattern: /Proxy\s*\(/, label: 'Proxy' },
  { pattern: /Reflect\s*\./, label: 'Reflect' },
  { pattern: /\.env\b/, label: '.env' },
]

export const validateCode = (code: string): CodeValidationResult => {
  const violations = FORBIDDEN_PATTERNS.filter((f) => f.pattern.test(code)).map(
    (f) => f.label
  )

  return { valid: violations.length === 0, violations }
}

const LOOP_WARNINGS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /while\s*\(\s*true\s*\)/, label: 'while(true)' },
  { pattern: /while\s*\(\s*1\s*\)/, label: 'while(1)' },
  { pattern: /for\s*\(\s*;\s*;\s*\)/, label: 'for(;;)' },
]

export const detectSuspiciousLoops = (code: string): string[] =>
  LOOP_WARNINGS.filter((f) => f.pattern.test(code)).map((f) => f.label)
