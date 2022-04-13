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
  static saveAccess(e) {
    OauthStorage.set(
      OauthStorage.accessTokenKey,
      OauthUtils.safeString(e.accessToken)
    );
    OauthStorage.set(
      OauthStorage.refreshTokenKey,
      OauthUtils.safeString(e.refreshToken)
    );
    OauthStorage.set(
      OauthStorage.accessScopeKey,
      OauthUtils.safeString(e.accessScope)
    );
    OauthStorage.set(
      OauthStorage.tokenTypeKey,
      OauthUtils.safeString(e.tokenType)
    );
    OauthStorage.set(
      OauthStorage.expiresInKey,
      OauthUtils.safeInt(Math.floor(Date.now() / 1e3) + e.expiresIn)
    );
  }
  static clearAccess() {
    OauthStorage.remove(OauthStorage.accessTokenKey);
    OauthStorage.remove(OauthStorage.refreshTokenKey);
    OauthStorage.remove(OauthStorage.accessScopeKey);
    OauthStorage.remove(OauthStorage.tokenTypeKey);
    OauthStorage.remove(OauthStorage.expiresInKey);
    OauthStorage.remove(OauthStorage.currentStateKey);
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
    OauthStorage.set(OauthStorage.accessTokenKey, e);
  }
  static get accessToken() {
    return OauthStorage.get(OauthStorage.accessTokenKey);
  }
  static get refreshToken() {
    return OauthStorage.get(OauthStorage.refreshTokenKey);
  }
  static get accessScope() {
    return OauthStorage.get(OauthStorage.accessScopeKey);
  }
  static get expiresIn() {
    return OauthStorage.get(OauthStorage.expiresInKey);
  }
  static get tokenType() {
    return OauthStorage.get(OauthStorage.tokenTypeKey);
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
  }
  authorizeAccess(r) {
    let i = OauthUtils.assertAvailable(r.grant_type)
      ? r.grant_type
      : OauthGrantType.Client_Credentials;
    const o = OauthUtils.assertAvailable(r.allowed_grant_types)
      ? r.allowed_grant_types
      : [];
    const n = OauthUtils.assertAvailable(r.redirect_uri)
      ? r.redirect_uri
      : OauthUtils.stripUrlParams(location.origin);
    const l = OauthUtils.assertAvailable(r.scope) ? r.scope : [];
    let c = OauthUtils.assertAvailable(r.state)
      ? r.state
      : OauthUtils.generateKey(32);
    const u = () => {
      switch (i) {
        case OauthGrantType.Auto:
          if (
            OauthUtils.assertAvailable(r.user_id) ||
            OauthUtils.assertAvailable(OauthUtils.getUrlParam('code'))
          ) {
            i = OauthGrantType.Authorization_Code;
            if (o.includes(i)) {
              u();
            } else {
              r.callback(false);
            }
          } else if (
            OauthUtils.assertAvailable(r.username) &&
            OauthUtils.assertAvailable(r.password)
          ) {
            i = OauthGrantType.User_Credentials;
            if (o.includes(i)) {
              u();
            } else {
              r.callback(false);
            }
          } else {
            i = OauthGrantType.Client_Credentials;
            if (o.includes(i)) {
              u();
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
            const a = OauthStorage.get(OauthStorage.currentStateKey);
            c = OauthUtils.assertAvailable(a) ? a : c;
            if (c === OauthUtils.getUrlParam('state')) {
              this.oauthTokenWithAuthorizationCode(e, n, (e, t) => {
                if (OauthUtils.assertAvailable(e)) {
                  if (OauthUtils.assertAvailable(e.accessToken)) {
                    OauthStorage.remove(OauthStorage.currentStateKey);
                    OauthStorage.saveAccess(e);
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
            OauthStorage.remove(OauthStorage.currentStateKey);
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
            this.oauthAuthorize(l, n, r.user_id, c);
          }
          break;
        case OauthGrantType.User_Credentials:
          this.oauthTokenWithUserCredentials(
            r.username,
            r.password,
            l,
            (e, t) => {
              if (OauthUtils.assertAvailable(e)) {
                if (OauthUtils.assertAvailable(e.accessToken)) {
                  OauthStorage.saveAccess(e);
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
          this.oauthTokenWithClientCredentials(l, (e, t) => {
            if (OauthUtils.assertAvailable(e)) {
              if (OauthUtils.assertAvailable(e.accessToken)) {
                OauthStorage.saveAccess(e);
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
            OauthStorage.saveAccess(e);
            if (typeof r.callback === 'function') {
              r.callback(OauthStorage.accessToken);
            }
          } else if (OauthUtils.assertAvailable(e.error)) {
            if (typeof r.callback === 'function') {
              r.callback(false, e.errorDescription);
              OauthStorage.clearAccess();
              u();
            }
          } else {
            if (typeof r.callback === 'function') {
              OauthStorage.clearAccess();
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
            u();
          }
        }
      } else {
        u();
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
    OauthStorage.set(OauthStorage.currentStateKey, a, true);
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
    OauthStorage.set(OauthStorage.currentStateKey, a, true);
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
    OauthStorage.set(OauthStorage.currentStateKey, a, true);
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
    OauthRequest.post({
      url: this.verifyTokenUrl,
      params: { access_token: e },
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
  constructor() {
    this.xhttp = new XMLHttpRequest();
  }
  static get(e) {
    const t = new OauthRequest();
    t.username = e.username;
    t.password = e.password;
    t.withCredentials = e.withCredentials;
    t.withAccessToken = e.withAccessToken;
    t.method = OauthRequestMethod.GET;
    t.url = e.url;
    t.headers = e.headers;
    t.query = e.query;
    t.params = e.params;
    t.success = e.success;
    t.fail = e.fail;
    t.request();
  }
  static post(e) {
    const t = new OauthRequest();
    t.username = e.username;
    t.password = e.password;
    t.withCredentials = e.withCredentials;
    t.withAccessToken = e.withAccessToken;
    t.method = OauthRequestMethod.POST;
    t.url = e.url;
    t.headers = e.headers;
    t.query = e.query;
    t.params = e.params;
    t.success = e.success;
    t.fail = e.fail;
    t.request();
  }
  static put(e) {
    const t = new OauthRequest();
    t.username = e.username;
    t.password = e.password;
    t.withCredentials = e.withCredentials;
    t.withAccessToken = e.withAccessToken;
    t.method = OauthRequestMethod.PUT;
    t.url = e.url;
    t.headers = e.headers;
    t.query = e.query;
    t.params = e.params;
    t.success = e.success;
    t.fail = e.fail;
    t.request();
  }
  static delete(e) {
    const t = new OauthRequest();
    t.username = e.username;
    t.password = e.password;
    t.withCredentials = e.withCredentials;
    t.withAccessToken = e.withAccessToken;
    t.method = OauthRequestMethod.DELETE;
    t.url = e.url;
    t.headers = e.headers;
    t.query = e.query;
    t.params = e.params;
    t.success = e.success;
    t.fail = e.fail;
    t.request();
  }
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
    if (OauthUtils.assertAvailable(this.query)) {
      if (this.url.match(/('?')/) == null) {
        this.url += `?${OauthUtils.urlEncodeObject(this.query)}`;
      } else {
        this.url += `&${OauthUtils.urlEncodeObject(this.query)}`;
      }
    }
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
    if (this.headers !== null && typeof this.headers === 'object') {
      for (const e in this.headers) {
        if (this.headers.hasOwnProperty(e)) {
          if (
            this.headers[e] !== null &&
            typeof this.headers[e] !== 'undefined'
          ) {
            this.xhttp.setRequestHeader(e, this.headers[e]);
          }
        }
      }
    }
    if (this.withCredentials) {
      this.xhttp.setRequestHeader(
        'Authorization',
        'Basic ' + btoa(this.username + ':' + this.password)
      );
    }
    if (this.withAccessToken) {
      this.xhttp.setRequestHeader(
        'Authorization',
        OauthStorage.tokenType + ' ' + OauthStorage.accessToken
      );
    }
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
        const t = OauthUtils.urlEncodeObject(this.params);
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
