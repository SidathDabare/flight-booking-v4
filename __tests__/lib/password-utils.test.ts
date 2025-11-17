import { describe, expect, test } from '@jest/globals'
import { calculatePasswordStrength, generateStrongPassword } from '@/lib/password-utils'

describe('calculatePasswordStrength', () => {
  test('should rate weak password correctly', () => {
    const result = calculatePasswordStrength('pass')
    expect(result.label).toBe('Weak')
    expect(result.score).toBeLessThanOrEqual(2)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  test('should rate fair password correctly', () => {
    const result = calculatePasswordStrength('password123')
    expect(result.label).toBe('Fair')
    expect(result.score).toBeGreaterThanOrEqual(3)
    expect(result.score).toBeLessThanOrEqual(4)
  })

  test('should rate good password correctly', () => {
    const result = calculatePasswordStrength('LongerPassword123')
    expect(result.label).toBe('Good')
    expect(result.score).toBe(5)
  })

  test('should rate strong password correctly', () => {
    const result = calculatePasswordStrength('Password123!')
    expect(result.label).toBe('Strong')
    expect(result.score).toBe(6)
    expect(result.percentage).toBe(100)
    expect(result.color).toBe('bg-green-500')
  })

  test('should detect missing lowercase letters', () => {
    const result = calculatePasswordStrength('PASSWORD123!')
    expect(result.issues).toContain('Missing lowercase letters')
    expect(result.suggestions).toContain('Add lowercase letters (a-z)')
  })

  test('should detect missing uppercase letters', () => {
    const result = calculatePasswordStrength('password123!')
    expect(result.issues).toContain('Missing uppercase letters')
    expect(result.suggestions).toContain('Add uppercase letters (A-Z)')
  })

  test('should detect missing numbers', () => {
    const result = calculatePasswordStrength('Password!')
    expect(result.issues).toContain('Missing numbers')
    expect(result.suggestions).toContain('Add numbers (0-9)')
  })

  test('should detect missing special characters', () => {
    const result = calculatePasswordStrength('Password123')
    expect(result.issues).toContain('Missing special characters')
    expect(result.suggestions).toContain('Add special characters (!@#$%^&*)')
  })

  test('should detect password too short', () => {
    const result = calculatePasswordStrength('Pass1!')
    expect(result.issues).toContain('Password too short (minimum 8 characters)')
  })

  test('should give bonus for 12+ character password', () => {
    const result1 = calculatePasswordStrength('Password123!')
    const result2 = calculatePasswordStrength('Password1234!')
    // Both should be strong, but longer gets higher score
    expect(result2.score).toBeGreaterThanOrEqual(result1.score)
  })
})

describe('generateStrongPassword', () => {
  test('should generate password with minimum 12 characters', () => {
    const password = generateStrongPassword('test')
    expect(password.length).toBeGreaterThanOrEqual(12)
  })

  test('should include uppercase letter', () => {
    const password = generateStrongPassword('test')
    expect(/[A-Z]/.test(password)).toBe(true)
  })

  test('should include lowercase letter', () => {
    const password = generateStrongPassword('TEST')
    expect(/[a-z]/.test(password)).toBe(true)
  })

  test('should include number', () => {
    const password = generateStrongPassword('test')
    expect(/[0-9]/.test(password)).toBe(true)
  })

  test('should include special character', () => {
    const password = generateStrongPassword('test')
    expect(/[^A-Za-z0-9]/.test(password)).toBe(true)
  })

  test('should create strong password from empty base', () => {
    const password = generateStrongPassword('')
    const strength = calculatePasswordStrength(password)
    expect(strength.label).toBe('Strong')
  })

  test('should enhance existing weak password', () => {
    const weakPassword = 'pass'
    const enhancedPassword = generateStrongPassword(weakPassword)
    const strength = calculatePasswordStrength(enhancedPassword)
    expect(strength.score).toBeGreaterThanOrEqual(5)
  })

  test('generated password should pass strength test', () => {
    const password = generateStrongPassword('mypassword')
    const strength = calculatePasswordStrength(password)
    expect(strength.label).toMatch(/Good|Strong/)
  })
})
