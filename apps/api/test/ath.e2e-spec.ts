import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
  const hasAdminCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror main.ts exactly — bootstrap() never runs in e2e tests.
    // cookie-parser is required here specifically: SessionGuard and
    // CsrfGuard both read from req.cookies, which is undefined without it.
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    if (!hasAdminCreds) {
      console.warn(
        'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set — session-dependent Auth tests will be skipped. ' +
          'Add them to apps/api/.env.local to enable full coverage.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Logs in with a fresh supertest agent (own cookie jar) so each caller
   * gets an isolated session — tests that log out or otherwise mutate
   * session state can't interfere with each other.
   */
  async function loginAsAdmin() {
    const agent = request.agent(app.getHttpServer());
    const res = await agent
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);

    return {
      agent,
      csrfToken: res.body.csrfToken as string,
      user: res.body as { id: string; email: string; role: string },
    };
  }

  describe('POST /api/auth/login', () => {
    it('rejects a missing body', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('rejects an unknown top-level field (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'whatever',
          notARealField: true,
        })
        .expect(400);
    });

    it('rejects a nonexistent email with 401 (no user enumeration)', async () => {
      // validateUser() throws the same UnauthorizedException regardless of
      // whether the email exists or the password is wrong — confirms the
      // login endpoint itself doesn't leak account existence.
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'definitely-not-a-real-user@example.com',
          password: 'wrongpassword123',
        })
        .expect(401);

      expect(res.body.message).not.toMatch(/not found/i);
    });

    it('rejects a real email with the wrong password', async () => {
      if (!hasAdminCreds) {
        console.warn('Skipped: E2E_ADMIN_EMAIL/PASSWORD not set.');
        return;
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'definitely-wrong-password' })
        .expect(401);

      expect(res.body.message).not.toMatch(/not found/i);
    });

    it('logs in successfully with correct credentials', async () => {
      if (!hasAdminCreds) {
        console.warn('Skipped: E2E_ADMIN_EMAIL/PASSWORD not set.');
        return;
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', ADMIN_EMAIL);
      expect(res.body).toHaveProperty('role');
      expect(res.body).toHaveProperty('csrfToken');
      expect(typeof res.body.csrfToken).toBe('string');

      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      // Two cookies should be set: the session (HttpOnly) and the
      // readable CSRF cookie.
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      expect(cookies.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without a session', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('returns the current user with a valid session', async () => {
      if (!hasAdminCreds) {
        console.warn('Skipped: E2E_ADMIN_EMAIL/PASSWORD not set.');
        return;
      }

      const { agent, user } = await loginAsAdmin();

      const res = await agent.get('/api/auth/me').expect(200);

      expect(res.body).toHaveProperty('id', user.id);
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).toHaveProperty('role', user.role);
    });

    it('rejects a garbage session cookie without a 500', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', ['dentool_session=not-a-real-session-token']);

      // getCurrentUser() hashes whatever token it's given and looks it up —
      // a garbage token just won't match any session, so this should be a
      // clean 401, not a crash. Documents current behavior either way.
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout — CSRF enforcement', () => {
    it('rejects logout with no CSRF header at all', async () => {
      if (!hasAdminCreds) {
        console.warn('Skipped: E2E_ADMIN_EMAIL/PASSWORD not set.');
        return;
      }

      const { agent } = await loginAsAdmin();

      // Session cookie is present (agent persists it), but no x-csrf-token
      // header was set — CsrfGuard should reject before logout runs.
      await agent.post('/api/auth/logout').expect(403);
    });

    it('rejects logout with a CSRF header that does not match the cookie', async () => {
      if (!hasAdminCreds) {
        console.warn('Skipped: E2E_ADMIN_EMAIL/PASSWORD not set.');
        return;
      }

      const { agent } = await loginAsAdmin();

      await agent
        .post('/api/auth/logout')
        .set('x-csrf-token', 'this-does-not-match-the-cookie')
        .expect(403);
    });

    it('logs out successfully with matching session + CSRF token, and revokes the session', async () => {
      if (!hasAdminCreds) {
        console.warn('Skipped: E2E_ADMIN_EMAIL/PASSWORD not set.');
        return;
      }

      const { agent, csrfToken } = await loginAsAdmin();

      await agent
        .post('/api/auth/logout')
        .set('x-csrf-token', csrfToken)
        .expect(200);

      // The session should now be dead — same agent, same cookies, but
      // the session row was deleted server-side by logout().
      await agent.get('/api/auth/me').expect(401);
    });
  });
});
