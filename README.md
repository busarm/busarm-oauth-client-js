# Busarm OAuth Client JS

## Description

OAuth 2.0 JS Client 

## Set Up
- Run `npm install`
- Start Gulp - For Assets pre-processing
  - For First time Setup:
    - Install `Nodejs & NPM` on system
    - Install `gulp-cli` on system - `npm install --global gulp-cli`
    - Install npm packages - `npm install`
  - Run `gulp` command

## Instructions
- Initialize
```ts
    const oauth = new Oauth({
        clientId: string; // <Your Client ID>
        clientSecret: string; // <Your Client Secret Key>
        authorizeUrl: string; // <Oauth Provider Authorization redirect URL>
        tokenUrl: string; // <Oauth Provider Token retrieval API URL>
        verifyTokenUrl: string; // <Oauth Token verification API URL>
    });
```

- Authorize access
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
