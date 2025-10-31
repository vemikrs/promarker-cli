import { describe, it, expect } from 'vitest'
import { program } from '../index.js'

describe('CLI Program', () => {
  it('should have the correct name and alias', () => {
    expect(program.name()).toBe('promarker')
    expect(program.alias()).toBe('pmkr')
  })

  it('should have validate and doctor commands', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('validate')
    expect(commands).toContain('doctor')
  })

  it('should have correct description for validation focus', () => {
    expect(program.description()).toContain('ProMarker Stencil Validator')
    expect(program.description()).toContain('validating ProMarker stencil definitions')
  })

  it('should have version information', () => {
    expect(program.version()).toBeTruthy()
  })
})