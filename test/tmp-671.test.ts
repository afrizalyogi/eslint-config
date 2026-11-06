import { ESLint } from 'eslint'
import { expect, it } from 'vitest'
import { antfu } from '../src'

// temporary check for #671, not for upstream
it('svelte 5 $props does not report errors', async () => {
  const configs = await antfu({
    svelte: true,
    typescript: true,
    markdown: false,
    formatters: false,
  })
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: configs as any,
  })
  const code = [
    '<script lang="ts">',
    '  interface Props { name: string }',
    '  const props: Props = $props()',
    '  const { name } = $props()',
    '</script>',
    '',
    '<p>{props.name} {name}</p>',
    '',
  ].join('\n')
  const [result] = await eslint.lintText(code, { filePath: 'Comp.svelte' })
  const parser = await import('svelte-eslint-parser/package.json', { with: { type: 'json' } })
  console.log('svelte-eslint-parser', parser.default.version)
  console.log(JSON.stringify(result.messages.map(m => [m.ruleId, m.severity, m.message])))
  expect(result.messages.filter(m => m.fatal || m.ruleId?.startsWith('svelte/') || m.ruleId === null)).toEqual([])
})
