/**
 * Mock email service for testing
 */

import { jest } from '@jest/globals'

export const mockResend = {
  emails: {
    send: jest.fn().mockResolvedValue({
      id: 'email_test123',
      from: 'test@example.com',
      to: 'recipient@example.com',
      created_at: new Date().toISOString(),
    }),
  },
}

export const resetEmailMocks = () => {
  mockResend.emails.send.mockClear()
}

// Mock email functions
export const mockSendVerificationEmail = jest.fn().mockResolvedValue(undefined)
export const mockNotifyAdminNewAgent = jest.fn().mockResolvedValue(undefined)
export const mockNotifyAgentApproval = jest.fn().mockResolvedValue(undefined)
export const mockNotifyAgentRejection = jest.fn().mockResolvedValue(undefined)
export const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined)
export const mockSendPasswordResetConfirmation = jest.fn().mockResolvedValue(undefined)
export const mockSendNewMessageNotification = jest.fn().mockResolvedValue(undefined)
export const mockSendNewReplyNotification = jest.fn().mockResolvedValue(undefined)

export const resetAllEmailMocks = () => {
  resetEmailMocks()
  mockSendVerificationEmail.mockClear()
  mockNotifyAdminNewAgent.mockClear()
  mockNotifyAgentApproval.mockClear()
  mockNotifyAgentRejection.mockClear()
  mockSendPasswordResetEmail.mockClear()
  mockSendPasswordResetConfirmation.mockClear()
  mockSendNewMessageNotification.mockClear()
  mockSendNewReplyNotification.mockClear()
}
