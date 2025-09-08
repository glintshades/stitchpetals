// OAuth service for handling social media authentication
export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
}

const providers: Record<string, OAuthProvider> = {
  facebook: {
    name: 'Facebook',
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    scope: 'email,public_profile'
  },
  instagram: {
    name: 'Instagram',
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    userInfoUrl: 'https://graph.instagram.com/me',
    scope: 'user_profile,user_media'
  },
  google: {
    name: 'Google',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile'
  }
};

export function getAuthUrl(provider: string, redirectUri: string): string {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (!config.clientId) {
    throw new Error(`${config.name} OAuth not configured - missing client ID`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: generateState()
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(provider: string, code: string, redirectUri: string) {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

export async function getUserInfo(provider: string, accessToken: string) {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const response = await fetch(config.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function isProviderConfigured(provider: string): boolean {
  const config = providers[provider];
  return config && !!config.clientId && !!config.clientSecret;
}