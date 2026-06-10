import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

const parseRequiredViteEnvKeys = (fileContent) => {
  const keys = fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.split('=')[0]?.trim())
    .filter((key) => typeof key === 'string' && key.startsWith('VITE_'))

  return Array.from(new Set(keys))
}

const envExamplePath = resolve(process.cwd(), '.env.example')
const envExampleContent = readFileSync(envExamplePath, 'utf-8')
const requiredKeys = parseRequiredViteEnvKeys(envExampleContent)
const requiredKeysValue = requiredKeys.join(',')
const viteArgs = process.argv.slice(2)
const require = createRequire(import.meta.url)
const vitePackageJsonPath = require.resolve('vite/package.json')
const viteBinPath = resolve(vitePackageJsonPath, '../bin/vite.js')

const child = spawn(process.execPath, [viteBinPath, ...viteArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_REQUIRED_ENV_KEYS: requiredKeysValue,
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
