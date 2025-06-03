import { 
  getErrorMessage, 
  getStatusCodeMessage, 
  handleApiError 
} from '../errorHandler'

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('extracts message from axios error response', () => {
      const error = {
        response: {
          data: {
            message: 'Server validation error'
          }
        }
      }
      expect(getErrorMessage(error)).toBe('Server validation error')
    })

    it('extracts statusText from axios error', () => {
      const error = {
        response: {
          statusText: 'Not Found'
        }
      }
      expect(getErrorMessage(error)).toBe('Server Error: Not Found')
    })

    it('extracts message from Error object', () => {
      const error = new Error('Standard error message')
      expect(getErrorMessage(error)).toBe('Standard error message')
    })

    it('handles string errors', () => {
      const error = 'String error message'
      expect(getErrorMessage(error)).toBe('String error message')
    })

    it('returns fallback for unknown error types', () => {
      const error = { unknown: 'property' }
      expect(getErrorMessage(error)).toBe('An unexpected error occurred')
    })
  })

  describe('getStatusCodeMessage', () => {
    it('returns correct message for 401', () => {
      expect(getStatusCodeMessage(401)).toBe('You need to login to access this resource.')
    })

    it('returns correct message for 403', () => {
      expect(getStatusCodeMessage(403)).toBe('You don\'t have permission to access this resource.')
    })

    it('returns correct message for 404', () => {
      expect(getStatusCodeMessage(404)).toBe('The requested resource was not found.')
    })

    it('returns correct message for 500', () => {
      expect(getStatusCodeMessage(500)).toBe('Internal server error. Please try again later.')
    })

    it('returns default message for unknown status codes', () => {
      expect(getStatusCodeMessage(418)).toBe('Server returned status 418')
    })
  })

  describe('handleApiError', () => {
    it('handles axios error with status and message', () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR'
          }
        }
      }

      const result = handleApiError(error)
      expect(result).toEqual({
        message: 'Validation failed',
        status: 400,
        code: 'VALIDATION_ERROR'
      })
    })

    it('uses status message when error message is not helpful', () => {
      const error = {
        response: {
          status: 401,
          data: {
            message: 'Request failed'
          }
        }
      }

      const result = handleApiError(error)
      expect(result.message).toBe('You need to login to access this resource.')
      expect(result.status).toBe(401)
    })
  })
}) 