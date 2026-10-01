import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'e2e-test@example.com',
          password: 'Password123!',
          firstName: 'E2E',
          lastName: 'Test',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('Registration successful');
          expect(res.body.user.email).toBe('e2e-test@example.com');
        });
    });

    it('should reject duplicate email', async () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'e2e-test@example.com',
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'weak-password@example.com',
          password: 'weak',
          firstName: 'Weak',
          lastName: 'Password',
        })
        .expect(400);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'Invalid',
          lastName: 'Email',
        })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'e2e-test@example.com',
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Login successful');
          expect(res.body.user.email).toBe('e2e-test@example.com');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'e2e-test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject unknown email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('/api/auth/me (GET)', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'e2e-test@example.com',
          password: 'Password123!',
        });

      const cookies = loginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find((cookie: string) => cookie.startsWith('access_token='));
      accessToken = tokenCookie.split(';')[0].split('=')[1];
    });

    it('should return current user when authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', [`access_token=${accessToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('e2e-test@example.com');
          expect(res.body.passwordHash).toBeUndefined();
        });
    });

    it('should reject unauthenticated request', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });
});
