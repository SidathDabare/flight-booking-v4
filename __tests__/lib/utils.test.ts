import { describe, expect, test } from '@jest/globals'
import { cn, formatString, convertToSubcurrency, formatIfFirstLetterUppercase } from '@/lib/utils'

describe('cn utility function', () => {
  test('should merge classnames correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  test('should handle conditional classes', () => {
    expect(cn('base-class', true && 'active', false && 'inactive'))
      .toBe('base-class active')
  })

  test('should override conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatString function', () => {
  test('should capitalize first letter of each word', () => {
    expect(formatString('hello world')).toBe('Hello World')
  })

  test('should handle uppercase input', () => {
    expect(formatString('HELLO WORLD')).toBe('Hello World')
  })

  test('should handle mixed case input', () => {
    expect(formatString('hELLo WoRLD')).toBe('Hello World')
  })

  test('should handle single word', () => {
    expect(formatString('hello')).toBe('Hello')
  })

  test('should handle empty string', () => {
    expect(formatString('')).toBe('')
  })
})

describe('convertToSubcurrency function', () => {
  test('should convert dollars to cents by default', () => {
    expect(convertToSubcurrency(10)).toBe(1000)
  })

  test('should handle decimal amounts', () => {
    expect(convertToSubcurrency(10.50)).toBe(1050)
  })

  test('should round to nearest cent', () => {
    expect(convertToSubcurrency(10.555)).toBe(1056)
  })

  test('should accept custom factor', () => {
    expect(convertToSubcurrency(10, 1000)).toBe(10000)
  })

  test('should handle zero', () => {
    expect(convertToSubcurrency(0)).toBe(0)
  })
})

describe('formatIfFirstLetterUppercase function', () => {
  test('should capitalize first letter and lowercase rest', () => {
    expect(formatIfFirstLetterUppercase('hello')).toBe('Hello')
  })

  test('should handle already formatted string', () => {
    expect(formatIfFirstLetterUppercase('Hello')).toBe('Hello')
  })

  test('should handle all uppercase', () => {
    expect(formatIfFirstLetterUppercase('HELLO')).toBe('Hello')
  })

  test('should handle empty string', () => {
    expect(formatIfFirstLetterUppercase('')).toBe('')
  })

  test('should handle single character', () => {
    expect(formatIfFirstLetterUppercase('h')).toBe('H')
  })
})
