import {
  aUser,
  mockPasswordHasher,
  mockTokenService,
  mockUserRepository,
} from '../../../../../test/utils/mocks.js';
import { UsernameAlreadyExistsError } from '../../../users/domain/username-already-exists.error.js';
import { RegisterUserUseCase } from './register-user.use-case.js';

describe('RegisterUserUseCase', () => {
  const users = mockUserRepository();
  const passwordHasher = mockPasswordHasher();
  const tokens = mockTokenService();
  const useCase = new RegisterUserUseCase(users, passwordHasher, tokens);

  beforeEach(() => {
    vi.resetAllMocks();
    users.create.mockResolvedValue(aUser({ id: 'new-user' }));
    tokens.sign.mockResolvedValue('signed-token');
  });

  it('registers a user by username only and returns a token', async () => {
    await expect(useCase.execute({ username: 'alice' })).resolves.toEqual({
      token: 'signed-token',
    });
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(users.create).toHaveBeenCalledWith({
      username: 'alice',
      passwordHash: null,
    });
    expect(tokens.sign).toHaveBeenCalledWith({ sub: 'new-user' });
  });

  it('stores a hash of the password when one is given', async () => {
    passwordHasher.hash.mockResolvedValue('hashed');

    await useCase.execute({ username: 'alice', password: 'secret123' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(users.create).toHaveBeenCalledWith({
      username: 'alice',
      passwordHash: 'hashed',
    });
  });

  it('propagates a duplicate username', async () => {
    users.create.mockRejectedValue(new UsernameAlreadyExistsError());

    await expect(useCase.execute({ username: 'alice' })).rejects.toBeInstanceOf(
      UsernameAlreadyExistsError,
    );
    expect(tokens.sign).not.toHaveBeenCalled();
  });
});
