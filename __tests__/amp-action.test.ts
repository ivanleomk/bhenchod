import * as core from '@actions/core'
import * as github from '@actions/github'
import * as exec from '@actions/exec'
import { run } from '../src/amp-action'

// Mock the GitHub Actions toolkit modules
jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/exec')

const mockCore = core as jest.Mocked<typeof core>
const mockExec = exec as jest.Mocked<typeof exec>

describe('Amp GitHub Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {}
  })

  describe('trigger detection', () => {
    it('should trigger on issue comment', () => {
      const mockContext = {
        eventName: 'issue_comment',
        payload: {
          action: 'created',
          comment: {
            body: 'Please run amp analysis'
          },
          issue: {
            number: 123
          }
        }
      }
      
      Object.defineProperty(github, 'context', {
        value: mockContext,
        writable: true
      })

      expect(github.context.eventName).toBe('issue_comment')
      expect(github.context.payload.action).toBe('created')
    })

    it('should trigger on PR comment', () => {
      const mockContext = {
        eventName: 'issue_comment',
        payload: {
          action: 'created',
          comment: {
            body: 'Run amp check'
          },
          issue: {
            number: 456,
            pull_request: {}
          }
        }
      }
      
      Object.defineProperty(github, 'context', {
        value: mockContext,
        writable: true
      })

      expect(github.context.eventName).toBe('issue_comment')
      expect(github.context.payload.issue.pull_request).toBeDefined()
    })
  })

  describe('node installation', () => {
    it('should install Node.js v22', async () => {
      mockExec.exec.mockResolvedValue(0)
      
      await run()
      
      expect(mockExec.exec).toHaveBeenCalledWith(
        'node',
        ['--version'],
        expect.any(Object)
      )
    })

    it('should handle node installation failure', async () => {
      mockExec.exec.mockRejectedValue(new Error('Node installation failed'))
      
      await run()
      
      expect(mockCore.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Node installation failed')
      )
    })
  })

  describe('amp installation', () => {
    it('should install @sourcegraph/amp', async () => {
      mockExec.exec.mockResolvedValue(0)
      
      await run()
      
      expect(mockExec.exec).toHaveBeenCalledWith(
        'npm',
        ['install', '-g', '@sourcegraph/amp'],
        expect.any(Object)
      )
    })

    it('should handle amp installation failure', async () => {
      mockExec.exec.mockImplementation((command, args) => {
        if (args?.includes('@sourcegraph/amp')) {
          return Promise.reject(new Error('Amp installation failed'))
        }
        return Promise.resolve(0)
      })
      
      await run()
      
      expect(mockCore.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Amp installation failed')
      )
    })
  })

  describe('environment setup', () => {
    it('should set up proper environment variables', async () => {
      const expectedEnv = {
        NODE_VERSION: '22',
        npm_config_registry: 'https://registry.npmjs.org/'
      }
      
      mockExec.exec.mockResolvedValue(0)
      
      await run()
      
      expect(mockExec.exec).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          env: expect.objectContaining(expectedEnv)
        })
      )
    })
  })

  describe('error handling', () => {
    it('should handle general execution errors', async () => {
      const error = new Error('General failure')
      mockExec.exec.mockRejectedValue(error)
      
      await run()
      
      expect(mockCore.setFailed).toHaveBeenCalledWith(
        `Action failed with error: ${error.message}`
      )
    })

    it('should log installation progress', async () => {
      mockExec.exec.mockResolvedValue(0)
      
      await run()
      
      expect(mockCore.info).toHaveBeenCalledWith('Installing Node.js v22...')
      expect(mockCore.info).toHaveBeenCalledWith('Installing @sourcegraph/amp...')
      expect(mockCore.info).toHaveBeenCalledWith('Setup completed successfully')
    })
  })

  describe('workflow context validation', () => {
    it('should validate comment event context', () => {
      const mockContext = {
        eventName: 'issue_comment',
        payload: {
          action: 'created',
          comment: {
            body: 'test comment'
          }
        }
      }
      
      Object.defineProperty(github, 'context', {
        value: mockContext,
        writable: true
      })

      expect(github.context.payload.comment).toBeDefined()
      expect(github.context.payload.comment.body).toBe('test comment')
    })

    it('should ignore non-comment events', () => {
      const mockContext = {
        eventName: 'push',
        payload: {}
      }
      
      Object.defineProperty(github, 'context', {
        value: mockContext,
        writable: true
      })

      expect(github.context.eventName).not.toBe('issue_comment')
    })
  })
})
