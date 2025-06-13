import * as core from '@actions/core'
import * as github from '@actions/github'
import {run} from '../src/main'

// Mock the GitHub Actions toolkit modules
jest.mock('@actions/core')
jest.mock('@actions/github')

const mockCore = core as jest.Mocked<typeof core>

describe('Dongyo GitHub Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {}
  })

  describe('input handling', () => {
    it('should handle default inputs', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'agent':
            return 'amp'
          case 'model':
            return 'claude-3-sonnet'
          case 'trigger-word':
            return '@agent'
          default:
            return ''
        }
      })

      await run()

      expect(mockCore.getInput).toHaveBeenCalledWith('agent')
      expect(mockCore.getInput).toHaveBeenCalledWith('model')
      expect(mockCore.getInput).toHaveBeenCalledWith('trigger-word')
    })

    it('should handle custom inputs', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'agent':
            return 'claude'
          case 'model':
            return 'claude-3-opus'
          case 'trigger-word':
            return '@claude'
          default:
            return ''
        }
      })

      await run()

      expect(mockCore.info).toHaveBeenCalledWith(
        'Dongyo: Activating claude agent with model claude-3-opus'
      )
      expect(mockCore.info).toHaveBeenCalledWith('Trigger word: @claude')
    })
  })

  describe('output handling', () => {
    it('should set correct output', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'agent':
            return 'amp'
          case 'model':
            return 'claude-3-sonnet'
          case 'trigger-word':
            return '@agent'
          default:
            return ''
        }
      })

      await run()

      expect(mockCore.setOutput).toHaveBeenCalledWith(
        'result',
        'Dongyo activated amp agent with model claude-3-sonnet and trigger word @agent'
      )
    })
  })

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      mockCore.getInput.mockImplementation(() => {
        throw new Error('Input error')
      })

      await run()

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Action failed with error: Error: Input error')
      )
    })
  })

  describe('github context', () => {
    it('should log event payload', async () => {
      const mockContext = {
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

      mockCore.getInput.mockReturnValue('test')

      await run()

      expect(mockCore.info).toHaveBeenCalledWith(
        expect.stringContaining('The event payload:')
      )
    })
  })
})
