/**Store and Retrieve Oauth variables*/
export class OauthStorage {
  static get accessTokenKey() {
    return 'access_token';
  }
  static get refreshTokenKey() {
    return 'refresh_token';
  }
  static get accessScopeKey() {
    return 'scope';
  }
  static get tokenTypeKey() {
    return 'token_type';
  }
  static get expiresInKey() {
    return 'expires_in';
  }
  static get currentStateKey() {
    return 'current_state';
  }
  /**Save Access data to Local storage
   * @param accessData OauthTokenResponse */
  static saveAccess(accessData) {
    OauthStorage.set(
      OauthStorage.accessTokenKey,
      OauthUtils.safeString(accessData.accessToken)
    );
    OauthStorage.set(
      OauthStorage.refreshTokenKey,
      OauthUtils.safeString(accessData.refreshToken)
    );
    OauthStorage.set(
      OauthStorage.accessScopeKey,
      OauthUtils.safeString(accessData.accessScope)
    );
    OauthStorage.set(
      OauthStorage.tokenTypeKey,
      OauthUtils.safeString(accessData.tokenType)
    );
    OauthStorage.set(
      OauthStorage.expiresInKey,
      OauthUtils.safeInt(Math.floor(Date.now() / 1000) + accessData.expiresIn)
    );
  }
  /**Clear all access data from session*/
  static clearAccess() {
    OauthStorage.remove(OauthStorage.accessTokenKey);
    OauthStorage.remove(OauthStorage.refreshTokenKey);
    OauthStorage.remove(OauthStorage.accessScopeKey);
    OauthStorage.remove(OauthStorage.tokenTypeKey);
    OauthStorage.remove(OauthStorage.expiresInKey);
    OauthStorage.remove(OauthStorage.currentStateKey);
  }
  /** Set data - localstorage
   * @param name  name
   * @param value  value
   * */
  static set(name, value, temporary = false) {
    if (temporary) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(name, value);
      }
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
      }
    }
  }
  /** Set data - localStorage
   * @param name  name
   * */
  static get(name) {
    if (typeof sessionStorage !== 'undefined') {
      let data = sessionStorage.getItem(name);
      if (OauthUtils.assertAvailable(data)) {
        return data;
      }
    }
    if (typeof localStorage !== 'undefined') {
      let data = localStorage.getItem(name);
      if (OauthUtils.assertAvailable(data)) {
        return data;
      }
    }
    return null;
  }
  /** Remove data - localStorage
   * @param name  string
   * */
  static remove(name) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(name);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(name);
    }
  }
  /**Clear all user data*/
  static clearAll(withTemp = false) {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (withTemp && typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }
  /**Set Access Token
   * @param accessToken String
   * */
  static set accessToken(accessToken) {
    OauthStorage.set(OauthStorage.accessTokenKey, accessToken);
  }
  /**Get Access Token
   * @return String
   * */
  static get accessToken() {
    return OauthStorage.get(OauthStorage.accessTokenKey);
  }
  /**Get Refresh Token
   * @return String
   * */
  static get refreshToken() {
    return OauthStorage.get(OauthStorage.refreshTokenKey);
  }
  /**Get Access Scope
   * @return String
   * */
  static get accessScope() {
    return OauthStorage.get(OauthStorage.accessScopeKey);
  }
  /**Get Expires In
   * @return string
   * */
  static get expiresIn() {
    return OauthStorage.get(OauthStorage.expiresInKey);
  }
  /**Get Token Type
   * @return String
   * */
  static get tokenType() {
    return OauthStorage.get(OauthStorage.tokenTypeKey);
  }
}
/**Common Functions*/
export class OauthUtils {
  /**Check if token is a JWT token and return claims if so
   *  @return string
   * */
  static parseJWT(token) {
    let split = token.split('.');
    return split && split.length == 3 ? atob(split[1]) : null;
  }
  /**Check if JWT Token has expired
   *  @return boolean
   * */
  static hasJWTExpired(token) {
    let data = this.parseJson(this.parseJWT(token));
    let exp = data ? data['exp'] : null;
    return exp ? parseInt(exp) < Math.floor(Date.now() / 1000) + 10 : true; // + 10 to account for any network latency
  }
  /**Check if token has expired
   *  @return boolean
   * */
  static hasTokenExpired(token) {
    token = token || OauthStorage.accessToken;
    if (OauthUtils.assertAvailable(token)) {
      if (OauthUtils.parseJWT(token) && !OauthUtils.hasJWTExpired(token)) {
        return false;
      } else if (OauthUtils.assertAvailable(OauthStorage.expiresIn)) {
        return (
          parseInt(OauthStorage.expiresIn) < Math.floor(Date.now() / 1000) + 10
        ); // + 10 to account for any network latency
      }
    }
    return true;
  }
  /**Get a safe form of string to store,
   * eliminating null and 'undefined'
   * @param item
   *  @return String*/
  static safeString(item) {
    if (OauthUtils.assertAvailable(item)) {
      return item;
    }
    return '';
  }
  /**Get a safe form of stIntring to store,
   * eliminating null and 'undefined'
   * @param item
   *  @return int*/
  static safeInt(item) {
    if (OauthUtils.assertAvailable(item)) {
      return item;
    }
    return 0;
  }
  /**Check if item is nut null, undefined or empty
   * eliminating null and 'undefined'
   * @param item
   *  @return boolean*/
  static assertAvailable(item) {
    return item != null && typeof item !== 'undefined' && item !== '';
  }
  /**Count Object array
   * @return int*/
  static count(obj) {
    let element_count = 0;
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        element_count++;
      }
    }
    return element_count;
  }
  /**Merge Object with another*/
  static mergeObj(obj, src) {
    Object.keys(src).forEach((key) => {
      if (src.hasOwnProperty(key)) {
        if (Array.isArray(obj)) {
          obj.push(src[key]);
        } else {
          obj[this.count(obj)] = src[key];
        }
      }
    });
    return obj;
  }
  /**Encode Object content to url string
   *  @param myData Object
   *  @return String
   * */
  static urlEncodeObject(myData) {
    const encodeObj = (data, key, parent) => {
      const encoded = [];
      for (const subKey in data[key]) {
        if (data[key].hasOwnProperty(subKey)) {
          if (
            data[key][subKey] !== null &&
            typeof data[key][subKey] !== 'undefined'
          ) {
            if (
              typeof data[key][subKey] === 'object' ||
              Array.isArray(data[key][subKey])
            ) {
              // If object or array
              const newParent = parent + '[' + subKey + ']';
              this.mergeObj(encoded, encodeObj(data[key], subKey, newParent));
            } else {
              encoded.push(
                encodeURIComponent(parent + '[' + subKey + ']') +
                  '=' +
                  encodeURIComponent(data[key][subKey])
              );
            }
          }
        }
      }
      return encoded;
    };
    const encodeData = (data) => {
      const encoded = [];
      if (data !== null && typeof data === 'object') {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            if (data[key] !== null && typeof data[key] !== 'undefined') {
              if (typeof data[key] === 'object' || Array.isArray(data[key])) {
                // If object or array
                this.mergeObj(encoded, encodeObj(data, key, key));
              } else {
                encoded.push(key + '=' + encodeURIComponent(data[key]));
              }
            }
          }
        }
      }
      return encoded;
    };
    const out = encodeData(myData);
    if (out.length > 0) {
      return out.join('&');
    } else {
      return '';
    }
  }
  /** Parse Json string to object
   *  @param json string
   *  @return object
   *  */
  static parseJson(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }
  /**Get Url param
   * #source http://www.netlobo.com/url_query_string_javascript.html
   * */
  static getUrlParam(name, url) {
    if (!url) {
      url = location.href;
    }
    url = decodeURIComponent(url);
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regexS = '[\\?&]' + name + '=([^&#]*)';
    const regex = new RegExp(regexS);
    const results = regex.exec(url);
    return results == null ? null : results[1];
  }
  /**Return url without it's url parameters
   * @param url Url to strip
   * @return string
   * */
  static stripUrlParams(url) {
    if (OauthUtils.assertAvailable(url)) {
      return url.split('?')[0];
    } else {
      return url;
    }
  }
  /**Generate Random value*/
  static generateKey(length) {
    if (!OauthUtils.assertAvailable(length)) {
      length = 16;
    }
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
export class Oauth {
  /**@param data object
   * @param data.clientId - Your Application's Client ID
   * @param data.clientSecret - Your Application's Client Secret
   * @param data.authorizeUrl - Url to Authorize access (For authorization_code grant_type)
   * @param data.tokenUrl - Url to obtain token
   * @param data.verifyTokenUrl - Url to verify token
   * */
  constructor(data) {
    if (OauthUtils.assertAvailable(data.clientId)) {
      this.clientId = data.clientId;
    } else {
      throw new Error("'clientId' Required");
    }
    if (OauthUtils.assertAvailable(data.clientSecret)) {
      this.clientSecret = data.clientSecret;
    } else {
      throw new Error("'clientSecret' Required");
    }
    if (OauthUtils.assertAvailable(data.authorizeUrl)) {
      this.authorizeUrl = data.authorizeUrl;
    } else {
      throw new Error("'authorizeUrl'  Required");
    }
    if (OauthUtils.assertAvailable(data.tokenUrl)) {
      this.tokenUrl = data.tokenUrl;
    } else {
      throw new Error("'tokenUrl' Required");
    }
    if (OauthUtils.assertAvailable(data.verifyTokenUrl)) {
      this.verifyTokenUrl = data.verifyTokenUrl;
    } else {
      throw new Error("'verifyTokenUrl' Required");
    }
  }
  /**Authorize Access to the app
   * @param params Object
   * @param params.grant_type default -> client_credentials grantType
   * @param params.allowed_grant_types grant_type(s) to ignore if OauthGrantType.Auto selected
   * @param params.redirect_uri For authorization_code grant_type default -> current url
   * @param params.user_id For authorization_code grant_type
   * @param params.username For User_Credentials grant_type
   * @param params.password For User_Credentials grant_type
   * @param params.callback()
   * */
  authorizeAccess(params) {
    let grant_type = OauthUtils.assertAvailable(params.grant_type)
      ? params.grant_type
      : OauthGrantType.Client_Credentials;
    const allowed_grant_types = OauthUtils.assertAvailable(
      params.allowed_grant_types
    )
      ? params.allowed_grant_types
      : [];
    const redirect_uri = OauthUtils.assertAvailable(params.redirect_uri)
      ? params.redirect_uri
      : OauthUtils.stripUrlParams(location.origin);
    const scope = OauthUtils.assertAvailable(params.scope) ? params.scope : [];
    let state = OauthUtils.assertAvailable(params.state)
      ? params.state
      : OauthUtils.generateKey(32);
    /**Get New Token
     * */
    const getNewOauthToken = () => {
      switch (grant_type) {
        case OauthGrantType.Auto:
          if (
            OauthUtils.assertAvailable(params.user_id) ||
            OauthUtils.assertAvailable(OauthUtils.getUrlParam('code'))
          ) {
            // if authorization code exists in url param
            grant_type = OauthGrantType.Authorization_Code;
            if (allowed_grant_types.includes(grant_type)) {
              getNewOauthToken();
            } else {
              params.callback(false);
            }
          } else if (
            OauthUtils.assertAvailable(params.username) &&
            OauthUtils.assertAvailable(params.password)
          ) {
            grant_type = OauthGrantType.User_Credentials;
            if (allowed_grant_types.includes(grant_type)) {
              getNewOauthToken();
            } else {
              params.callback(false);
            }
          } else {
            grant_type = OauthGrantType.Client_Credentials;
            if (allowed_grant_types.includes(grant_type)) {
              getNewOauthToken();
            } else {
              params.callback(false);
            }
          }
          break;
        case OauthGrantType.Authorization_Code:
          const code = OauthUtils.getUrlParam('code');
          const error = OauthUtils.getUrlParam('error');
          const error_description = OauthUtils.getUrlParam('error_description');
          if (OauthUtils.assertAvailable(code)) {
            const save_state = OauthStorage.get(OauthStorage.currentStateKey);
            state = OauthUtils.assertAvailable(save_state) ? save_state : state;
            if (state === OauthUtils.getUrlParam('state')) {
              // Get token
              this.oauthTokenWithAuthorizationCode(
                code,
                redirect_uri,
                /**Ajax Response callback
                 * @param token OauthTokenResponse
                 * @param xhr XMLHttpRequest | ActiveXObject
                 * */
                (token, xhr) => {
                  if (OauthUtils.assertAvailable(token)) {
                    if (OauthUtils.assertAvailable(token.accessToken)) {
                      // Remove instance ID
                      OauthStorage.remove(OauthStorage.currentStateKey);
                      // save token
                      OauthStorage.saveAccess(token);
                      if (typeof params.callback === 'function') {
                        params.callback(OauthStorage.accessToken);
                      }
                      // Remove authorization code from url
                      location.replace(
                        OauthUtils.stripUrlParams(window.location.href)
                      );
                    } else if (OauthUtils.assertAvailable(token.error)) {
                      if (typeof params.callback === 'function') {
                        params.callback(false, token.errorDescription);
                      }
                    } else {
                      if (typeof params.callback === 'function') {
                        params.callback(false);
                      }
                    }
                  } else {
                    if (typeof params.callback === 'function') {
                      params.callback(false);
                    }
                  }
                }
              );
            } else {
              if (typeof params.callback === 'function') {
                params.callback(
                  false,
                  'Failed authorize access. CSRF Verification Failed'
                );
              }
            }
          } else if (OauthUtils.assertAvailable(error)) {
            // Remove oauth state
            OauthStorage.remove(OauthStorage.currentStateKey);
            if (OauthUtils.assertAvailable(error_description)) {
              if (typeof params.callback === 'function') {
                params.callback(false, error_description);
              }
            } else {
              if (typeof params.callback === 'function') {
                params.callback(false, 'Failed authorize access');
              }
            }
          } else {
            // Get authorization code
            this.oauthAuthorize(scope, redirect_uri, params.user_id, state);
          }
          break;
        case OauthGrantType.User_Credentials:
          // Get token
          this.oauthTokenWithUserCredentials(
            params.username,
            params.password,
            scope,
            /**Ajax Response callback
             * @param token OauthTokenResponse
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            (token, xhr) => {
              if (OauthUtils.assertAvailable(token)) {
                if (OauthUtils.assertAvailable(token.accessToken)) {
                  // save token
                  OauthStorage.saveAccess(token);
                  if (typeof params.callback === 'function') {
                    params.callback(OauthStorage.accessToken);
                  }
                } else if (OauthUtils.assertAvailable(token.error)) {
                  if (typeof params.callback === 'function') {
                    params.callback(false, token.errorDescription);
                  }
                } else {
                  if (typeof params.callback === 'function') {
                    params.callback(false);
                  }
                }
              } else {
                if (typeof params.callback === 'function') {
                  params.callback(false);
                }
              }
            }
          );
          break;
        case OauthGrantType.Client_Credentials:
        default:
          // Get token
          this.oauthTokenWithClientCredentials(
            scope,
            /**Ajax Response callback
             * @param token OauthTokenResponse
             * @param xhr XMLHttpRequest | ActiveXObject
             * */
            (token, xhr) => {
              if (OauthUtils.assertAvailable(token)) {
                if (OauthUtils.assertAvailable(token.accessToken)) {
                  // save token
                  OauthStorage.saveAccess(token);
                  if (typeof params.callback === 'function') {
                    params.callback(OauthStorage.accessToken);
                  }
                } else if (OauthUtils.assertAvailable(token.error)) {
                  if (typeof params.callback === 'function') {
                    params.callback(false, token.errorDescription);
                  }
                } else {
                  if (typeof params.callback === 'function') {
                    params.callback(false);
                  }
                }
              } else {
                if (typeof params.callback === 'function') {
                  params.callback(false);
                }
              }
            }
          );
          break;
      }
    };
    /**Refresh Existing Token
     * @param refreshToken String
     * */
    const refreshOauthToken = (refreshToken) => {
      this.oauthRefreshToken(
        refreshToken,
        /**Ajax Response callback
         * @param token OauthTokenResponse
         * @param xhr XMLHttpRequest | ActiveXObject
         * */
        (token, xhr) => {
          if (OauthUtils.assertAvailable(token)) {
            if (OauthUtils.assertAvailable(token.accessToken)) {
              // save token
              OauthStorage.saveAccess(token);
              if (typeof params.callback === 'function') {
                params.callback(OauthStorage.accessToken);
              }
            } else if (OauthUtils.assertAvailable(token.error)) {
              if (typeof params.callback === 'function') {
                params.callback(false, token.errorDescription);
                OauthStorage.clearAccess();
                getNewOauthToken();
              }
            } else {
              if (typeof params.callback === 'function') {
                OauthStorage.clearAccess();
                params.callback(false);
              }
            }
          } else {
            if (typeof params.callback === 'function') {
              params.callback(false);
            }
          }
        }
      );
    };
    if (OauthUtils.assertAvailable(OauthUtils.getUrlParam('access_token'))) {
      const accessToken = OauthUtils.getUrlParam('access_token');
      if (!OauthUtils.hasTokenExpired(accessToken)) {
        if (typeof params.callback === 'function') {
          params.callback(
            OauthUtils.assertAvailable(accessToken) ? accessToken : true
          );
        }
      } else {
        if (typeof params.callback === 'function') {
          params.callback(false);
        }
      }
    } else {
      const accessToken = OauthStorage.accessToken;
      const refreshToken = OauthStorage.refreshToken;
      /*Token available, check for refreshing*/
      if (OauthUtils.assertAvailable(accessToken)) {
        if (!OauthUtils.hasTokenExpired(accessToken)) {
          if (typeof params.callback === 'function') {
            params.callback(accessToken);
          }
        } else {
          // Expired - get refresh token
          if (OauthUtils.assertAvailable(refreshToken)) {
            // Try Refresh token
            refreshOauthToken(refreshToken);
          } else {
            // No refresh token get new token
            getNewOauthToken();
          }
        }
      } else {
        // No token - get new token
        getNewOauthToken();
      }
    }
  }
  /**
   * Check if authorization has expired
   */
  hasExpired() {
    return OauthUtils.hasTokenExpired(OauthStorage.accessToken);
  }
  /**Oauth Authorization
   * @param scope
   * @param redirect_url
   * @param user_id
   * @param state
   * */
  oauthAuthorize(scope, redirect_url, user_id, state) {
    if (!OauthUtils.assertAvailable(redirect_url)) {
      throw new Error("'redirect_url' Required");
    }
    OauthStorage.set(OauthStorage.currentStateKey, state, true);
    const params = {
      client_id: this.clientId,
      scope: scope.join(' '),
      state: state,
      response_type: 'code',
      user_id: user_id,
      redirect_uri: redirect_url,
    };
    const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(params)}`;
    // Open authorization url
    window.open(url, '_blank');
  }
  /**Oauth Authorization
   * @param scope
   * @param redirect_url
   * @param email
   * @param state
   * */
  oauthAuthorizeWithEmail(scope, redirect_url, email, state) {
    if (!OauthUtils.assertAvailable(redirect_url)) {
      throw new Error("'redirect_url' Required");
    }
    OauthStorage.set(OauthStorage.currentStateKey, state, true);
    const params = {
      client_id: this.clientId,
      scope: scope.join(' '),
      state: state,
      response_type: 'code',
      email: email,
      redirect_uri: redirect_url,
    };
    const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(params)}`;
    // Open authorization url
    window.open(url, '_blank');
  }
  /**Oauth Authorization
   * @param scope
   * @param redirect_url
   * @param user_id
   * @param state
   * */
  oauthAuthorizeImplicit(scope, redirect_url, user_id, state) {
    if (!OauthUtils.assertAvailable(redirect_url)) {
      throw new Error("'redirect_url' Required");
    }
    if (!OauthUtils.assertAvailable(scope)) {
      throw new Error("'scope' Required");
    }
    OauthStorage.set(OauthStorage.currentStateKey, state, true);
    const params = {
      client_id: this.clientId,
      scope: scope.join(' '),
      state: state,
      response_type: 'token',
      user_id: user_id,
      redirect_uri: redirect_url,
    };
    const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(params)}`;
    // Open authorization url
    window.open(url, '_blank');
  }
  /**Get oauth token with Client credentials
   * @param scope
   * @param callback function
   * */
  oauthTokenWithClientCredentials(scope, callback) {
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.Client_Credentials,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: scope.join(' '),
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      success: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      fail: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
    });
  }
  /**Get oauth token with Client credentials
   * @param username
   * @param password
   * @param scope
   * @param callback function
   * */
  oauthTokenWithUserCredentials(username, password, scope, callback) {
    if (!OauthUtils.assertAvailable(username)) {
      throw new Error("'username' Required");
    }
    if (!OauthUtils.assertAvailable(password)) {
      throw new Error("'password' Required");
    }
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.User_Credentials,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: username,
        password: password,
        scope: scope.join(' '),
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      success: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      fail: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
    });
  }
  /**Get oauth token with Client credentials
   * @param code String
   * @param redirect_uri String
   * @param callback function
   * */
  oauthTokenWithAuthorizationCode(code, redirect_uri, callback) {
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.Authorization_Code,
        code: code,
        redirect_uri: redirect_uri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      success: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      fail: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
    });
  }
  /**Get oauth Refresh Token with
   * Client credentials
   * @param refreshToken string
   * @param callback function
   * */
  oauthRefreshToken(refreshToken, callback) {
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.Refresh_Token,
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      success: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      fail: (xhr) => {
        const token = OauthResponse.parseTokenResponse(xhr.responseText);
        if (typeof callback === 'function') {
          callback(token, xhr);
        }
      },
    });
  }
  /**Get oauth Refresh Token with
   * Client credentials
   * @param accessToken string
   * @param callback function
   * */
  oauthVerifyToken(accessToken, callback) {
    OauthRequest.post({
      url: this.verifyTokenUrl,
      params: {
        access_token: accessToken,
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      success: (xhr) => {
        const verify = OauthResponse.parseVerificationResponse(
          xhr.responseText
        );
        if (typeof callback === 'function') {
          callback(verify, xhr);
        }
      },
      /**Ajax Response callback
       * @param xhr XMLHttpRequest | ActiveXObject
       * */
      fail: (xhr) => {
        const verify = OauthResponse.parseVerificationResponse(
          xhr.responseText
        );
        if (typeof callback === 'function') {
          callback(verify, xhr);
        }
      },
    });
  }
}
/**Grant Types*/
export var OauthGrantType;
(function (OauthGrantType) {
  OauthGrantType['Client_Credentials'] = 'client_credentials';
  OauthGrantType['Authorization_Code'] = 'authorization_code';
  OauthGrantType['User_Credentials'] = 'password';
  OauthGrantType['Refresh_Token'] = 'refresh_token';
  OauthGrantType['Auto'] = 'auto';
})(OauthGrantType || (OauthGrantType = {}));
/**Http Request Method*/
export var OauthRequestMethod;
(function (OauthRequestMethod) {
  OauthRequestMethod['GET'] = 'get';
  OauthRequestMethod['POST'] = 'post';
  OauthRequestMethod['PUT'] = 'put';
  OauthRequestMethod['DELETE'] = 'delete';
})(OauthRequestMethod || (OauthRequestMethod = {}));
/**Make Oauth Http requests*/
export class OauthRequest {
  constructor() {
    this.xhttp = new XMLHttpRequest();
  }
  /**Make GET Requests
   * @param data Object
   * @param data.username string - Auth username (optional)
   * @param data.password string - Auth password (optional)
   * @param data.withCredentials boolean - Use Credentials (username & password) default = false
   * @param data.withAccessToken boolean - Use Access Token Header default = false
   * @param data.url string - Request Url
   * @param data.headers Object
   * @param data.query Object
   * @param data.params Object
   * @param data.success(xhr,result)
   * @param data.fail(xhr)
   * */
  static get(data) {
    const http = new OauthRequest();
    http.username = data.username;
    http.password = data.password;
    http.withCredentials = data.withCredentials;
    http.withAccessToken = data.withAccessToken;
    http.method = OauthRequestMethod.GET;
    http.url = data.url;
    http.headers = data.headers;
    http.query = data.query;
    http.params = data.params;
    http.success = data.success;
    http.fail = data.fail;
    http.request();
  }
  /**Make POST Requests
   * @param data object
   * @param data.username string - Auth username (optional)
   * @param data.password string - Auth password (optional)
   * @param data.withCredentials boolean - Use Credentials (username & password) default = false
   * @param data.withAccessToken boolean - Use Access Token Header default = false
   * @param data.url string - Request Url
   * @param data.headers Object
   * @param data.query Object
   * @param data.params Object
   * @param data.success(xhr,result)
   * @param data.fail(xhr)
   * */
  static post(data) {
    const http = new OauthRequest();
    http.username = data.username;
    http.password = data.password;
    http.withCredentials = data.withCredentials;
    http.withAccessToken = data.withAccessToken;
    http.method = OauthRequestMethod.POST;
    http.url = data.url;
    http.headers = data.headers;
    http.query = data.query;
    http.params = data.params;
    http.success = data.success;
    http.fail = data.fail;
    http.request();
  }
  /**Make PUT Requests
   * @param data object
   * @param data.username string - Auth username (optional)
   * @param data.password string - Auth password (optional)
   * @param data.withCredentials boolean - Use Credentials (username & password) default = false
   * @param data.withAccessToken boolean - Use Access Token Header default = false
   * @param data.url string - Request Url
   * @param data.headers Object
   * @param data.query Object
   * @param data.params Object
   * @param data.success(xhr,result)
   * @param data.fail(xhr)
   * */
  static put(data) {
    const http = new OauthRequest();
    http.username = data.username;
    http.password = data.password;
    http.withCredentials = data.withCredentials;
    http.withAccessToken = data.withAccessToken;
    http.method = OauthRequestMethod.PUT;
    http.url = data.url;
    http.headers = data.headers;
    http.query = data.query;
    http.params = data.params;
    http.success = data.success;
    http.fail = data.fail;
    http.request();
  }
  /**Make DELETE Requests
   * @param data object
   * @param data.username string - Auth username (optional)
   * @param data.password string - Auth password (optional)
   * @param data.withCredentials boolean - Use Credentials (username & password) default = false
   * @param data.withAccessToken boolean - Use Access Token Header default = false
   * @param data.url string - Request Url
   * @param data.headers Object
   * @param data.query Object
   * @param data.params Object
   * @param data.success(xhr,result)
   * @param data.fail(xhr)
   * */
  static delete(data) {
    const http = new OauthRequest();
    http.username = data.username;
    http.password = data.password;
    http.withCredentials = data.withCredentials;
    http.withAccessToken = data.withAccessToken;
    http.method = OauthRequestMethod.DELETE;
    http.url = data.url;
    http.headers = data.headers;
    http.query = data.query;
    http.params = data.params;
    http.success = data.success;
    http.fail = data.fail;
    http.request();
  }
  /**Make Http requests*/
  request() {
    if (this.username == null || typeof this.username === 'undefined') {
      this.username = '';
    }
    if (this.password == null || typeof this.password === 'undefined') {
      this.password = '';
    }
    if (
      this.withCredentials == null ||
      typeof this.withCredentials === 'undefined'
    ) {
      this.withCredentials = false;
    }
    if (
      this.withAccessToken == null ||
      typeof this.withAccessToken === 'undefined'
    ) {
      this.withAccessToken = false;
    }
    // If Queries available
    if (OauthUtils.assertAvailable(this.query)) {
      if (this.url.match(/('?')/) == null) {
        this.url += `?${OauthUtils.urlEncodeObject(this.query)}`;
      } else {
        this.url += `&${OauthUtils.urlEncodeObject(this.query)}`;
      }
    }
    // If GET Request
    if (this.method === OauthRequestMethod.GET) {
      if (OauthUtils.assertAvailable(this.params)) {
        if (this.url.match(/('?')/) == null) {
          this.url += `?${OauthUtils.urlEncodeObject(this.params)}`;
        } else {
          this.url += `&${OauthUtils.urlEncodeObject(this.params)}`;
        }
      }
    }
    this.xhttp.withCredentials = this.withCredentials;
    this.xhttp.open(this.method.toString().toLowerCase(), this.url);
    // Get response
    this.xhttp.onreadystatechange = () => {
      if (this.xhttp.readyState === this.xhttp.DONE) {
        if (this.xhttp.status === 200) {
          if (typeof this.success === 'function') {
            this.success(this.xhttp, this.xhttp.responseText);
          }
        } else {
          if (typeof this.fail === 'function') {
            this.fail(this.xhttp);
          }
        }
      }
    };
    // Add headers
    if (this.headers !== null && typeof this.headers === 'object') {
      for (const key in this.headers) {
        if (this.headers.hasOwnProperty(key)) {
          if (
            this.headers[key] !== null &&
            typeof this.headers[key] !== 'undefined'
          ) {
            this.xhttp.setRequestHeader(key, this.headers[key]);
          }
        }
      }
    }
    // Add Basic Credentials if requested
    if (this.withCredentials) {
      this.xhttp.setRequestHeader(
        'Authorization',
        'Basic ' + btoa(this.username + ':' + this.password)
      );
    }
    // Add Access Token if requested
    if (this.withAccessToken) {
      this.xhttp.setRequestHeader(
        'Authorization',
        OauthStorage.tokenType + ' ' + OauthStorage.accessToken
      );
    }
    // Send Request
    if (this.method === OauthRequestMethod.GET) {
      this.xhttp.send();
    } else {
      if (this.params instanceof FormData) {
        this.xhttp.send(this.params);
      } else {
        this.xhttp.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );
        const data = OauthUtils.urlEncodeObject(this.params);
        this.xhttp.send(data);
      }
    }
  }
}
/**Oauth Response*/
export class OauthResponse {
  /**@return OauthVerificationResponse
   * @param result string json result
   * @throws errorDescription
   * */
  static parseVerificationResponse(result) {
    const data = OauthUtils.parseJson(result);
    const verify = new OauthVerificationResponse(data);
    if (verify && OauthUtils.assertAvailable(verify.success)) {
      return verify;
    } else if (verify && OauthUtils.assertAvailable(verify.error)) {
      return verify;
    }
    return null;
  }
  /**@return OauthAuthorizationResponse
   * @param result string json result
   * */
  static parseAuthorizationResponse(result) {
    const data = OauthUtils.parseJson(result);
    const code = new OauthAuthorizationResponse(data);
    if (code && OauthUtils.assertAvailable(code.code)) {
      return code;
    } else if (code && OauthUtils.assertAvailable(code.error)) {
      return code;
    }
    return null;
  }
  /**@return OauthTokenResponse
   * @param result string json result
   * */
  static parseTokenResponse(result) {
    const data = OauthUtils.parseJson(result);
    const token = new OauthTokenResponse(data);
    if (token && OauthUtils.assertAvailable(token.accessToken)) {
      return token;
    } else if (token && OauthUtils.assertAvailable(token.error)) {
      return token;
    }
    return null;
  }
}
/**Authorization Response*/
export class OauthVerificationResponse {
  constructor(data) {
    if (!data) return;
    this.success = data['success'];
    this.error = data['error'];
    this.errorDescription = data['error_description'];
  }
}
/**Authorization Response*/
export class OauthAuthorizationResponse {
  constructor(data) {
    if (!data) return;
    this.state = data['state'];
    this.code = data['code'];
    this.error = data['error'];
    this.errorDescription = data['error_description'];
  }
}
/**Authorization Response*/
export class OauthTokenResponse {
  constructor(data) {
    if (!data) return;
    this.accessToken = data['access_token'];
    this.refreshToken = data['refresh_token'];
    this.tokenType = data['token_type'];
    this.accessScope = data['scope'];
    this.expiresIn = data['expires_in'];
    this.error = data['error'];
    this.errorDescription = data['error_description'];
  }
}
