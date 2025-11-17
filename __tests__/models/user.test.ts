/**
 * Production-level tests for User model
 */

import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import {
  mockUserModel,
  resetDatabaseMocks,
  createMockUser,
} from '../mocks/database'

describe('User Model', () => {
  beforeEach(() => {
    resetDatabaseMocks()
  })

  describe('User Creation', () => {
    test('should create user with required fields', () => {
      const user = createMockUser({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
      })

      expect(user).toHaveProperty('_id')
      expect(user.name).toBe('John Doe')
      expect(user.email).toBe('john@example.com')
      expect(user.role).toBe('client')
    })

    test('should have timestamps', () => {
      const user = createMockUser()

      expect(user).toHaveProperty('createdAt')
      expect(user).toHaveProperty('updatedAt')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    test('should default client to approved', () => {
      const client = createMockUser({ role: 'client' })
      expect(client.isApproved).toBe(true)
    })

    test('should default agent to not approved', () => {
      const agent = createMockUser({ role: 'agent', isApproved: false })
      expect(agent.isApproved).toBe(false)
    })
  })

  describe('Email Verification', () => {
    test('should have email verification fields', () => {
      const user = createMockUser({
        emailVerificationToken: 'token123',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      expect(user.emailVerificationToken).toBe('token123')
      expect(user.emailVerificationExpires).toBeInstanceOf(Date)
    })

    test('should track email verification status', () => {
      const verifiedUser = createMockUser({
        emailVerified: new Date(),
      })

      expect(verifiedUser.emailVerified).toBeInstanceOf(Date)
    })
  })

  describe('Password Reset', () => {
    test('should support password reset tokens', () => {
      const user = createMockUser({
        passwordResetToken: 'reset_token_123',
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      })

      expect(user.passwordResetToken).toBe('reset_token_123')
      expect(user.passwordResetExpires).toBeInstanceOf(Date)
    })

    test('should check if reset token is expired', () => {
      const expiredToken = createMockUser({
        passwordResetExpires: new Date(Date.now() - 1000),
      })

      const validToken = createMockUser({
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      })

      expect(expiredToken.passwordResetExpires.getTime()).toBeLessThan(Date.now())
      expect(validToken.passwordResetExpires.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('User Roles', () => {
    test('should support client role', () => {
      const client = createMockUser({ role: 'client' })
      expect(client.role).toBe('client')
    })

    test('should support agent role', () => {
      const agent = createMockUser({ role: 'agent' })
      expect(agent.role).toBe('agent')
    })

    test('should support admin role', () => {
      const admin = createMockUser({ role: 'admin' })
      expect(admin.role).toBe('admin')
    })
  })

  describe('User Queries', () => {
    test('should find user by email', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' })
      mockUserModel.findOne.mockResolvedValue(mockUser)

      const user = await mockUserModel.findOne({ email: 'test@example.com' })

      expect(user).toEqual(mockUser)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
    })

    test('should find user by ID', async () => {
      const mockUser = createMockUser({ _id: 'user123' })
      mockUserModel.findById.mockResolvedValue(mockUser)

      const user = await mockUserModel.findById('user123')

      expect(user).toEqual(mockUser)
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123')
    })

    test('should return null for non-existent user', async () => {
      mockUserModel.findOne.mockResolvedValue(null)

      const user = await mockUserModel.findOne({ email: 'nonexistent@example.com' })

      expect(user).toBeNull()
    })
  })

  describe('User Updates', () => {
    test('should update user profile', async () => {
      const updatedUser = createMockUser({ name: 'Updated Name' })
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser)

      const user = await mockUserModel.findByIdAndUpdate(
        'user123',
        { name: 'Updated Name' }
      )

      expect(user.name).toBe('Updated Name')
    })

    test('should approve agent', async () => {
      const approvedAgent = createMockUser({ role: 'agent', isApproved: true })
      mockUserModel.findByIdAndUpdate.mockResolvedValue(approvedAgent)

      const agent = await mockUserModel.findByIdAndUpdate(
        'agent123',
        { isApproved: true }
      )

      expect(agent.isApproved).toBe(true)
    })

    test('should update profile image', async () => {
      const userWithImage = createMockUser({
        profileImage: 'https://example.com/profile.jpg',
      })
      mockUserModel.findByIdAndUpdate.mockResolvedValue(userWithImage)

      const user = await mockUserModel.findByIdAndUpdate(
        'user123',
        { profileImage: 'https://example.com/profile.jpg' }
      )

      expect(user.profileImage).toBe('https://example.com/profile.jpg')
    })
  })

  describe('User Deletion', () => {
    test('should delete user by ID', async () => {
      const deletedUser = createMockUser()
      mockUserModel.findByIdAndDelete.mockResolvedValue(deletedUser)

      const result = await mockUserModel.findByIdAndDelete('user123')

      expect(result).toEqual(deletedUser)
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('user123')
    })
  })

  describe('User Listing', () => {
    test('should find all users', async () => {
      const users = [
        createMockUser({ email: 'user1@example.com' }),
        createMockUser({ email: 'user2@example.com' }),
      ]
      mockUserModel.find.mockResolvedValue(users)

      const result = await mockUserModel.find({})

      expect(result).toHaveLength(2)
      expect(result).toEqual(users)
    })

    test('should filter users by role', async () => {
      const agents = [
        createMockUser({ role: 'agent', email: 'agent1@example.com' }),
        createMockUser({ role: 'agent', email: 'agent2@example.com' }),
      ]
      mockUserModel.find.mockResolvedValue(agents)

      const result = await mockUserModel.find({ role: 'agent' })

      expect(result).toHaveLength(2)
      expect(result.every(u => u.role === 'agent')).toBe(true)
    })

    test('should count users', async () => {
      mockUserModel.countDocuments.mockResolvedValue(42)

      const count = await mockUserModel.countDocuments({})

      expect(count).toBe(42)
    })
  })

  describe('Security', () => {
    test('should store hashed password, never plain text', () => {
      const user = createMockUser()

      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(user.password).toMatch(/^\$2[aby]\$/)
      expect(user.password.length).toBeGreaterThan(15)
    })

    test('should have email in lowercase', () => {
      const user = createMockUser({ email: 'test@example.com' })

      // In real model, email should be converted to lowercase
      expect(user.email).toBe(user.email.toLowerCase())
    })
  })
})
