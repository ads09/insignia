import {
  aUser,
  mockPasswordHasher,
  mockTokenService,
  mockUserRepository,
} from '../../../../../test/utils/mocks.js';
import { InvalidCredentialsError } from '../../domain/invalid-credentials.error.js';
import { LoginUseCase } from './login.use-case.js';

describe('LoginUseCase', () => {
  const users = mockUserRepository();
  const passwordHasher = mockPasswordHasher();
  const tokens = mockTokenService();
  const useCase = new LoginUseCase(users, passwordHasher, tokens);
  const credentials = { username: 'alice', password: 'secret123' };

  beforeEach(() => {
    vi.resetAllMocks();
    tokens.sign.mockResolvedValue('signed-token');
  });

  it('returns a token for valid credentials', async () => {
    users.findByUsername.mockResolvedValue(aUser({ id: 'user-1' }));
    passwordHasher.compare.mockResolvedValue(true);

    await expect(useCase.execute(credentials)).resolves.toEqual({
      token: 'signed-token',
    });
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'secret123',
      'hashed-password',
    );
    expect(tokens.sign).toHaveBeenCalledWith({ sub: 'user-1' });
  });

  it('rejects an unknown username', async () => {
    users.findByUsername.mockResolvedValue(null);

    await expect(useCase.execute(credentials)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('rejects a wrong password', async () => {
    users.findByUsername.mockResolvedValue(aUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(credentials)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    expect(tokens.sign).not.toHaveBeenCalled();
  });

  it('rejects users registered without a password', async () => {
    users.findByUsername.mockResolvedValue(aUser({ passwordHash: null }));

    await expect(useCase.execute(credentials)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });
});
