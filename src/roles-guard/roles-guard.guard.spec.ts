import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  it('should allow access if user has required roles', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        user: {
          roles: ['admin'], // User has the required role
        },
      }),
      getHandler: jest.fn(), //mock handler
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'get').mockReturnValue(['admin']); // Required roles

    const result = rolesGuard.canActivate(mockContext);
    expect(result).toBe(true); // Access should be allowed
  });

  it('should throw ForbiddenException if user does not have required roles', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        user: {
          roles: ['user'], // User does not have the required role
        },
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'get').mockReturnValue(['admin']); // Required roles

    expect(() => rolesGuard.canActivate(mockContext)).toThrow(
      ForbiddenException,
    );
  });

  it('should allow access if no roles are required', () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        user: {
          roles: ['user'], // User has some role
        },
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'get').mockReturnValue(undefined); // No roles required

    const result = rolesGuard.canActivate(mockContext);
    expect(result).toBe(true); // Access should be allowed
  });
});
