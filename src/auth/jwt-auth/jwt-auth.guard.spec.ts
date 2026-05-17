import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let mockJwtService: Partial<JwtService>;
  let mockPrismaService: { user: { findUnique: jest.Mock } };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'user',
  };

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: 'user-1', email: 'test@example.com' }),
    };

    mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
    };

    jwtAuthGuard = new JwtAuthGuard(
      mockJwtService as JwtService,
      mockPrismaService as any,
    );
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
    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, email: true, role: true },
    });
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
    ).rejects.toThrow(UnauthorizedException);
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
        }),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    };

    const result = await jwtAuthGuard.canActivate(
      mockContext as ExecutionContext,
    );
    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockToken);
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
