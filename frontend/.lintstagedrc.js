import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const mapFilenames = filenames =>
  filenames.map(f => `"${path.relative(__dirname, f)}"`).join(' ')
const buildEslintCommand = filenames =>
  `eslint --fix --max-warnings=0 ${mapFilenames(filenames)}`
const buildPrettierCommand = filenames =>
  `prettier --write ${mapFilenames(filenames)}`

export default {
  '*.{ts,tsx}': () => 'tsc --noEmit',
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, buildPrettierCommand],
  '*.{json,md}': [buildPrettierCommand]
}
