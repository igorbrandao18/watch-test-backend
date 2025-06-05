import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma.service';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../generated/prisma';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockDate = new Date('2025-06-05T04:33:25.934Z');

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const createUserDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword123'));

      const result = await service.create(createUserDto);

      const { password, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findById('1');
      const { password: _, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('newHashedPassword'));

      const result = await service.updatePassword('1', '1', 'newPassword123');
      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.updatePassword('999', '999', 'newPassword123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if requesting user is not the target user', async () => {
      await expect(service.updatePassword('1', '2', 'newPassword123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser);

      const result = await service.delete('1', '1');
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(prisma.user.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.delete('999', '999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if requesting user is not the target user', async () => {
      await expect(service.delete('1', '2')).rejects.toThrow(ForbiddenException);
    });
  });
}); 