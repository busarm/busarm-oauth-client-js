var __awaiter =
  (this && this.__awaiter) ||
  function (e, o, s, n) {
    function l(t) {
      return t instanceof s
        ? t
        : new s(function (e) {
            e(t);
          });
    }
    return new (s || (s = Promise))(function (t, s) {
      function a(e) {
        try {
          i(n.next(e));
        } catch (e) {
          s(e);
        }
      }
      function r(e) {
        try {
          i(n['throw'](e));
        } catch (e) {
          s(e);
        }
      }
      function i(e) {
        e.done ? t(e.value) : l(e.value).then(a, r);
      }
      i((n = n.apply(e, o || [])).next());
    });
  };
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
  get(s) {
    return new Promise((t, e) => {
      if (typeof localStorage !== 'undefined') {
        let e = localStorage.getItem(s);
        if (OauthUtils.assertAvailable(e)) {
          return t(e);
        }
      }
      if (typeof sessionStorage !== 'undefined') {
        let e = sessionStorage.getItem(s);
        if (OauthUtils.assertAvailable(e)) {
          return t(e);
        }
      }
      return e();
    });
  }
  set(s, a, r = false) {
    return new Promise((e, t) => {
      if (r) {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(s, a);
          e();
        } else {
          t();
        }
      } else {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(s, a);
          e();
        } else {
          t();
        }
      }
    });
  }
  remove(t) {
    return new Promise((e) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(t);
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(t);
      }
      e();
    });
  }
  clearAll(t = false) {
    return new Promise((e) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (t && typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      e();
    });
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
    return __awaiter(this, void 0, void 0, function* () {
      e = e || (yield Oauth.storage.get(OauthStorageKeys.AccessTokenKey));
      if (OauthUtils.assertAvailable(e)) {
        if (OauthUtils.parseJWT(e) && !OauthUtils.hasJWTExpired(e)) {
          return false;
        } else {
          let e = yield Oauth.storage.get(OauthStorageKeys.ExpiresInKey);
          if (OauthUtils.assertAvailable(e)) {
            return parseInt(e) < Math.floor(Date.now() / 1e3) + 10;
          }
        }
      }
      return true;
    });
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
    }
    if (OauthUtils.assertAvailable(e.storage)) {
      Oauth.storage = e.storage;
    }
  }
  saveAccess(e) {
    return __awaiter(this, void 0, void 0, function* () {
      return Promise.all([
        Oauth.storage.set(
          OauthStorageKeys.AccessTokenKey,
          OauthUtils.safeString(e.accessToken)
        ),
        Oauth.storage.set(
          OauthStorageKeys.RefreshTokenKey,
          OauthUtils.safeString(e.refreshToken)
        ),
        Oauth.storage.set(
          OauthStorageKeys.AccessScopeKey,
          OauthUtils.safeString(e.accessScope)
        ),
        Oauth.storage.set(
          OauthStorageKeys.TokenTypeKey,
          OauthUtils.safeString(e.tokenType)
        ),
        Oauth.storage.set(
          OauthStorageKeys.ExpiresInKey,
          String(OauthUtils.safeInt(Math.floor(Date.now() / 1e3) + e.expiresIn))
        ),
      ]);
    });
  }
  clearAccess() {
    return __awaiter(this, void 0, void 0, function* () {
      Promise.all([
        Oauth.storage.remove(OauthStorageKeys.AccessTokenKey),
        Oauth.storage.remove(OauthStorageKeys.RefreshTokenKey),
        Oauth.storage.remove(OauthStorageKeys.AccessScopeKey),
        Oauth.storage.remove(OauthStorageKeys.TokenTypeKey),
        Oauth.storage.remove(OauthStorageKeys.ExpiresInKey),
        Oauth.storage.remove(OauthStorageKeys.CurrentStateKey),
      ]);
    });
  }
  authorizeAccess(u) {
    return __awaiter(this, void 0, void 0, function* () {
      let r = OauthUtils.assertAvailable(u.grant_type)
        ? u.grant_type
        : OauthGrantType.Client_Credentials;
      const i = OauthUtils.assertAvailable(u.allowed_grant_types)
        ? u.allowed_grant_types
        : [];
      const o = OauthUtils.assertAvailable(u.redirect_uri)
        ? u.redirect_uri
        : OauthUtils.stripUrlParams(location.origin);
      const n = OauthUtils.assertAvailable(u.scope) ? u.scope : [];
      let l = OauthUtils.assertAvailable(u.state)
        ? u.state
        : OauthUtils.generateKey(32);
      const c = () =>
        __awaiter(this, void 0, void 0, function* () {
          switch (r) {
            case OauthGrantType.Auto:
              if (
                OauthUtils.assertAvailable(u.user_id) ||
                OauthUtils.assertAvailable(OauthUtils.getUrlParam('code'))
              ) {
                r = OauthGrantType.Authorization_Code;
                if (i.includes(r)) {
                  c();
                } else {
                  u.callback(false);
                }
              } else if (
                OauthUtils.assertAvailable(u.username) &&
                OauthUtils.assertAvailable(u.password)
              ) {
                r = OauthGrantType.User_Credentials;
                if (i.includes(r)) {
                  c();
                } else {
                  u.callback(false);
                }
              } else {
                r = OauthGrantType.Client_Credentials;
                if (i.includes(r)) {
                  c();
                } else {
                  u.callback(false);
                }
              }
              break;
            case OauthGrantType.Authorization_Code:
              const e = OauthUtils.getUrlParam('code');
              const t = OauthUtils.getUrlParam('error');
              const s = OauthUtils.getUrlParam('error_description');
              if (OauthUtils.assertAvailable(e)) {
                const a = yield Oauth.storage.get(
                  OauthStorageKeys.CurrentStateKey
                );
                l = OauthUtils.assertAvailable(a) ? a : l;
                if (l === OauthUtils.getUrlParam('state')) {
                  this.oauthTokenWithAuthorizationCode(e, o, (e, t) =>
                    __awaiter(this, void 0, void 0, function* () {
                      if (OauthUtils.assertAvailable(e)) {
                        if (OauthUtils.assertAvailable(e.accessToken)) {
                          Oauth.storage.remove(
                            OauthStorageKeys.CurrentStateKey
                          );
                          yield this.saveAccess(e);
                          if (typeof u.callback === 'function') {
                            u.callback(
                              yield Oauth.storage.get(
                                OauthStorageKeys.AccessTokenKey
                              )
                            );
                          }
                          location.replace(
                            OauthUtils.stripUrlParams(window.location.href)
                          );
                        } else if (OauthUtils.assertAvailable(e.error)) {
                          if (typeof u.callback === 'function') {
                            u.callback(false, e.errorDescription);
                          }
                        } else {
                          if (typeof u.callback === 'function') {
                            u.callback(false);
                          }
                        }
                      } else {
                        if (typeof u.callback === 'function') {
                          u.callback(false);
                        }
                      }
                    })
                  );
                } else {
                  if (typeof u.callback === 'function') {
                    u.callback(
                      false,
                      'Failed authorize access. CSRF Verification Failed'
                    );
                  }
                }
              } else if (OauthUtils.assertAvailable(t)) {
                Oauth.storage.remove(OauthStorageKeys.CurrentStateKey);
                if (OauthUtils.assertAvailable(s)) {
                  if (typeof u.callback === 'function') {
                    u.callback(false, s);
                  }
                } else {
                  if (typeof u.callback === 'function') {
                    u.callback(false, 'Failed authorize access');
                  }
                }
              } else {
                this.oauthAuthorize(n, o, u.user_id, l);
              }
              break;
            case OauthGrantType.User_Credentials:
              this.oauthTokenWithUserCredentials(
                u.username,
                u.password,
                n,
                (e, t) =>
                  __awaiter(this, void 0, void 0, function* () {
                    if (OauthUtils.assertAvailable(e)) {
                      if (OauthUtils.assertAvailable(e.accessToken)) {
                        yield this.saveAccess(e);
                        if (typeof u.callback === 'function') {
                          u.callback(
                            yield Oauth.storage.get(
                              OauthStorageKeys.AccessTokenKey
                            )
                          );
                        }
                      } else if (OauthUtils.assertAvailable(e.error)) {
                        if (typeof u.callback === 'function') {
                          u.callback(false, e.errorDescription);
                        }
                      } else {
                        if (typeof u.callback === 'function') {
                          u.callback(false);
                        }
                      }
                    } else {
                      if (typeof u.callback === 'function') {
                        u.callback(false);
                      }
                    }
                  })
              );
              break;
            case OauthGrantType.Client_Credentials:
            default:
              this.oauthTokenWithClientCredentials(n, (e, t) =>
                __awaiter(this, void 0, void 0, function* () {
                  if (OauthUtils.assertAvailable(e)) {
                    if (OauthUtils.assertAvailable(e.accessToken)) {
                      yield this.saveAccess(e);
                      if (typeof u.callback === 'function') {
                        u.callback(
                          yield Oauth.storage.get(
                            OauthStorageKeys.AccessTokenKey
                          )
                        );
                      }
                    } else if (OauthUtils.assertAvailable(e.error)) {
                      if (typeof u.callback === 'function') {
                        u.callback(false, e.errorDescription);
                      }
                    } else {
                      if (typeof u.callback === 'function') {
                        u.callback(false);
                      }
                    }
                  } else {
                    if (typeof u.callback === 'function') {
                      u.callback(false);
                    }
                  }
                })
              );
              break;
          }
        });
      const e = (e) => {
        this.oauthRefreshToken(e, (e, t) =>
          __awaiter(this, void 0, void 0, function* () {
            if (OauthUtils.assertAvailable(e)) {
              if (OauthUtils.assertAvailable(e.accessToken)) {
                yield this.saveAccess(e);
                if (typeof u.callback === 'function') {
                  u.callback(
                    yield Oauth.storage.get(OauthStorageKeys.AccessTokenKey)
                  );
                }
              } else if (OauthUtils.assertAvailable(e.error)) {
                if (typeof u.callback === 'function') {
                  u.callback(false, e.errorDescription);
                  this.clearAccess();
                  c();
                }
              } else {
                if (typeof u.callback === 'function') {
                  this.clearAccess();
                  u.callback(false);
                }
              }
            } else {
              if (typeof u.callback === 'function') {
                u.callback(false);
              }
            }
          })
        );
      };
      if (OauthUtils.assertAvailable(OauthUtils.getUrlParam('access_token'))) {
        const t = OauthUtils.getUrlParam('access_token');
        if (!(yield OauthUtils.hasTokenExpired(t))) {
          if (typeof u.callback === 'function') {
            u.callback(OauthUtils.assertAvailable(t) ? t : true);
          }
        } else {
          if (typeof u.callback === 'function') {
            u.callback(false);
          }
        }
      } else {
        const t = yield Oauth.storage.get(OauthStorageKeys.AccessTokenKey);
        const s = yield Oauth.storage.get(OauthStorageKeys.RefreshTokenKey);
        if (OauthUtils.assertAvailable(t)) {
          if (!(yield OauthUtils.hasTokenExpired(t))) {
            if (typeof u.callback === 'function') {
              u.callback(t);
            }
          } else {
            if (OauthUtils.assertAvailable(s)) {
              e(s);
            } else {
              c();
            }
          }
        } else {
          c();
        }
      }
    });
  }
  hasExpired() {
    return __awaiter(this, void 0, void 0, function* () {
      return OauthUtils.hasTokenExpired(
        yield Oauth.storage.get(OauthStorageKeys.AccessTokenKey)
      );
    });
  }
  oauthAuthorize(e, t, s, a) {
    if (!OauthUtils.assertAvailable(t)) {
      throw new Error("'redirect_url' Required");
    }
    Oauth.storage.set(OauthStorageKeys.CurrentStateKey, a, true);
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
    Oauth.storage.set(OauthStorageKeys.CurrentStateKey, a, true);
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
    Oauth.storage.set(OauthStorageKeys.CurrentStateKey, a, true);
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
    if (this.verifyTokenUrl) {
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
    } else {
      throw new Error("'verifyTokenUrl' was not specified");
    }
  }
}
Oauth.storage = new OauthStorage();
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
