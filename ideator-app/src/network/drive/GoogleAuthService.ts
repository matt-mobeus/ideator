// ============================================================================
// IDEATOR — Google OAuth Handler (NET-4.1)
// OAuth 2.0 PKCE flow for Google Drive access
// ============================================================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const TOKEN_STORAGE_KEY = 'ideator_google_tokens';

/** OAuth tokens */
export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
}

export class GoogleAuthService {
  private clientId: string;
  private tokens: GoogleTokens | null = null;
  private codeVerifier: string | null = null;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.loadTokens();
  }

  /** Initiate OAuth popup flow with PKCE */
  async initiateAuth(): Promise<void> {
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: crypto.randomUUID(),
    });

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      `${GOOGLE_AUTH_URL}?${params.toString()}`,
      'google_auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  /** Handle OAuth callback code exchange */
  async handleCallback(code: string): Promise<GoogleTokens> {
    if (!this.codeVerifier) {
      throw new Error('No code verifier found. Call initiateAuth() first.');
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const body = new URLSearchParams({
      client_id: this.clientId,
      code,
      code_verifier: this.codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${await response.text()}`);
    }

    const data = await response.json();
    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope,
    };

    this.codeVerifier = null;
    this.persistTokens();
    return { ...this.tokens };
  }

  /** Refresh access token before expiry */
  async refreshToken(): Promise<GoogleTokens> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available. Re-authenticate.');
    }

    const body = new URLSearchParams({
      client_id: this.clientId,
      refresh_token: this.tokens.refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${await response.text()}`);
    }

    const data = await response.json();
    this.tokens = {
      accessToken: data.access_token,
      refreshToken: this.tokens.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope ?? this.tokens.scope,
    };

    this.persistTokens();
    return { ...this.tokens };
  }

  /** Revoke access */
  async revokeAccess(): Promise<void> {
    if (this.tokens?.accessToken) {
      await fetch(`${GOOGLE_REVOKE_URL}?token=${this.tokens.accessToken}`, {
        method: 'POST',
      }).catch(() => {});
    }
    this.tokens = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  /** Get current valid access token (refreshing if needed) */
  async getAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('Not authenticated. Call initiateAuth() first.');
    }
    if (this.tokens.expiresAt - Date.now() < 5 * 60 * 1000) {
      await this.refreshToken();
    }
    return this.tokens!.accessToken;
  }

  /** Whether the user is authenticated */
  isAuthenticated(): boolean {
    return this.tokens !== null && this.tokens.expiresAt > Date.now();
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  private base64UrlEncode(buffer: Uint8Array): string {
    let str = '';
    for (const byte of buffer) {
      str += String.fromCharCode(byte);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private persistTokens(): void {
    if (this.tokens) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(this.tokens));
    }
  }

  private loadTokens(): void {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) this.tokens = JSON.parse(stored);
    } catch {
      this.tokens = null;
    }
  }
}
