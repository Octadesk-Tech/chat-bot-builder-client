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
  { pattern: /\bfetch\s*\(/, label: 'fetch()' },
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

const PREDICATE_METHODS =
  /\.(find|filter|some|every|findIndex|findLast)\s*\(\s*\(?\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>/g

// `find(i => i.id = 'x')` assigns instead of comparing, so the predicate is always truthy and
// `find` returns the first element — a frequent silent bug in user code. `===`, `==`, `!==`,
// `<=` and `>=` don't match (the `=` is either preceded by an operator or followed by `=`).
export const detectPredicateAssignments = (code: string): string[] => {
  const warnings: string[] = []

  PREDICATE_METHODS.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = PREDICATE_METHODS.exec(code)) !== null) {
    const [, method, param] = match
    const body = code.slice(
      PREDICATE_METHODS.lastIndex,
      PREDICATE_METHODS.lastIndex + 200
    )
    const assignment = new RegExp(
      `\\b${param}\\s*(?:\\.\\w+|\\[[^\\]]*\\])\\s*=(?!=)`
    )
    if (assignment.test(body)) warnings.push(`${method}(${param} => ...)`)
  }

  return warnings
}
