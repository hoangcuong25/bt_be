import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('phải trả về access_token khi thông tin đăng nhập hợp lệ', async () => {
      const loginDto: LoginDto = {
        username: 'admin',
        password: 'password123',
      };
      const user = { id: '1', username: 'admin' };
      const loginResult = { access_token: 'jwt_token' };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password
      );
      expect(service.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(loginResult);
    });

    it('phải ném Error khi thông tin đăng nhập không hợp lệ', async () => {
      const loginDto: LoginDto = {
        username: 'admin',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Tên đăng nhập hoặc mật khẩu không đúng'
      );

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password
      );
      expect(service.login).not.toHaveBeenCalled();
    });
  });
});
