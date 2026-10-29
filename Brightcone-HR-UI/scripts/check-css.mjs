// Finds CSS classes that no TypeScript or HTML file mentions. Run: npm run check:css
//
// - A hyphenated class (`pp-card`) counts as used when its name appears anywhere in src/**/*.ts(x)
//   or index.html.
// - A plain-word class (`main`, `top`, `row`) also appears in ordinary code, so it only counts
//   when it is inside a className / class attribute or is a quoted string such as 'ghost'.
// - Classes assembled at run time (for example `toast-${type}`) cannot be seen: list their prefix
//   in DYNAMIC_PREFIXES below, with a reason.
import fs from 'node:fs'
import path from 'node:path'

const DYNAMIC_PREFIXES = [
  // [prefix, reason]
  ['toast-', 'Toast.tsx builds `toast-${type}`'],
]

const cssFiles = []
const sourceText = []

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.css')) cssFiles.push(full)
    else if (/\.(tsx?|html)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      sourceText.push(fs.readFileSync(full, 'utf8'))
    }
  }
}
walk('src')
sourceText.push(fs.readFileSync('index.html', 'utf8'))

const allText = sourceText.join('\n')
const tokens = (text) => new Set(text.match(/[A-Za-z_][\w-]*/g) ?? [])
const words = tokens(allText)
const classAttributes = allText.match(/class(?:Name)?=(?:"[^"]*"|\{[^}]*\})/g) ?? []
const classWords = tokens(classAttributes.join(' '))

// Modifier classes are often chosen by a variable ('ghost', 'danger'), so a quoted literal counts too.
const quotedWords = new Set(
  [...allText.matchAll(/(['"`])([A-Za-z_][\w-]*)\1/g)].map((match) => match[2]),
)

const isDynamic = (name) => DYNAMIC_PREFIXES.some(([prefix]) => name.startsWith(prefix))
const isUsed = (name) =>
  name.includes('-') ? words.has(name) : classWords.has(name) || quotedWords.has(name)

const unused = []
for (const file of cssFiles) {
  const css = fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '') // comments
    .replace(/url\([^)]*\)/g, '') // data URIs and paths
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, '') // strings
  // Only selectors (the text before a `{`), not declarations.
  const selectors = css.match(/[^{}]+(?=\{)/g) ?? []
  const classes = new Set(
    selectors.flatMap((selector) =>
      [...selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]),
    ),
  )
  for (const name of classes) {
    if (!isUsed(name) && !isDynamic(name)) unused.push(`${file}: .${name}`)
  }
}

if (unused.length > 0) {
  console.error(
    `CSS classes not referenced by any source file (delete them, or list a dynamic prefix in scripts/check-css.mjs):\n${unused.join('\n')}`,
  )
  process.exitCode = 1
} else {
  console.log(`Verified ${cssFiles.length} CSS files: every class is used.`)
}
