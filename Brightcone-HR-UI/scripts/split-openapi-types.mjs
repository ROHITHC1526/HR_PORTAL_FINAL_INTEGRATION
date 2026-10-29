import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const schemaPath = 'src/api/schema.d.ts'
const modulesDirectory = 'src/api/schema'
let sourceText = fs.readFileSync(schemaPath, 'utf8')
let sourceFile = ts.createSourceFile(schemaPath, sourceText, ts.ScriptTarget.Latest, true)

function interfaceNode(name) {
  return sourceFile.statements.find(
    (statement) => ts.isInterfaceDeclaration(statement) && statement.name.text === name,
  )
}

function splitMembers(node, prefix, importLine) {
  const members = node.members.map((member) =>
    sourceText.slice(member.getStart(sourceFile), member.end),
  )
  const groups = []
  let group = []
  let lineCount = 2
  for (const member of members) {
    const size = member.split(/\r?\n/).length + 1
    if (group.length && lineCount + size > 300) {
      groups.push(group)
      group = []
      lineCount = 2
    }
    group.push(member)
    lineCount += size
  }
  if (group.length) groups.push(group)

  const names = groups.map((_, index) => `${prefix}${index + 1}`)
  const filePrefix = prefix === 'OperationGroup' ? 'operations' : 'paths'
  groups.forEach((items, index) => {
    const content = items
      .map((member) =>
        member
          .split(/\r?\n/)
          .map((line) => `  ${line}`)
          .join('\n'),
      )
      .join('\n')
    fs.writeFileSync(
      path.join(modulesDirectory, `${filePrefix}-${index + 1}.d.ts`),
      `${importLine}\n\nexport interface ${names[index]} {\n${content}\n}\n`,
    )
  })
  return names
}

fs.mkdirSync(modulesDirectory, { recursive: true })
for (const name of fs.readdirSync(modulesDirectory)) {
  if (/^(operations|paths)-\d+\.d\.ts$/.test(name)) fs.unlinkSync(path.join(modulesDirectory, name))
}

const operations = interfaceNode('operations')
if (!operations) throw new Error('Generated OpenAPI operations interface was not found.')
const operationGroups = splitMembers(
  operations,
  'OperationGroup',
  "import type { components } from '../schema'",
)
sourceText =
  sourceText.slice(0, operations.getStart(sourceFile)) +
  `export interface operations extends ${operationGroups.join(', ')} {}` +
  sourceText.slice(operations.end)

sourceFile = ts.createSourceFile(schemaPath, sourceText, ts.ScriptTarget.Latest, true)
const paths = interfaceNode('paths')
if (!paths) throw new Error('Generated OpenAPI paths interface was not found.')
const pathGroups = splitMembers(paths, 'PathGroup', "import type { operations } from '../schema'")
sourceText =
  sourceText.slice(0, paths.getStart(sourceFile)) +
  `export interface paths extends ${pathGroups.join(', ')} {}` +
  sourceText.slice(paths.end)

const imports = [
  ...operationGroups.map(
    (name, index) => `import type { ${name} } from './schema/operations-${index + 1}'`,
  ),
  ...pathGroups.map((name, index) => `import type { ${name} } from './schema/paths-${index + 1}'`),
]
const exportIndex = sourceText.indexOf('export interface paths')
if (exportIndex < 0) throw new Error('Generated OpenAPI paths interface was not found.')
fs.writeFileSync(
  schemaPath,
  `${sourceText.slice(0, exportIndex)}${imports.join('\n')}\n\n${sourceText.slice(exportIndex)}`,
)
