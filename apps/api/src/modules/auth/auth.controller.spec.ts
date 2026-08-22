/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SESSION_COOKIE_NAME } from './constants/auth.constants';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock: any = {
    validateUserWithAttemptTracking: jest.fn(),
    createSession: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    verifyResetOtp: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('returns safe user data and sets the session cookie', async () => {
      const user = {
        id: 'user-id',
        email: 'admin@test.com',
        role: 'ADMIN',
      };

      const session = {
        rawToken: 'session-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      authServiceMock.validateUserWithAttemptTracking.mockResolvedValue(user);

      authServiceMock.createSession.mockResolvedValue(session);

      const loginDto: LoginDto = {
        email: 'admin@test.com',
        password: 'TestPassword123!',
      };

      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, response);

      expect(
        authServiceMock.validateUserWithAttemptTracking,
      ).toHaveBeenCalledWith('admin@test.com', 'TestPassword123!');

      expect(authServiceMock.createSession).toHaveBeenCalledWith('user-id');

      expect(response.cookie).toHaveBeenCalled();

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-id',
          email: 'admin@test.com',
          role: 'ADMIN',
        }),
      );
    });
  });

  describe('logout', () => {
    it('logs out the current session', async () => {
      const request = {
        cookies: {
          [SESSION_COOKIE_NAME]: 'session-token',
        },
      } as unknown as Request;

      const response = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(request, response);

      expect(authServiceMock.logout).toHaveBeenCalledWith('session-token');

      expect(response.clearCookie).toHaveBeenCalled();
    });
  });
});
