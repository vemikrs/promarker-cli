import { describe, it, expect } from 'vitest'
import { program } from '../index.js'

describe('CLI Program', () => {
  it('should have the correct name and alias', () => {
    expect(program.name()).toBe('promarker')
    expect(program.alias()).toBe('pmkr')
  })

  it('should have init and info commands', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('init')
    expect(commands).toContain('info')
  })

  it('should have version information', () => {
    expect(program.version()).toBeTruthy()
  })
})