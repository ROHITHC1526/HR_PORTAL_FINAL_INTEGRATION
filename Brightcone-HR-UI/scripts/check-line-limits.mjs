import fs from 'node:fs'
import path from 'node:path'

const maximumLines = 400
const includedExtensions = new Set(['.css', '.html', '.js', '.jsx', '.mjs', '.ts', '.tsx'])
const roots = ['src', 'scripts', 'e2e']
const rootFiles = ['index.html', 'vite.config.ts', 'playwright.config.ts']
const files = [...rootFiles]

function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) collectFiles(entryPath)
    else if (includedExtensions.has(path.extname(entry.name))) files.push(entryPath)
  }
}

for (const directory of roots) collectFiles(directory)

const violations = files.flatMap((file) => {
  const lineCount = fs.readFileSync(file, 'utf8').split(/\r\n|\r|\n/).length
  return lineCount > maximumLines ? [`${file}: ${lineCount} lines`] : []
})

if (violations.length > 0) {
  console.error(`Source files must not exceed ${maximumLines} lines:\n${violations.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Verified ${files.length} source files: all are at most ${maximumLines} lines.`)
}
