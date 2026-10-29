// Enforces the file and folder naming conventions in CONTRIBUTING.md. Run: npm run check:names
//
//   folders                  kebab-case             people-plus/, ui-kit/
//   React component files    PascalCase.tsx         AccountsPage.tsx   (one main component)
//   multi-component modules  kebab-case.tsx         data-table.tsx
//   hooks                    useThing.ts(x)         useDebounce.ts
//   everything else          kebab-case             client.ts, route-table.tsx, base.css
//
// Test files follow the file they test: AccountsPage.test.tsx, money.test.ts.
import fs from 'node:fs'
import path from 'node:path'

const roots = ['src', 'e2e', 'scripts']
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const PASCAL = /^[A-Z][A-Za-z0-9]*$/
const HOOK = /^use[A-Z][A-Za-z0-9]*$/
const IGNORED_DIRECTORIES = new Set(['node_modules'])

/** `data-table.test.tsx` -> { base: 'data-table', ext: 'tsx' } ; `schema.d.ts` -> base 'schema'. */
function split(name) {
  const [base, ...rest] = name.split('.')
  return { base, ext: rest[rest.length - 1] }
}

function fileProblem(name) {
  const { base, ext } = split(name)
  if (ext === 'tsx') {
    return KEBAB.test(base) || PASCAL.test(base) || HOOK.test(base)
      ? null
      : 'React files must be PascalCase.tsx (one component) or kebab-case.tsx (a module of several)'
  }
  return KEBAB.test(base) || HOOK.test(base)
    ? null
    : 'files must be kebab-case (hooks: useThing.ts)'
}

const problems = []
let checked = 0

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue
      if (!KEBAB.test(entry.name))
        problems.push(`${directory}/${entry.name}/: folders must be kebab-case`)
      walk(path.join(directory, entry.name))
    } else if (/\.(tsx?|css|mjs|js)$/.test(entry.name)) {
      checked += 1
      const problem = fileProblem(entry.name)
      if (problem) problems.push(`${path.join(directory, entry.name)}: ${problem}`)
    }
  }
}

for (const root of roots) if (fs.existsSync(root)) walk(root)

if (problems.length > 0) {
  console.error(`Naming convention violations (see CONTRIBUTING.md):\n${problems.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Verified naming of ${checked} files: all follow the conventions.`)
}
