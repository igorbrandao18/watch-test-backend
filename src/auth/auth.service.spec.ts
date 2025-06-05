import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { User } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockDate = new Date('2025-06-05T04:33:25.934Z');

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByEmailWithPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      jest.spyOn(usersService, 'findByEmailWithPassword').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser(mockUser.email, 'password123');
      const { password: _, ...expectedUser } = mockUser;
      expect(result).toBeDefined();
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(usersService, 'findByEmailWithPassword').mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login(loginDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token if credentials are valid', async () => {
      const userWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock.jwt.token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock.jwt.token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });
    });
  });

  describe('validateToken', () => {
    it('should return user data if token is valid', async () => {
      const payload = { sub: mockUser.id, email: mockUser.email };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await service.validateToken('valid.jwt.token');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.validateToken('invalid.token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = { sub: 'nonexistent-id', email: 'test@example.com' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(usersService, 'findById').mockResolvedValue(null as unknown as User);

      await expect(
        service.validateToken('valid.jwt.token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});