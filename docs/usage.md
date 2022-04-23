

# Initialize oauth

```ts
    // NodeJs
    const oauth = new Oauth({
        clientId: string; // <Your Client ID>
        clientSecret: string; // <Your Client Secret Key>
        authorizeUrl: string; // <Oauth Provider Authorization redirect URL>
        tokenUrl: string; // <Oauth Provider Token retrieval API URL>
        verifyTokenUrl: string; // <Oauth Token verification API URL>
        storage?: OauthStorageInterface<string>; // <Custom storage object>
    });

    // Browser
    const oauth = new BusarmOAuth.Oauth({
      ....
    });
```

# Authorize access
- Validate access or grant one for the requested grant type

```ts
  oauth.authorizeAccess({
      grant_type: OauthGrantType;
      allowed_grant_types?: OauthGrantType[];
      redirect_uri: string;
      user_id: string;
      username: string;
      password: string;
      state: string;
      scope: string[];
      callback: (token: string | boolean, msg?: string) => any;
  });
```

# Grant Access - User Authorization
- Request access for user. `user_id` can be empty

```ts
  oauth.oauthAuthorize(scope: string[], redirect_url: string, user_id: string, state: string);
```

# Grant Access - Email Authorization
- Request access for an email address. `email` is required

```ts
  oauth.oauthAuthorizeWithEmail(scope: string[], redirect_url: string, email: string, state: string);
```

# Grant Access - Implicit Authorization
- Request access for user using the implicit grant flow.

```ts
  oauth.oauthAuthorizeImplicit(scope: string[], redirect_url: string, user_id: string, state: string);
```

# Grant Access - User Authentication (Resource Owner)
- Request access using `password` type.

```ts
  oauth.oauthTokenWithUserCredentials(username: string, password: string, scope: string[], callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any);
```

# Grant Access - Client Authentication
- Request access using `client_credentials` grant type.

```ts
  oauth.oauthTokenWithClientCredentials(scope: string[], callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any);
```

# Grant Access - Authorization Code
- Request access using `authorization_code` grant type

```ts
  oauth.oauthTokenWithAuthorizationCode(code: string, redirect_uri: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any);
```

# Grant Access - Refresh token
- Request access using `refresh_token` grant type

```ts
  oauth.oauthRefreshToken(refreshToken: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any);
```

# Verify Access
- Verify access token's validity

```ts
  oauth.oauthVerifyToken(accessToken: string, callback: (verify: OauthVerificationResponse, xhr: XMLHttpRequest) => any);
```
