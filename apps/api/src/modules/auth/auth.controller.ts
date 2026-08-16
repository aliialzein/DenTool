/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from './constants/auth.constants';
import { SessionGuard } from './guards/session.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { CsrfGuard } from './guards/csrf.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { generateCsrfToken } from './utils/csrf.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUserWithAttemptTracking(
      loginDto.email,
      loginDto.password,
    );
    const { rawToken } = await this.authService.createSession(user.id);
    const csrfToken = generateCsrfToken();

    response.cookie(SESSION_COOKIE_NAME, rawToken, SESSION_COOKIE_OPTIONS);
    response.cookie('x-csrf-token', csrfToken, {
      ...SESSION_COOKIE_OPTIONS,
      httpOnly: false,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      csrfToken,
    };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  getCurrentUser(@Req() request: Request & { authUser?: AuthenticatedUser }) {
    return request.authUser;
  }

  @Post('logout')
  @UseGuards(RateLimitGuard, CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionToken = request.cookies?.[SESSION_COOKIE_NAME];

    await this.authService.logout(sessionToken);

    response.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);

    return { success: true };
  }

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('verify-reset-otp')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async verifyResetOtp(@Body() verifyResetOtpDto: VerifyResetOtpDto) {
    return this.authService.verifyResetOtp(
      verifyResetOtpDto.email,
      verifyResetOtpDto.otp,
    );
  }

  @Post('reset-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
    );
  }
}
