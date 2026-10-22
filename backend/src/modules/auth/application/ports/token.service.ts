export interface TokenPayload {
  /** User id. */
  sub: string;
}

export abstract class TokenService {
  abstract sign(payload: TokenPayload): Promise<string>;

  /** Resolves to null when the token is malformed, tampered with or expired. */
  abstract verify(token: string): Promise<TokenPayload | null>;
}
