# Busarm OAuth Client JS

## Description

OAuth 2.0 JS Client based on [RFC6749](https://datatracker.ietf.org/doc/html/rfc6749) standards
## Documentation
- [Usage](./docs/usage.md)
- [Node API](./docs/api.md)

## Install - Nodejs

-   Install package. Run `npm i busarm-oauth-client-js`
-   Import module

```ts
import { Oauth } from "busarm-oauth-client-js";
```

## Install - Browser

```html
<script
    rel="script"
    src="./dist/busarm-oauth.min.js"
    type="text/javascript"
></script>
```

## Versions

### v1.0.10

-   Replace XMLHttpRequest with Axios
-   Added support for browsers with plain JS. Access using `BusarmOAuth` or `window.BusarmOAuth`

### v1.0.4

-   Added custom storage option `OauthStorageInterface` to handle custom access storage

```ts
    class CustomStorage implements OauthStorageInterface<string> {
      get(key: string): Promise<string> {
        return new Promise((resolve) => {
          resolve(YOUR_CUSTOM_STORAGE.get(key));
        });
      }
      set(key: string, value: string): Promise<void> {
        return new Promise((resolve) => {
          resolve(YOUR_CUSTOM_STORAGE.set(key, value));
        });
      }
      remove(key: string): Promise<any> {
        return new Promise((resolve) => {
          resolve(YOUR_CUSTOM_STORAGE.remove(key));
        });
      }
      clearAll(): Promise<any> {
        return new Promise((resolve) => {
          resolve(YOUR_CUSTOM_STORAGE.clearAll());
        });
      }
    }

    const oauth = new Oauth({
        ....
        storage: new CustomStorage(); // <Custom storage object>
    });
```

### v1.0.0

-   Initialize project

## Development

-   Run `npm install`
-   Start Gulp - For assets processing and bundling
    -   For First time Setup:
        -   Install `Nodejs & NPM` on system
        -   Install `gulp-cli` on system - `npm install --global gulp-cli`
        -   Install npm packages - `npm install`
    -   Run `gulp` command

## Testing

-   Run `npm run test`
