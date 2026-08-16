import fs from 'node:fs'
import path from 'node:path'

const [, , targetRoute, targetGroup] = process.argv

if (!targetRoute || !targetGroup) {
  console.error(
    '\nUsage:\n' +
      'node scripts/create-group-pages.mjs <route> <group>\n\n' +
      'Example:\n' +
      'node scripts/create-group-pages.mjs bipc BiPC\n'
  )
  process.exit(1)
}

const projectRoot = process.cwd()

const sourceRoot = path.join(
  projectRoot,
  'src',
  'app',
  'dashboards',
  'mandat'
)

const targetRoot = path.join(
  projectRoot,
  'src',
  'app',
  'dashboards',
  targetRoute
)

// Only copy dedicated pages.
// Do NOT copy [section] or main page.jsx.
const pageFolders = [
  'attendance',
  'absentees',
  'consecutive-absentees',
  'monthly',
  'attendance-below-75',
  'students',
  'edit',
  'fees',
]

function replaceTemplateValues(content) {
  return content
    .replaceAll('M&AT', targetGroup)
    .replaceAll('mandat', targetRoute)
    .replaceAll('/dashboards/mandat', `/dashboards/${targetRoute}`)
}

function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })

  const entries = fs.readdirSync(sourceDir, {
    withFileTypes: true,
  })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath)
      continue
    }

    if (!entry.name.endsWith('.jsx') && !entry.name.endsWith('.js')) {
      fs.copyFileSync(sourcePath, targetPath)
      continue
    }

    const content = fs.readFileSync(sourcePath, 'utf8')
    const updatedContent = replaceTemplateValues(content)

    fs.writeFileSync(targetPath, updatedContent, 'utf8')
  }
}

console.log('\n🚀 OSRA Group Page Template Migration')
console.log('--------------------------------------')
console.log(`Source : ${sourceRoot}`)
console.log(`Target : ${targetRoot}`)
console.log(`Group  : ${targetGroup}`)
console.log(`Route  : ${targetRoute}`)
console.log('')

if (!fs.existsSync(sourceRoot)) {
  console.error('❌ Source M&AT dashboard not found.')
  process.exit(1)
}

if (!fs.existsSync(targetRoot)) {
  console.error(`❌ Target group "${targetRoute}" does not exist.`)
  process.exit(1)
}

for (const folder of pageFolders) {
  const sourceDir = path.join(sourceRoot, folder)
  const targetDir = path.join(targetRoot, folder)

  if (!fs.existsSync(sourceDir)) {
    console.warn(`⚠️ Source folder missing: ${folder}`)
    continue
  }

  console.log(`📁 Copying ${folder}...`)
  copyDirectory(sourceDir, targetDir)
  console.log(`   ✅ ${folder}`)
}

console.log('\n🎉 Migration completed successfully!')
console.log('')
console.log('Created/updated pages:')

for (const folder of pageFolders) {
  console.log(`  → /dashboards/${targetRoute}/${folder}`)
}

console.log('')
console.log('⚠️ Next:')
console.log('1. Check generated pages')
console.log('2. Run npm run build')
console.log('3. Test the target dashboard')
console.log('')