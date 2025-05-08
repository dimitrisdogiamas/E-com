import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let mockJwtService: Partial<JwtService>;

  beforeEach(() => {
    // Mock the JwtService
    mockJwtService = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'test@example.com' }), // Mock a valid token payload
    };

    // Create an instance of JwtAuthGuard with the mocked JwtService
    jwtAuthGuard = new JwtAuthGuard(mockJwtService as JwtService);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  it('should allow access with a valid token', async () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await jwtAuthGuard.canActivate(mockExecutionContext);
    expect(result).toBe(true); // Expect the guard to allow access
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });

  it('should throw an error with an invalid token', async () => {
    mockJwtService.verifyAsync = jest
      .fn()
      .mockRejectedValue(new Error('Invalid token'));

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(
      jwtAuthGuard.canActivate(mockExecutionContext),
    ).rejects.toThrow('Invalid token');
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
  });

  it('should return true if token is valid (from cookies)', async () => {
    const mockToken = 'valid-token';

    const mockContext: Partial<ExecutionContext> = {
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
          cookies: { jwt: mockToken },
          user: null,
        } as unknown as ExecutionContext),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    };

    const result = await jwtAuthGuard.canActivate(
      mockContext as ExecutionContext,
    );
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    const mockContext: Partial<ExecutionContext> = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          cookies: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(
      jwtAuthGuard.canActivate(mockContext as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });
});
