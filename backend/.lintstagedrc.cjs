const path = require('node:path')

const mapFilenames = filenames => filenames.map(f => `"${path.relative(__dirname, f)}"`).join(' ')
const buildEslintCommand = filenames => `eslint --fix --max-warnings=0 ${mapFilenames(filenames)}`
const buildPrettierCommand = filenames => `prettier --write ${mapFilenames(filenames)}`

module.exports = {
  '*.ts': () => 'tsc --noEmit -p tsconfig.build.json',
  '*.{js,ts}': [buildEslintCommand, buildPrettierCommand],
  '*.{json,md}': [buildPrettierCommand]
}
