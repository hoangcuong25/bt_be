import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

// Mock bcrypt module hoàn toàn
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('phải trả về thông tin người dùng nếu là admin và mật khẩu đúng', async () => {
      const username = 'admin';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const user = { id: '1', username, password: hashedPassword };
      const expectedResult = { id: '1', username };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(username, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual(expectedResult);
    });

    it('phải trả về null nếu người dùng không tồn tại', async () => {
      const username = 'nonexistent';
      const password = 'password123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(username, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toBeNull();
    });

    it('phải trả về null nếu không phải tài khoản admin', async () => {
      const username = 'user';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const user = { id: '1', username, password: hashedPassword };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(username, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toBeNull();
    });

    it('phải trả về null nếu mật khẩu không đúng', async () => {
      const username = 'admin';
      const password = 'wrongpassword';
      const hashedPassword = 'hashed_password';
      const user = { id: '1', username, password: hashedPassword };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(username, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('phải trả về access_token cho người dùng', async () => {
      const user = { id: '1', username: 'admin' };
      const payload = { sub: user.id, username: user.username };
      const accessToken = 'jwt_token';

      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ access_token: accessToken });
    });
  });
});
