var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            );
        });
    };
import axios from 'axios';
import { Buffer } from 'buffer';
/**
 * Oauth Storage Keys
 * @enum
 */
var OauthStorageKeys;
(function (OauthStorageKeys) {
    /** @type {String} */
    OauthStorageKeys['AccessTokenKey'] = 'access_token';
    /** @type {String} */
    OauthStorageKeys['RefreshTokenKey'] = 'refresh_token';
    /** @type {String} */
    OauthStorageKeys['AccessScopeKey'] = 'scope';
    /** @type {String} */
    OauthStorageKeys['TokenTypeKey'] = 'token_type';
    /** @type {String} */
    OauthStorageKeys['ExpiresInKey'] = 'expires_in';
    /** @type {String} */
    OauthStorageKeys['CurrentStateKey'] = 'current_state';
})(OauthStorageKeys || (OauthStorageKeys = {}));
/**
 * OAuth Default Storage
 * - localstorage for persistant storage
 * - sessionstorage for temporary storage
 * @class
 */
class OauthStorage {
    get(key) {
        return new Promise((resolve) => {
            if (typeof localStorage !== 'undefined') {
                let data = localStorage.getItem(key);
                if (OauthUtils.assertAvailable(data)) {
                    return resolve(data);
                }
            }
            if (typeof sessionStorage !== 'undefined') {
                let data = sessionStorage.getItem(key);
                if (OauthUtils.assertAvailable(data)) {
                    return resolve(data);
                }
            }
            return resolve(null);
        });
    }
    set(key, value, temporary = false) {
        return new Promise((resolve, reject) => {
            if (temporary) {
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem(key, value);
                    resolve();
                } else {
                    reject();
                }
            } else {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(key, value);
                    resolve();
                } else {
                    reject();
                }
            }
        });
    }
    remove(key) {
        return new Promise((resolve) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem(key);
            }
            resolve();
        });
    }
    clearAll(temporary = false) {
        return new Promise((resolve) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
            }
            if (temporary && typeof sessionStorage !== 'undefined') {
                sessionStorage.clear();
            }
            resolve();
        });
    }
}
/**Common Utils Functions
 * @class
 * */
class OauthUtils {
    /**
     * Check if token is a JWT token and return claims if so
     *
     * @param {String} token
     * @param {String} type  - "header" | "claims" | "signature". Default "claims"
     * @returns {String}
     */
    static parseJWT(token, type = 'claims') {
        if (!token || token == '') return null;
        let split = token.split('.');
        let index = type == 'signature' ? 2 : type == 'claims' ? 1 : 0;
        return split && split.length == 3
            ? Buffer.from(split[index], 'base64').toString('ascii')
            : null;
    }
    /**
     * Check if JWT Token has expired
     * @param {String} token
     * @return {boolean}
     * */
    static hasJWTExpired(token) {
        let data = this.parseJson(this.parseJWT(token));
        let exp = data ? data['exp'] : null;
        return this.hasExpired(+exp);
    }
    /**
     * Check given timestamp has expired
     * @param {Number} exp
     * @param {Number} buffer Buffer time in seconds to account for any unexpected delays e.g network latency
     * @return {boolean}
     * */
    static hasExpired(exp, buffer = 5) {
        return exp ? exp < Math.floor(Date.now() / 1000) + buffer : true;
    }
    /**
     * Get a safe form of string to store,
     * eliminating null and 'undefined'
     * @param {String} item
     * @return {String}
     * */
    static safeString(item) {
        if (OauthUtils.assertAvailable(item)) {
            return item;
        }
        return '';
    }
    /**
     * Get a safe form of stIntring to store,
     * eliminating null and 'undefined'
     * @param {Number} item
     * @return {Number}
     * */
    static safeInt(item) {
        if (OauthUtils.assertAvailable(item)) {
            return item;
        }
        return 0;
    }
    /**
     * Check if item is nut null, undefined or empty
     * eliminating null and 'undefined'
     * @param {any} item
     * @return {boolean}
     * */
    static assertAvailable(item) {
        return item != null && typeof item !== 'undefined' && item !== '';
    }
    /**
     * Count Object array
     * @param {Object} obj
     * @return {Number}
     * */
    static count(obj) {
        let element_count = 0;
        for (const i in obj) {
            if (obj.hasOwnProperty(i)) {
                element_count++;
            }
        }
        return element_count;
    }
    /**
     * Merge Object with another
     * @param {Object} obj
     * @param {Object} src
     * @returns {Object}
     */
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
     *  @param {Object} myData Object
     *  @return {String}
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
                            this.mergeObj(
                                encoded,
                                encodeObj(data[key], subKey, newParent)
                            );
                        } else {
                            encoded.push(
                                encodeURIComponent(
                                    parent + '[' + subKey + ']'
                                ) +
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
                        if (
                            data[key] !== null &&
                            typeof data[key] !== 'undefined'
                        ) {
                            if (
                                typeof data[key] === 'object' ||
                                Array.isArray(data[key])
                            ) {
                                // If object or array
                                this.mergeObj(
                                    encoded,
                                    encodeObj(data, key, key)
                                );
                            } else {
                                encoded.push(
                                    key + '=' + encodeURIComponent(data[key])
                                );
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
     *  @param {String} json string
     *  @return {any}
     *  */
    static parseJson(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    }
    /**
     * Get Url param
     * #source http://www.netlobo.com/url_query_string_javascript.html
     *
     * @param {String} name
     * @param {String} url
     * @returns {String}
     */
    static getUrlParam(name, url) {
        if (!url && typeof location !== 'undefined') {
            url = location.href;
        }
        url = decodeURIComponent(url);
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regexS = '[\\?&]' + name + '=([^&#]*)';
        const regex = new RegExp(regexS);
        const results = regex.exec(url);
        return results == null ? null : results[1];
    }
    /**
     * Return url without it's url parameters
     * @param {String} url Url to strip
     * @return {String}
     * */
    static stripUrlParams(url) {
        if (OauthUtils.assertAvailable(url)) {
            return url.split('?')[0];
        } else {
            return url;
        }
    }
    /**
     * Generate Random value
     * @param {Number} length
     * @return {String}
     * */
    static generateKey(length) {
        if (!OauthUtils.assertAvailable(length)) {
            length = 16;
        }
        let text = '';
        const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        return text;
    }
}
class Oauth {
    /**
     * @param {Object} data
     * @param {String} data.clientId - Your Application's Client ID
     * @param {String} data.clientSecret - Your Application's Client Secret
     * @param {String} data.authorizeUrl - [GET] Url endpoint to authorize or request access
     * @param {String} data.tokenUrl - Url endpoint to obtain token
     * @param {String} data.verifyTokenUrl - [GET] Url endpoint to verify token
     * @param {OauthStorageInterface<string>} data.storage - Handle custom storage - Default storage = browser localStorage or sessionStorage
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
        }
        if (OauthUtils.assertAvailable(data.storage)) {
            Oauth._storage = data.storage;
        }
    }
    static get storage() {
        return this._storage;
    }
    /**
     * Save Access data to Local storage
     * @param {OauthTokenResponse} accessData
     * */
    saveAccess(accessData) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                Oauth.storage.set(
                    OauthStorageKeys.AccessTokenKey,
                    OauthUtils.safeString(accessData.accessToken)
                ),
                Oauth.storage.set(
                    OauthStorageKeys.RefreshTokenKey,
                    OauthUtils.safeString(accessData.refreshToken)
                ),
                Oauth.storage.set(
                    OauthStorageKeys.AccessScopeKey,
                    OauthUtils.safeString(accessData.accessScope)
                ),
                Oauth.storage.set(
                    OauthStorageKeys.TokenTypeKey,
                    OauthUtils.safeString(accessData.tokenType)
                ),
                Oauth.storage.set(
                    OauthStorageKeys.ExpiresInKey,
                    String(
                        OauthUtils.safeInt(
                            Math.floor(Date.now() / 1000) + accessData.expiresIn
                        )
                    )
                ),
            ]);
        });
    }
    /**Clear all access data from session*/
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
    /**
     * Authorize Access to the app.
     * This will check for and validate existing access token.
     * If no access was previously granted, it will then proceed to request one with the details given.
     * If token has expired and a refresh token exists, it will then proceed to refresh the expired token
     * @param {Object} params
     * @param {OauthGrantType} params.grant_type Default - client_credentials grantType
     * @param {OauthGrantType[]} params.allowed_grant_types grant_type(s) to ignore if {OauthGrantType.Auto} selected
     * @param {String} params.redirect_uri For authorization_code grant_type default -> current url
     * @param {String} params.user_id For authorization_code grant_type
     * @param {String} params.username For password grant_type
     * @param {String} params.password For password grant_type
     * @param {(token: string | boolean, msg?: string)=>void} params.callback
     * */
    authorizeAccess(params) {
        return __awaiter(this, void 0, void 0, function* () {
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
                : OauthUtils.stripUrlParams(
                      typeof window !== 'undefined'
                          ? window.location.origin
                          : null
                  );
            const scope = OauthUtils.assertAvailable(params.scope)
                ? params.scope
                : [];
            let state = OauthUtils.assertAvailable(params.state)
                ? params.state
                : OauthUtils.generateKey(32);
            /**Get New Token
             * */
            const getNewOauthToken = () =>
                __awaiter(this, void 0, void 0, function* () {
                    switch (grant_type) {
                        case OauthGrantType.Auto:
                            if (
                                OauthUtils.assertAvailable(params.user_id) ||
                                OauthUtils.assertAvailable(
                                    OauthUtils.getUrlParam('code')
                                )
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
                            const error_description =
                                OauthUtils.getUrlParam('error_description');
                            if (OauthUtils.assertAvailable(code)) {
                                const save_state = yield Oauth.storage.get(
                                    OauthStorageKeys.CurrentStateKey
                                );
                                state = OauthUtils.assertAvailable(save_state)
                                    ? save_state
                                    : state;
                                if (state === OauthUtils.getUrlParam('state')) {
                                    // Get token
                                    this.oauthTokenWithAuthorizationCode(
                                        code,
                                        redirect_uri,
                                        /**
                                         * Ajax Response callback
                                         * @param {OauthTokenResponse} token
                                         * */
                                        (token) =>
                                            __awaiter(
                                                this,
                                                void 0,
                                                void 0,
                                                function* () {
                                                    if (
                                                        OauthUtils.assertAvailable(
                                                            token
                                                        )
                                                    ) {
                                                        if (
                                                            OauthUtils.assertAvailable(
                                                                token.accessToken
                                                            )
                                                        ) {
                                                            // Remove oauth state
                                                            Oauth.storage.remove(
                                                                OauthStorageKeys.CurrentStateKey
                                                            );
                                                            // Save token
                                                            yield this.saveAccess(
                                                                token
                                                            );
                                                            if (
                                                                typeof params.callback ===
                                                                'function'
                                                            ) {
                                                                params.callback(
                                                                    yield Oauth.storage.get(
                                                                        OauthStorageKeys.AccessTokenKey
                                                                    )
                                                                );
                                                            }
                                                            // Remove authorization code from url
                                                            if (
                                                                typeof window !==
                                                                'undefined'
                                                            ) {
                                                                window.location.replace(
                                                                    OauthUtils.stripUrlParams(
                                                                        window
                                                                            .location
                                                                            .href
                                                                    )
                                                                );
                                                            }
                                                        } else if (
                                                            OauthUtils.assertAvailable(
                                                                token.error
                                                            )
                                                        ) {
                                                            if (
                                                                typeof params.callback ===
                                                                'function'
                                                            ) {
                                                                params.callback(
                                                                    false,
                                                                    token.errorDescription
                                                                );
                                                            }
                                                        } else {
                                                            if (
                                                                typeof params.callback ===
                                                                'function'
                                                            ) {
                                                                params.callback(
                                                                    false
                                                                );
                                                            }
                                                        }
                                                    } else {
                                                        if (
                                                            typeof params.callback ===
                                                            'function'
                                                        ) {
                                                            params.callback(
                                                                false
                                                            );
                                                        }
                                                    }
                                                }
                                            )
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
                                Oauth.storage.remove(
                                    OauthStorageKeys.CurrentStateKey
                                );
                                if (
                                    OauthUtils.assertAvailable(
                                        error_description
                                    )
                                ) {
                                    if (typeof params.callback === 'function') {
                                        params.callback(
                                            false,
                                            error_description
                                        );
                                    }
                                } else {
                                    if (typeof params.callback === 'function') {
                                        params.callback(
                                            false,
                                            'Failed authorize access'
                                        );
                                    }
                                }
                            } else {
                                // Get authorization code
                                this.oauthAuthorize(
                                    scope,
                                    redirect_uri,
                                    params.user_id,
                                    state
                                );
                            }
                            break;
                        case OauthGrantType.User_Credentials:
                            // Get token
                            this.oauthTokenWithUserCredentials(
                                params.username,
                                params.password,
                                scope,
                                /**
                                 * Ajax Response callback
                                 * @param {OauthTokenResponse} token
                                 * */
                                (token) =>
                                    __awaiter(
                                        this,
                                        void 0,
                                        void 0,
                                        function* () {
                                            if (
                                                OauthUtils.assertAvailable(
                                                    token
                                                )
                                            ) {
                                                if (
                                                    OauthUtils.assertAvailable(
                                                        token.accessToken
                                                    )
                                                ) {
                                                    // Save token
                                                    yield this.saveAccess(
                                                        token
                                                    );
                                                    if (
                                                        typeof params.callback ===
                                                        'function'
                                                    ) {
                                                        params.callback(
                                                            yield Oauth.storage.get(
                                                                OauthStorageKeys.AccessTokenKey
                                                            )
                                                        );
                                                    }
                                                } else if (
                                                    OauthUtils.assertAvailable(
                                                        token.error
                                                    )
                                                ) {
                                                    if (
                                                        typeof params.callback ===
                                                        'function'
                                                    ) {
                                                        params.callback(
                                                            false,
                                                            token.errorDescription
                                                        );
                                                    }
                                                } else {
                                                    if (
                                                        typeof params.callback ===
                                                        'function'
                                                    ) {
                                                        params.callback(false);
                                                    }
                                                }
                                            } else {
                                                if (
                                                    typeof params.callback ===
                                                    'function'
                                                ) {
                                                    params.callback(false);
                                                }
                                            }
                                        }
                                    )
                            );
                            break;
                        case OauthGrantType.Client_Credentials:
                        default:
                            // Get token
                            this.oauthTokenWithClientCredentials(
                                scope,
                                /**
                                 * Ajax Response callback
                                 * @param {OauthTokenResponse} token
                                 * */
                                (token) =>
                                    __awaiter(
                                        this,
                                        void 0,
                                        void 0,
                                        function* () {
                                            if (
                                                OauthUtils.assertAvailable(
                                                    token
                                                )
                                            ) {
                                                if (
                                                    OauthUtils.assertAvailable(
                                                        token.accessToken
                                                    )
                                                ) {
                                                    // Save token
                                                    yield this.saveAccess(
                                                        token
                                                    );
                                                    if (
                                                        typeof params.callback ===
                                                        'function'
                                                    ) {
                                                        params.callback(
                                                            yield Oauth.storage.get(
                                                                OauthStorageKeys.AccessTokenKey
                                                            )
                                                        );
                                                    }
                                                } else if (
                                                    OauthUtils.assertAvailable(
                                                        token.error
                                                    )
                                                ) {
                                                    if (
                                                        typeof params.callback ===
                                                        'function'
                                                    ) {
                                                        params.callback(
                                                            false,
                                                            token.errorDescription
                                                        );
                                                    }
                                                } else {
                                                    if (
                                                        typeof params.callback ===
                                                        'function'
                                                    ) {
                                                        params.callback(false);
                                                    }
                                                }
                                            } else {
                                                if (
                                                    typeof params.callback ===
                                                    'function'
                                                ) {
                                                    params.callback(false);
                                                }
                                            }
                                        }
                                    )
                            );
                            break;
                    }
                });
            /**Refresh Existing Token
             * @param {String} refreshToken String
             * */
            const refreshOauthToken = (refreshToken) => {
                this.oauthRefreshToken(
                    refreshToken,
                    /**
                     * Ajax Response callback
                     * @param {OauthTokenResponse} token
                     * */
                    (token) =>
                        __awaiter(this, void 0, void 0, function* () {
                            if (OauthUtils.assertAvailable(token)) {
                                if (
                                    OauthUtils.assertAvailable(
                                        token.accessToken
                                    )
                                ) {
                                    // Save token
                                    yield this.saveAccess(token);
                                    if (typeof params.callback === 'function') {
                                        params.callback(
                                            yield Oauth.storage.get(
                                                OauthStorageKeys.AccessTokenKey
                                            )
                                        );
                                    }
                                } else if (
                                    OauthUtils.assertAvailable(token.error)
                                ) {
                                    if (typeof params.callback === 'function') {
                                        params.callback(
                                            false,
                                            token.errorDescription
                                        );
                                        // Clear token
                                        this.clearAccess();
                                        getNewOauthToken();
                                    }
                                } else {
                                    if (typeof params.callback === 'function') {
                                        // Clear token
                                        this.clearAccess();
                                        params.callback(false);
                                    }
                                }
                            } else {
                                if (typeof params.callback === 'function') {
                                    params.callback(false);
                                }
                            }
                        })
                );
            };
            if (
                OauthUtils.assertAvailable(
                    OauthUtils.getUrlParam('access_token')
                )
            ) {
                const accessToken = OauthUtils.getUrlParam('access_token');
                if (!(yield this.hasExpired(accessToken))) {
                    if (typeof params.callback === 'function') {
                        params.callback(
                            OauthUtils.assertAvailable(accessToken)
                                ? accessToken
                                : true
                        );
                    }
                } else {
                    if (typeof params.callback === 'function') {
                        params.callback(false);
                    }
                }
            } else {
                const accessToken = yield Oauth.storage.get(
                    OauthStorageKeys.AccessTokenKey
                );
                const refreshToken = yield Oauth.storage.get(
                    OauthStorageKeys.RefreshTokenKey
                );
                /*Token available, check for refreshing*/
                if (OauthUtils.assertAvailable(accessToken)) {
                    if (!(yield this.hasExpired(accessToken))) {
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
        });
    }
    /**
     * Check if authorization or token has expired
     * @param {String} token
     * @return {Promise<boolean>}
     * */
    hasExpired(token) {
        return __awaiter(this, void 0, void 0, function* () {
            token =
                token ||
                (yield Oauth.storage.get(OauthStorageKeys.AccessTokenKey));
            if (OauthUtils.assertAvailable(token)) {
                if (!OauthUtils.hasJWTExpired(token)) {
                    return false;
                } else {
                    let expiresIn = yield Oauth.storage.get(
                        OauthStorageKeys.ExpiresInKey
                    );
                    if (OauthUtils.assertAvailable(expiresIn)) {
                        return OauthUtils.hasExpired(+expiresIn);
                    }
                }
            }
            return true;
        });
    }
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {String} redirect_url
     * @param {String} user_id
     * @param {String} state
     * @param {(url: string)=>any} callback
     * */
    oauthAuthorize(scope, redirect_url, user_id, state, callback) {
        if (!OauthUtils.assertAvailable(redirect_url)) {
            throw new Error("'redirect_url' Required");
        }
        Oauth.storage.set(OauthStorageKeys.CurrentStateKey, state, true);
        const params = {
            client_id: this.clientId,
            scope: scope.join(' '),
            state: state,
            response_type: 'code',
            user_id: user_id,
            redirect_uri: redirect_url,
        };
        const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(
            params
        )}`;
        if (callback) {
            callback(url);
        } else if (typeof window !== 'undefined') {
            // Open authorization url
            window.open(url, '_blank');
        }
    }
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {String} redirect_url
     * @param {String} email
     * @param {String} state
     * @param {(url: string)=>any} callback
     * */
    oauthAuthorizeWithEmail(scope, redirect_url, email, state, callback) {
        if (!OauthUtils.assertAvailable(redirect_url)) {
            throw new Error("'redirect_url' Required");
        }
        Oauth.storage.set(OauthStorageKeys.CurrentStateKey, state, true);
        const params = {
            client_id: this.clientId,
            scope: scope.join(' '),
            state: state,
            response_type: 'code',
            email: email,
            redirect_uri: redirect_url,
        };
        const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(
            params
        )}`;
        if (callback) {
            callback(url);
        } else if (typeof window !== 'undefined') {
            // Open authorization url
            window.open(url, '_blank');
        }
    }
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {String} redirect_url
     * @param {String} user_id
     * @param {String} state
     * @param {(url: string)=>any} callback
     * */
    oauthAuthorizeImplicit(scope, redirect_url, user_id, state, callback) {
        if (!OauthUtils.assertAvailable(redirect_url)) {
            throw new Error("'redirect_url' Required");
        }
        if (!OauthUtils.assertAvailable(scope)) {
            throw new Error("'scope' Required");
        }
        Oauth.storage.set(OauthStorageKeys.CurrentStateKey, state, true);
        const params = {
            client_id: this.clientId,
            scope: scope.join(' '),
            state: state,
            response_type: 'token',
            user_id: user_id,
            redirect_uri: redirect_url,
        };
        const url = `${this.authorizeUrl}?${OauthUtils.urlEncodeObject(
            params
        )}`;
        if (callback) {
            callback(url);
        } else if (typeof window !== 'undefined') {
            // Open authorization url
            window.open(url, '_blank');
        }
    }
    /**
     * Get oauth token with Client credentials
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse)=>any} callback
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
            success: (result) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result));
                }
            },
            fail: (result, reason) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result), reason);
                }
            },
        });
    }
    /**
     * Get oauth token with Client credentials
     * @param {String} username
     * @param {String} password
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse)=>any} callback
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
            success: (result) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result));
                }
            },
            fail: (result, reason) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result), reason);
                }
            },
        });
    }
    /**Get oauth token with Client credentials
     * @param {String} code
     * @param {String} redirect_uri
     * @param {(verify: OauthTokenResponse)=>any} callback
     * */
    oauthTokenWithAuthorizationCode(code, redirect_uri, callback) {
        if (!OauthUtils.assertAvailable(code)) {
            throw new Error("'code' Required");
        }
        if (!OauthUtils.assertAvailable(redirect_uri)) {
            throw new Error("'redirect_uri' Required");
        }
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.Authorization_Code,
                code: code,
                redirect_uri: redirect_uri,
                client_id: this.clientId,
                client_secret: this.clientSecret,
            },
            success: (result) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result));
                }
            },
            fail: (result, reason) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result), reason);
                }
            },
        });
    }
    /**Get oauth Refresh Token with
     * Client credentials
     * @param {String} refresh_token
     * @param {(verify: OauthTokenResponse)=>any} callback
     * */
    oauthRefreshToken(refresh_token, callback) {
        if (!OauthUtils.assertAvailable(refresh_token)) {
            throw new Error("'refresh_token' Required");
        }
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.Refresh_Token,
                refresh_token: refresh_token,
                client_id: this.clientId,
                client_secret: this.clientSecret,
            },
            success: (result) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result));
                }
            },
            fail: (result, reason) => {
                if (typeof callback === 'function') {
                    callback(new OauthTokenResponse(result), reason);
                }
            },
        });
    }
    /**
     * Get oauth Refresh Token with
     * Client credentials
     * @param {String} access_token
     * @param {(verify: OauthVerificationResponse, msg?: string) => any} callback
     * */
    oauthVerifyToken(access_token, callback) {
        if (!OauthUtils.assertAvailable(this.verifyTokenUrl)) {
            throw new Error("'verifyTokenUrl' was not specified");
        }
        if (!OauthUtils.assertAvailable(access_token)) {
            throw new Error("'access_token' Required");
        }
        OauthRequest.get({
            url: this.verifyTokenUrl,
            withAccessToken: true,
            accessToken: access_token,
            success: (result) => {
                if (typeof callback === 'function') {
                    callback(new OauthVerificationResponse(result));
                }
            },
            fail: (result, reason) => {
                if (typeof callback === 'function') {
                    callback(new OauthVerificationResponse(result), reason);
                }
            },
        });
    }
}
Oauth._storage = new OauthStorage();
/**Grant Types
 * @enum
 */
var OauthGrantType;
(function (OauthGrantType) {
    /** @type {String} */
    OauthGrantType['Client_Credentials'] = 'client_credentials';
    /** @type {String} */
    OauthGrantType['Authorization_Code'] = 'authorization_code';
    /** @type {String} */
    OauthGrantType['User_Credentials'] = 'password';
    /** @type {String} */
    OauthGrantType['Refresh_Token'] = 'refresh_token';
    /** @type {String} */
    OauthGrantType['Auto'] = 'auto';
})(OauthGrantType || (OauthGrantType = {}));
/**Http Request Method
 * @enum
 */
var OauthRequestMethod;
(function (OauthRequestMethod) {
    /** @type {String} */
    OauthRequestMethod['GET'] = 'get';
    /** @type {String} */
    OauthRequestMethod['POST'] = 'post';
    /** @type {String} */
    OauthRequestMethod['PUT'] = 'put';
    /** @type {String} */
    OauthRequestMethod['DELETE'] = 'delete';
})(OauthRequestMethod || (OauthRequestMethod = {}));
/**Make Oauth Http requests
 * @class
 * */
class OauthRequest {
    /**
     * @param {OauthRequestParams} data
     * @param {OauthRequestMethod} method
     * */
    constructor(method = OauthRequestMethod.GET) {
        this.method = method;
        this.axhttp = axios.create({
            timeout: 20000,
        });
    }
    /**Make GET Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static get(data) {
        const http = new OauthRequest(OauthRequestMethod.GET);
        return http.request(data);
    }
    /**Make POST Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static post(data) {
        const http = new OauthRequest(OauthRequestMethod.POST);
        return http.request(data);
    }
    /**Make PUT Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static put(data) {
        const http = new OauthRequest(OauthRequestMethod.PUT);
        return http.request(data);
    }
    /**Make DELETE Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static delete(data) {
        const http = new OauthRequest(OauthRequestMethod.DELETE);
        return http.request(data);
    }
    /**
     * Make Http requests
     * @param {OauthRequestParams<T>} data
     * @returns {Promise<T>}
     */
    request(data) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Set options
            let options = {
                url: data.url,
                method: this.method,
                params: data.query || {},
                data: data.params || {},
                headers: data.headers || {},
            };
            // Add basic credentials if requested
            if (data.withCredentials) {
                options.auth = {
                    username: data.username,
                    password: data.password,
                };
            }
            // Add Access Token if requested
            if (data.withAccessToken) {
                options.headers['Authorization'] =
                    (data.accessTokenType || 'Bearer') + ' ' + data.accessToken;
            }
            // Perform request
            try {
                const result = yield this.axhttp.request(options);
                if (result) {
                    if (result.status === 200 || result.status === 201) {
                        data.success(result.data);
                    } else {
                        data.fail(result.data, result.statusText);
                    }
                    return result.data;
                }
                return null;
            } catch (e) {
                if (axios.isAxiosError(e)) {
                    data.fail(
                        (_a = e.response) === null || _a === void 0
                            ? void 0
                            : _a.data,
                        e.message
                    );
                    return (_b = e.response) === null || _b === void 0
                        ? void 0
                        : _b.data;
                } else if (e instanceof Error) {
                    data.fail(null, e.message);
                } else if (typeof e === 'string') {
                    data.fail(null, e);
                } else {
                    data.fail();
                }
                return null;
            }
        });
    }
}
/**Oauth Response
 * @class
 * */
class OauthResponse {
    /**
     * @param {String} result json result
     * @returns {OauthVerificationResponse}
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
    /**
     * @param {String} result json result
     * @returns {OauthAuthorizationResponse}
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
    /**
     * @param {String} result json result
     * @returns {OauthTokenResponse}
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
/**Verification Response
 * @class
 * */
class OauthVerificationResponse {
    /**
     * @param {Object} data
     */
    constructor(data) {
        if (!data) return;
        this.success = data['success'];
        this.error = data['error'];
        this.errorDescription = data['error_description'];
    }
}
/**Authorization Respons
 * @class
 * */
class OauthAuthorizationResponse {
    /**
     * @param {Object} data
     */
    constructor(data) {
        if (!data) return;
        this.state = data['state'];
        this.code = data['code'];
        this.error = data['error'];
        this.errorDescription = data['error_description'];
    }
}
/**Token Response
 * @class
 * */
class OauthTokenResponse {
    /**
     * @param {Object} data
     */
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
export {
    OauthStorageKeys,
    OauthStorage,
    OauthUtils,
    Oauth,
    OauthGrantType,
    OauthRequestMethod,
    OauthRequest,
    OauthResponse,
    OauthVerificationResponse,
    OauthAuthorizationResponse,
    OauthTokenResponse,
};
