interface AuthConfig {
  clientID: string;
  domain: string;
  callbackURL: string;
  apiUrl: string;
}

export const AUTH_CONFIG: AuthConfig = {
  clientID: 'ORM6LrD7GTbnmTEnsVAZFUqQp4vkT4NN',
  domain: 'paulvoatx.auth0.com',
  callbackURL: 'http://localhost:3000/callback',
  apiUrl: 'https://paulvoatx.pizza42.ro'
};
