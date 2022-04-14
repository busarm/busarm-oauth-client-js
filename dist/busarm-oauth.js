export var OauthStorageKeys;
(function (e) {
  e['AccessTokenKey'] = 'access_token';
  e['RefreshTokenKey'] = 'refresh_token';
  e['AccessScopeKey'] = 'scope';
  e['TokenTypeKey'] = 'token_type';
  e['ExpiresInKey'] = 'expires_in';
  e['CurrentStateKey'] = 'current_state';
})(OauthStorageKeys || (OauthStorageKeys = {}));
export class OauthStorage {
  get(t) {
    return new Promise((e) => {
      e(OauthStorage.get(t));
    });
  }
  set(t, s) {
    return new Promise((e) => {
      e(OauthStorage.set(t, s));
    });
  }
  remove(t) {
    return new Promise((e) => {
      e(OauthStorage.remove(t));
    });
  }
  clearAll() {
    return new Promise((e) => {
      e(OauthStorage.clearAll());
    });
  }
  static set(e, t, s = false) {
    if (s) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(e, t);
      }
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(e, t);
      }
    }
  }
  static get(t) {
    if (typeof sessionStorage !== 'undefined') {
      let e = sessionStorage.getItem(t);
      if (OauthUtils.assertAvailable(e)) {
        return e;
      }
    }
    if (typeof localStorage !== 'undefined') {
      let e = localStorage.getItem(t);
      if (OauthUtils.assertAvailable(e)) {
        return e;
      }
    }
    return null;
  }
  static remove(e) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(e);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(e);
    }
  }
  static clearAll(e = false) {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (e && typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }
  static set accessToken(e) {
    OauthStorage.set(OauthStorageKeys.AccessTokenKey, e);
  }
  static get accessToken() {
    return OauthStorage.get(OauthStorageKeys.AccessTokenKey);
  }
  static get refreshToken() {
    return OauthStorage.get(OauthStorageKeys.RefreshTokenKey);
  }
  static get accessScope() {
    return OauthStorage.get(OauthStorageKeys.AccessScopeKey);
  }
  static get expiresIn() {
    return OauthStorage.get(OauthStorageKeys.ExpiresInKey);
  }
  static get tokenType() {
    return OauthStorage.get(OauthStorageKeys.TokenTypeKey);
  }
}
export class OauthUtils {
  static parseJWT(e) {
    let t = e.split('.');
    return t && t.length == 3 ? atob(t[1]) : null;
  }
  static hasJWTExpired(e) {
    let t = this.parseJson(this.parseJWT(e));
    let s = t ? t['exp'] : null;
    return s ? parseInt(s) < Math.floor(Date.now() / 1e3) + 10 : true;
  }
  static hasTokenExpired(e) {
    e = e || OauthStorage.accessToken;
    if (OauthUtils.assertAvailable(e)) {
      if (OauthUtils.parseJWT(e) && !OauthUtils.hasJWTExpired(e)) {
        return false;
      } else if (OauthUtils.assertAvailable(OauthStorage.expiresIn)) {
        return (
          parseInt(OauthStorage.expiresIn) < Math.floor(Date.now() / 1e3) + 10
        );
      }
    }
    return true;
  }
  static safeString(e) {
    if (OauthUtils.assertAvailable(e)) {
      return e;
    }
    return '';
  }
  static safeInt(e) {
    if (OauthUtils.assertAvailable(e)) {
      return e;
    }
    return 0;
  }
  static assertAvailable(e) {
    return e != null && typeof e !== 'undefined' && e !== '';
  }
  static count(e) {
    let t = 0;
    for (const s in e) {
      if (e.hasOwnProperty(s)) {
        t++;
      }
    }
    return t;
  }
  static mergeObj(t, s) {
    Object.keys(s).forEach((e) => {
      if (s.hasOwnProperty(e)) {
        if (Array.isArray(t)) {
          t.push(s[e]);
        } else {
          t[this.count(t)] = s[e];
        }
      }
    });
    return t;
  }
  static urlEncodeObject(e) {
    const o = (e, t, s) => {
      const a = [];
      for (const r in e[t]) {
        if (e[t].hasOwnProperty(r)) {
          if (e[t][r] !== null && typeof e[t][r] !== 'undefined') {
            if (typeof e[t][r] === 'object' || Array.isArray(e[t][r])) {
              const i = s + '[' + r + ']';
              this.mergeObj(a, o(e[t], r, i));
            } else {
              a.push(
                encodeURIComponent(s + '[' + r + ']') +
                  '=' +
                  encodeURIComponent(e[t][r])
              );
            }
          }
        }
      }
      return a;
    };
    const t = (e) => {
      const t = [];
      if (e !== null && typeof e === 'object') {
        for (const s in e) {
          if (e.hasOwnProperty(s)) {
            if (e[s] !== null && typeof e[s] !== 'undefined') {
              if (typeof e[s] === 'object' || Array.isArray(e[s])) {
                this.mergeObj(t, o(e, s, s));
              } else {
                t.push(s + '=' + encodeURIComponent(e[s]));
              }
            }
          }
        }
      }
      return t;
    };
    const s = t(e);
    if (s.length > 0) {
      return s.join('&');
    } else {
      return '';
    }
  }
  static parseJson(e) {
    try {
      return JSON.parse(e);
    } catch (e) {
      return null;
    }
  }
  static getUrlParam(e, t) {
    if (!t) {
      t = location.href;
    }
    t = decodeURIComponent(t);
    e = e.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const s = '[\\?&]' + e + '=([^&#]*)';
    const a = new RegExp(s);
    const r = a.exec(t);
    return r == null ? null : r[1];
  }
  static stripUrlParams(e) {
    if (OauthUtils.assertAvailable(e)) {
      return e.split('?')[0];
    } else {
      return e;
    }
  }
  static generateKey(t) {
    if (!OauthUtils.assertAvailable(t)) {
      t = 16;
    }
    let s = '';
    const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let e = 0; e < t; e++) {
      s += a.charAt(Math.floor(Math.random() * a.length));
    }
    return s;
  }
}
export class Oauth {
  constructor(e) {
    if (OauthUtils.assertAvailable(e.clientId)) {
      this.clientId = e.clientId;
    } else {
      throw new Error("'clientId' Required");
    }
    if (OauthUtils.assertAvailable(e.clientSecret)) {
      this.clientSecret = e.clientSecret;
    } else {
      throw new Error("'clientSecret' Required");
    }
    if (OauthUtils.assertAvailable(e.authorizeUrl)) {
      this.authorizeUrl = e.authorizeUrl;
    } else {
      throw new Error("'authorizeUrl'  Required");
    }
    if (OauthUtils.assertAvailable(e.tokenUrl)) {
      this.tokenUrl = e.tokenUrl;
    } else {
      throw new Error("'tokenUrl' Required");
    }
    if (OauthUtils.assertAvailable(e.verifyTokenUrl)) {
      this.verifyTokenUrl = e.verifyTokenUrl;
    } else {
      throw new Error("'verifyTokenUrl' Required");
    }
    if (OauthUtils.assertAvailable(e.storage)) {
      this.storage = e.storage;
    } else {
      this.storage = new OauthStorage();
    }
  }
  getStorage() {
    return this.storage;
  }
  setStorage(e) {
    this.storage = e;
  }
  saveAccess(e) {
    this.storage.set(
      OauthStorageKeys.AccessTokenKey,
      OauthUtils.safeString(e.accessToken)
    );
    this.storage.set(
      OauthStorageKeys.RefreshTokenKey,
      OauthUtils.safeString(e.refreshToken)
    );
    this.storage.set(
      OauthStorageKeys.AccessScopeKey,
      OauthUtils.safeString(e.accessScope)
    );
    this.storage.set(
      OauthStorageKeys.TokenTypeKey,
      OauthUtils.safeString(e.tokenType)
    );
    this.storage.set(
      OauthStorageKeys.ExpiresInKey,
      String(OauthUtils.safeInt(Math.floor(Date.now() / 1e3) + e.expiresIn))
    );
  }
  clearAccess() {
    this.storage.remove(OauthStorageKeys.AccessTokenKey);
    this.storage.remove(OauthStorageKeys.RefreshTokenKey);
    this.storage.remove(OauthStorageKeys.AccessScopeKey);
    this.storage.remove(OauthStorageKeys.TokenTypeKey);
    this.storage.remove(OauthStorageKeys.ExpiresInKey);
    this.storage.remove(OauthStorageKeys.CurrentStateKey);
  }
  authorizeAccess(r) {
    let i = OauthUtils.assertAvailable(r.grant_type)
      ? r.grant_type
      : OauthGrantType.Client_Credentials;
    const o = OauthUtils.assertAvailable(r.allowed_grant_types)
      ? r.allowed_grant_types
      : [];
    const l = OauthUtils.assertAvailable(r.redirect_uri)
      ? r.redirect_uri
      : OauthUtils.stripUrlParams(location.origin);
    const n = OauthUtils.assertAvailable(r.scope) ? r.scope : [];
    let c = OauthUtils.assertAvailable(r.state)
      ? r.state
      : OauthUtils.generateKey(32);
    const h = () => {
      switch (i) {
        case OauthGrantType.Auto:
          if (
            OauthUtils.assertAvailable(r.user_id) ||
            OauthUtils.assertAvailable(OauthUtils.getUrlParam('code'))
          ) {
            i = OauthGrantType.Authorization_Code;
            if (o.includes(i)) {
              h();
            } else {
              r.callback(false);
            }
          } else if (
            OauthUtils.assertAvailable(r.username) &&
            OauthUtils.assertAvailable(r.password)
          ) {
            i = OauthGrantType.User_Credentials;
            if (o.includes(i)) {
              h();
            } else {
              r.callback(false);
            }
          } else {
            i = OauthGrantType.Client_Credentials;
            if (o.includes(i)) {
              h();
            } else {
              r.callback(false);
            }
          }
          break;
        case OauthGrantType.Authorization_Code:
          const e = OauthUtils.getUrlParam('code');
          const t = OauthUtils.getUrlParam('error');
          const s = OauthUtils.getUrlParam('error_description');
          if (OauthUtils.assertAvailable(e)) {
            const a = OauthStorage.get(OauthStorageKeys.CurrentStateKey);
            c = OauthUtils.assertAvailable(a) ? a : c;
            if (c === OauthUtils.getUrlParam('state')) {
              this.oauthTokenWithAuthorizationCode(e, l, (e, t) => {
                if (OauthUtils.assertAvailable(e)) {
                  if (OauthUtils.assertAvailable(e.accessToken)) {
                    OauthStorage.remove(OauthStorageKeys.CurrentStateKey);
                    this.saveAccess(e);
                    if (typeof r.callback === 'function') {
                      r.callback(OauthStorage.accessToken);
                    }
                    location.replace(
                      OauthUtils.stripUrlParams(window.location.href)
                    );
                  } else if (OauthUtils.assertAvailable(e.error)) {
                    if (typeof r.callback === 'function') {
                      r.callback(false, e.errorDescription);
                    }
                  } else {
                    if (typeof r.callback === 'function') {
                      r.callback(false);
                    }
                  }
                } else {
                  if (typeof r.callback === 'function') {
                    r.callback(false);
                  }
                }
              });
            } else {
              if (typeof r.callback === 'function') {
                r.callback(
                  false,
                  'Failed authorize access. CSRF Verification Failed'
                );
              }
            }
          } else if (OauthUtils.assertAvailable(t)) {
            OauthStorage.remove(OauthStorageKeys.CurrentStateKey);
            if (OauthUtils.assertAvailable(s)) {
              if (typeof r.callback === 'function') {
                r.callback(false, s);
              }
            } else {
              if (typeof r.callback === 'function') {
                r.callback(false, 'Failed authorize access');
              }
            }
          } else {
            this.oauthAuthorize(n, l, r.user_id, c);
          }
          break;
        case OauthGrantType.User_Credentials:
          this.oauthTokenWithUserCredentials(
            r.username,
            r.password,
            n,
            (e, t) => {
              if (OauthUtils.assertAvailable(e)) {
                if (OauthUtils.assertAvailable(e.accessToken)) {
                  this.saveAccess(e);
                  if (typeof r.callback === 'function') {
                    r.callback(OauthStorage.accessToken);
                  }
                } else if (OauthUtils.assertAvailable(e.error)) {
                  if (typeof r.callback === 'function') {
                    r.callback(false, e.errorDescription);
                  }
                } else {
                  if (typeof r.callback === 'function') {
                    r.callback(false);
                  }
                }
              } else {
                if (typeof r.callback === 'function') {
                  r.callback(false);
                }
              }
            }
          );
          break;
        case OauthGrantType.Client_Credentials:
        default:
          this.oauthTokenWithClientCredentials(n, (e, t) => {
            if (OauthUtils.assertAvailable(e)) {
              if (OauthUtils.assertAvailable(e.accessToken)) {
                this.saveAccess(e);
                if (typeof r.callback === 'function') {
                  r.callback(OauthStorage.accessToken);
                }
              } else if (OauthUtils.assertAvailable(e.error)) {
                if (typeof r.callback === 'function') {
                  r.callback(false, e.errorDescription);
                }
              } else {
                if (typeof r.callback === 'function') {
                  r.callback(false);
                }
              }
            } else {
              if (typeof r.callback === 'function') {
                r.callback(false);
              }
            }
          });
          break;
      }
    };
    const e = (e) => {
      this.oauthRefreshToken(e, (e, t) => {
        if (OauthUtils.assertAvailable(e)) {
          if (OauthUtils.assertAvailable(e.accessToken)) {
            this.saveAccess(e);
            if (typeof r.callback === 'function') {
              r.callback(OauthStorage.accessToken);
            }
          } else if (OauthUtils.assertAvailable(e.error)) {
            if (typeof r.callback === 'function') {
              r.callback(false, e.errorDescription);
              this.clearAccess();
              h();
            }
          } else {
            if (typeof r.callback === 'function') {
              this.clearAccess();
              r.callback(false);
            }
          }
        } else {
          if (typeof r.callback === 'function') {
            r.callback(false);
          }
        }
      });
    };
    if (OauthUtils.assertAvailable(OauthUtils.getUrlParam('access_token'))) {
      const t = OauthUtils.getUrlParam('access_token');
      if (!OauthUtils.hasTokenExpired(t)) {
        if (typeof r.callback === 'function') {
          r.callback(OauthUtils.assertAvailable(t) ? t : true);
        }
      } else {
        if (typeof r.callback === 'function') {
          r.callback(false);
        }
      }
    } else {
      const t = OauthStorage.accessToken;
      const s = OauthStorage.refreshToken;
      if (OauthUtils.assertAvailable(t)) {
        if (!OauthUtils.hasTokenExpired(t)) {
          if (typeof r.callback === 'function') {
            r.callback(t);
          }
        } else {
          if (OauthUtils.assertAvailable(s)) {
            e(s);
          } else {
            h();
          }
        }
      } else {
        h();
      }
    }
  }
  hasExpired() {
    return OauthUtils.hasTokenExpired(OauthStorage.accessToken);
  }
  oauthAuthorize(e, t, s, a) {
    if (!OauthUtils.assertAvailable(t)) {
      throw new Error("'redirect_url' Required");
    }
    OauthStorage.set(OauthStorageKeys.CurrentStateKey, a, true);
    const r = {
      client_id: this.clientId,
      scope: e.join(' '),
      state: a,
      response_type: 'code',
      user_id: s,
      redirect_uri: t,
    };
    const i = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(r)}`;
    window.open(i, '_blank');
  }
  oauthAuthorizeWithEmail(e, t, s, a) {
    if (!OauthUtils.assertAvailable(t)) {
      throw new Error("'redirect_url' Required");
    }
    OauthStorage.set(OauthStorageKeys.CurrentStateKey, a, true);
    const r = {
      client_id: this.clientId,
      scope: e.join(' '),
      state: a,
      response_type: 'code',
      email: s,
      redirect_uri: t,
    };
    const i = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(r)}`;
    window.open(i, '_blank');
  }
  oauthAuthorizeImplicit(e, t, s, a) {
    if (!OauthUtils.assertAvailable(t)) {
      throw new Error("'redirect_url' Required");
    }
    if (!OauthUtils.assertAvailable(e)) {
      throw new Error("'scope' Required");
    }
    OauthStorage.set(OauthStorageKeys.CurrentStateKey, a, true);
    const r = {
      client_id: this.clientId,
      scope: e.join(' '),
      state: a,
      response_type: 'token',
      user_id: s,
      redirect_uri: t,
    };
    const i = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(r)}`;
    window.open(i, '_blank');
  }
  oauthTokenWithClientCredentials(e, s) {
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.Client_Credentials,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: e.join(' '),
      },
      success: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
      fail: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
    });
  }
  oauthTokenWithUserCredentials(e, t, s, a) {
    if (!OauthUtils.assertAvailable(e)) {
      throw new Error("'username' Required");
    }
    if (!OauthUtils.assertAvailable(t)) {
      throw new Error("'password' Required");
    }
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.User_Credentials,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: e,
        password: t,
        scope: s.join(' '),
      },
      success: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof a === 'function') {
          a(t, e);
        }
      },
      fail: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof a === 'function') {
          a(t, e);
        }
      },
    });
  }
  oauthTokenWithAuthorizationCode(e, t, s) {
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.Authorization_Code,
        code: e,
        redirect_uri: t,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
      success: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
      fail: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
    });
  }
  oauthRefreshToken(e, s) {
    OauthRequest.post({
      url: this.tokenUrl,
      params: {
        grant_type: OauthGrantType.Refresh_Token,
        refresh_token: e,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
      success: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
      fail: (e) => {
        const t = OauthResponse.parseTokenResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
    });
  }
  oauthVerifyToken(e, s) {
    OauthRequest.get({
      url: this.verifyTokenUrl,
      accessToken: e,
      success: (e) => {
        const t = OauthResponse.parseVerificationResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
      fail: (e) => {
        const t = OauthResponse.parseVerificationResponse(e.responseText);
        if (typeof s === 'function') {
          s(t, e);
        }
      },
    });
  }
}
export var OauthGrantType;
(function (e) {
  e['Client_Credentials'] = 'client_credentials';
  e['Authorization_Code'] = 'authorization_code';
  e['User_Credentials'] = 'password';
  e['Refresh_Token'] = 'refresh_token';
  e['Auto'] = 'auto';
})(OauthGrantType || (OauthGrantType = {}));
export var OauthRequestMethod;
(function (e) {
  e['GET'] = 'get';
  e['POST'] = 'post';
  e['PUT'] = 'put';
  e['DELETE'] = 'delete';
})(OauthRequestMethod || (OauthRequestMethod = {}));
export class OauthRequest {
  constructor(e, t = OauthRequestMethod.GET) {
    this.data = e;
    this.method = t;
    this.xhttp = new XMLHttpRequest();
  }
  static get(e) {
    const t = new OauthRequest(e, OauthRequestMethod.GET);
    t.request();
  }
  static post(e) {
    const t = new OauthRequest(e, OauthRequestMethod.POST);
    t.request();
  }
  static put(e) {
    const t = new OauthRequest(e, OauthRequestMethod.PUT);
    t.request();
  }
  static delete(e) {
    const t = new OauthRequest(e, OauthRequestMethod.DELETE);
    t.request();
  }
  request() {
    if (!OauthUtils.assertAvailable(this.data.username)) {
      this.data.username = '';
    }
    if (!OauthUtils.assertAvailable(this.data.password)) {
      this.data.password = '';
    }
    if (!OauthUtils.assertAvailable(this.data.withCredentials)) {
      this.data.withCredentials = false;
    }
    if (!OauthUtils.assertAvailable(this.data.withAccessToken)) {
      this.data.withAccessToken = false;
    }
    if (OauthUtils.assertAvailable(this.data.query)) {
      if (this.data.url.match(/('?')/) == null) {
        this.data.url += `?${OauthUtils.urlEncodeObject(this.data.query)}`;
      } else {
        this.data.url += `&${OauthUtils.urlEncodeObject(this.data.query)}`;
      }
    }
    if (this.method === OauthRequestMethod.GET) {
      if (OauthUtils.assertAvailable(this.data.params)) {
        if (this.data.url.match(/('?')/) == null) {
          this.data.url += `?${OauthUtils.urlEncodeObject(this.data.params)}`;
        } else {
          this.data.url += `&${OauthUtils.urlEncodeObject(this.data.params)}`;
        }
      }
    }
    this.xhttp.withCredentials = this.data.withCredentials;
    this.xhttp.open(this.method.toString().toLowerCase(), this.data.url);
    this.xhttp.onreadystatechange = () => {
      if (this.xhttp.readyState === this.xhttp.DONE) {
        if (this.xhttp.status === 200) {
          if (this.data.success && typeof this.data.success === 'function') {
            this.data.success(this.xhttp, this.xhttp.responseText);
          }
        } else {
          if (this.data.fail && typeof this.data.fail === 'function') {
            this.data.fail(this.xhttp);
          }
        }
      }
    };
    if (this.data.headers !== null && typeof this.data.headers === 'object') {
      for (const e in this.data.headers) {
        if (this.data.headers.hasOwnProperty(e)) {
          if (
            this.data.headers[e] !== null &&
            typeof this.data.headers[e] !== 'undefined'
          ) {
            this.xhttp.setRequestHeader(e, this.data.headers[e]);
          }
        }
      }
    }
    if (this.data.withCredentials) {
      this.xhttp.setRequestHeader(
        'Authorization',
        'Basic ' +
          Buffer.from(this.data.username + ':' + this.data.password).toString(
            'base64'
          )
      );
    }
    if (this.data.withAccessToken) {
      this.xhttp.setRequestHeader(
        'Authorization',
        (this.data.accessTokenType || 'Bearer') + ' ' + this.data.accessToken
      );
    }
    if (this.method === OauthRequestMethod.GET) {
      this.xhttp.send();
    } else {
      if (this.data.params instanceof FormData) {
        this.xhttp.send(this.data.params);
      } else {
        this.xhttp.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );
        const t = OauthUtils.urlEncodeObject(this.data.params);
        this.xhttp.send(t);
      }
    }
  }
}
export class OauthResponse {
  static parseVerificationResponse(e) {
    const t = OauthUtils.parseJson(e);
    const s = new OauthVerificationResponse(t);
    if (s && OauthUtils.assertAvailable(s.success)) {
      return s;
    } else if (s && OauthUtils.assertAvailable(s.error)) {
      return s;
    }
    return null;
  }
  static parseAuthorizationResponse(e) {
    const t = OauthUtils.parseJson(e);
    const s = new OauthAuthorizationResponse(t);
    if (s && OauthUtils.assertAvailable(s.code)) {
      return s;
    } else if (s && OauthUtils.assertAvailable(s.error)) {
      return s;
    }
    return null;
  }
  static parseTokenResponse(e) {
    const t = OauthUtils.parseJson(e);
    const s = new OauthTokenResponse(t);
    if (s && OauthUtils.assertAvailable(s.accessToken)) {
      return s;
    } else if (s && OauthUtils.assertAvailable(s.error)) {
      return s;
    }
    return null;
  }
}
export class OauthVerificationResponse {
  constructor(e) {
    if (!e) return;
    this.success = e['success'];
    this.error = e['error'];
    this.errorDescription = e['error_description'];
  }
}
export class OauthAuthorizationResponse {
  constructor(e) {
    if (!e) return;
    this.state = e['state'];
    this.code = e['code'];
    this.error = e['error'];
    this.errorDescription = e['error_description'];
  }
}
export class OauthTokenResponse {
  constructor(e) {
    if (!e) return;
    this.accessToken = e['access_token'];
    this.refreshToken = e['refresh_token'];
    this.tokenType = e['token_type'];
    this.accessScope = e['scope'];
    this.expiresIn = e['expires_in'];
    this.error = e['error'];
    this.errorDescription = e['error_description'];
  }
}
