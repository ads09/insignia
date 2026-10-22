import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service.js';

describe('JwtTokenService', () => {
  const service = new JwtTokenService(
    new JwtService({ secret: 'a-test-secret-of-sufficient-length' }),
  );

  it('verifies the tokens it signs', async () => {
    const token = await service.sign({ sub: 'user-1' });

    await expect(service.verify(token)).resolves.toEqual({ sub: 'user-1' });
  });

  it('returns null for a malformed token', async () => {
    await expect(service.verify('not-a-jwt')).resolves.toBeNull();
  });

  it('returns null for a token signed with another secret', async () => {
    const foreign = await new JwtService({
      secret: 'another-secret-value',
    }).signAsync({
      sub: 'user-1',
    });

    await expect(service.verify(foreign)).resolves.toBeNull();
  });

  it('returns null for an expired token', async () => {
    const expired = await new JwtService({
      secret: 'a-test-secret-of-sufficient-length',
    }).signAsync({ sub: 'user-1' }, { expiresIn: -1 });

    await expect(service.verify(expired)).resolves.toBeNull();
  });
});
