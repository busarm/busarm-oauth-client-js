/**Store and Retrieve Oauth variables*/
export interface OauthStorageInterface<T> {
    get(key: string): Promise<T>;
    set(key: string, value: T, temporary?: boolean): Promise<void>;
    remove(key: string): Promise<void>;
    clearAll(temporary?: boolean): Promise<void>;
}
export enum OauthStorageKeys {
    AccessTokenKey = 'access_token',
    RefreshTokenKey = 'refresh_token',
    AccessScopeKey = 'scope',
    TokenTypeKey = 'token_type',
    ExpiresInKey = 'expires_in',
    CurrentStateKey = 'current_state',
}
export class OauthStorage implements OauthStorageInterface<string> {
    get(key: string): Promise<string> {
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
    set(key: string, value: string, temporary = false): Promise<void> {
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
    remove(key: string): Promise<void> {
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
    clearAll(temporary = false): Promise<void> {
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

/**Common Functions*/
export class OauthUtils {
    /**
     * Check if token is a JWT token and return claims if so
     * @return {string}
     * */
    static parseJWT(token: string): string {
        let split = token.split('.');
        return split && split.length == 3
            ? Buffer.from(split[1]).toString('base64')
            : null;
    }

    /**
     * Check if JWT Token has expired
     * @return {boolean}
     * */
    static hasJWTExpired(token: string): boolean {
        let data = this.parseJson(this.parseJWT(token));
        let exp = data ? data['exp' as keyof object] : null;
        return exp ? parseInt(exp) < Math.floor(Date.now() / 1000) + 10 : true; // + 10 to account for any network latency
    }

    /**
     * Check if token has expired
     * @return {Promise<boolean>}
     * */
    static async hasTokenExpired(token?: string): Promise<boolean> {
        token =
            token || (await Oauth.storage.get(OauthStorageKeys.AccessTokenKey));
        if (OauthUtils.assertAvailable(token)) {
            if (
                OauthUtils.parseJWT(token) &&
                !OauthUtils.hasJWTExpired(token)
            ) {
                return false;
            } else {
                let expiresIn = await Oauth.storage.get(
                    OauthStorageKeys.ExpiresInKey
                );
                if (OauthUtils.assertAvailable(expiresIn)) {
                    return (
                        parseInt(expiresIn) < Math.floor(Date.now() / 1000) + 10
                    ); // + 10 to account for any network latency
                }
            }
        }
        return true;
    }

    /**
     * Get a safe form of string to store,
     * eliminating null and 'undefined'
     * @param item
     * @return {string}
     * */
    static safeString(item: string): string {
        if (OauthUtils.assertAvailable(item)) {
            return item;
        }
        return '';
    }

    /**
     * Get a safe form of stIntring to store,
     * eliminating null and 'undefined'
     * @param item
     * @return {number}
     * */
    static safeInt(item: number): number {
        if (OauthUtils.assertAvailable(item)) {
            return item;
        }
        return 0;
    }

    /**
     * Check if item is nut null, undefined or empty
     * eliminating null and 'undefined'
     * @param item
     * @return {boolean}
     * */
    static assertAvailable(item: any): boolean {
        return item != null && typeof item !== 'undefined' && item !== '';
    }

    /**
     * Count Object array
     * @return {number}
     * */
    static count(obj: object): number {
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
     * @returns {object}
     */
    static mergeObj(obj: object, src: object): object {
        Object.keys(src).forEach((key) => {
            if (src.hasOwnProperty(key)) {
                if (Array.isArray(obj)) {
                    obj.push(src[key as keyof object]);
                } else {
                    obj[this.count(obj) as keyof object] =
                        src[key as keyof object];
                }
            }
        });
        return obj;
    }

    /**Encode Object content to url string
     *  @param myData Object
     *  @return {string}
     * */
    static urlEncodeObject(myData: object): string {
        const encodeObj = (data: any, key: string, parent: any) => {
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

        const encodeData = (data: any) => {
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
     *  @param json string
     *  @return {any}
     *  */
    static parseJson(json: string): any {
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
     * @param {string} name
     * @param {string} url
     * @returns {string}
     */
    static getUrlParam(name: string, url?: string): string {
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

    /**
     * Return url without it's url parameters
     * @param {string} url Url to strip
     * @return {string}
     * */
    static stripUrlParams(url: string): string {
        if (OauthUtils.assertAvailable(url)) {
            return url.split('?')[0];
        } else {
            return url;
        }
    }

    /**
     * Generate Random value
     * @param {number} length
     * @return {string}
     * */
    static generateKey(length: number): string {
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

export class Oauth {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly authorizeUrl: string;
    private readonly tokenUrl: string;
    private readonly verifyTokenUrl: string;

    /**
     * @var {OauthStorageInterface<string>}
     */
    static storage: OauthStorageInterface<string> = new OauthStorage();

    /**
     * @param {object} data
     * @param {string} data.clientId - Your Application's Client ID
     * @param {string} data.clientSecret - Your Application's Client Secret
     * @param {string} data.authorizeUrl - [GET] Url endpoint to authorize or request access
     * @param {string} data.tokenUrl - Url endpoint to obtain token
     * @param {string} data.verifyTokenUrl - [GET] Url endpoint to verify token
     * @param {OauthStorageInterface<string>} data.storage - Handle custom storage - Default storage = browser localStorage or sessionStorage
     * */
    constructor(data: {
        clientId: string;
        clientSecret: string;
        authorizeUrl: string;
        tokenUrl: string;
        verifyTokenUrl?: string;
        storage?: OauthStorageInterface<string>;
    }) {
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
            Oauth.storage = data.storage;
        }
    }

    /**
     * Save Access data to Local storage
     * @param {OauthTokenResponse} accessData
     * */
    async saveAccess(accessData: OauthTokenResponse) {
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
    }

    /**Clear all access data from session*/
    async clearAccess() {
        Promise.all([
            Oauth.storage.remove(OauthStorageKeys.AccessTokenKey),
            Oauth.storage.remove(OauthStorageKeys.RefreshTokenKey),
            Oauth.storage.remove(OauthStorageKeys.AccessScopeKey),
            Oauth.storage.remove(OauthStorageKeys.TokenTypeKey),
            Oauth.storage.remove(OauthStorageKeys.ExpiresInKey),
            Oauth.storage.remove(OauthStorageKeys.CurrentStateKey),
        ]);
    }

    /**
     * Authorize Access to the app
     * @param {object} params
     * @param {OauthGrantType} params.grant_type Default - client_credentials grantType
     * @param {OauthGrantType[]} params.allowed_grant_types grant_type(s) to ignore if {OauthGrantType.Auto} selected
     * @param {string} params.redirect_uri For authorization_code grant_type default -> current url
     * @param {string} params.user_id For authorization_code grant_type
     * @param {string} params.username For password grant_type
     * @param {string} params.password For password grant_type
     * @param {(token: string | boolean, msg?: string)} params.callback
     * */
    async authorizeAccess(params: {
        grant_type?: OauthGrantType;
        allowed_grant_types?: OauthGrantType[];
        redirect_uri?: string;
        user_id?: string;
        username?: string;
        password?: string;
        state?: string;
        scope?: string[];
        callback?: (token: string | boolean, msg?: string) => any;
    }) {
        let grant_type: OauthGrantType = OauthUtils.assertAvailable(
            params.grant_type
        )
            ? params.grant_type
            : OauthGrantType.Client_Credentials;
        const allowed_grant_types: OauthGrantType[] =
            OauthUtils.assertAvailable(params.allowed_grant_types)
                ? params.allowed_grant_types
                : [];
        const redirect_uri: string = OauthUtils.assertAvailable(
            params.redirect_uri
        )
            ? params.redirect_uri
            : OauthUtils.stripUrlParams(location.origin);
        const scope: string[] = OauthUtils.assertAvailable(params.scope)
            ? params.scope
            : [];
        let state: string = OauthUtils.assertAvailable(params.state)
            ? params.state
            : OauthUtils.generateKey(32);

        /**Get New Token
         * */
        const getNewOauthToken = async () => {
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
                        const save_state = await Oauth.storage.get(
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
                                 * @param {XMLHttpRequest} xhr
                                 * */
                                async (
                                    token: OauthTokenResponse,
                                    xhr: XMLHttpRequest
                                ) => {
                                    if (OauthUtils.assertAvailable(token)) {
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
                                            await this.saveAccess(token);

                                            if (
                                                typeof params.callback ===
                                                'function'
                                            ) {
                                                params.callback(
                                                    await Oauth.storage.get(
                                                        OauthStorageKeys.AccessTokenKey
                                                    )
                                                );
                                            }

                                            // Remove authorization code from url
                                            location.replace(
                                                OauthUtils.stripUrlParams(
                                                    window.location.href
                                                )
                                            );
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
                        Oauth.storage.remove(OauthStorageKeys.CurrentStateKey);

                        if (OauthUtils.assertAvailable(error_description)) {
                            if (typeof params.callback === 'function') {
                                params.callback(false, error_description);
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
                         * @param {XMLHttpRequest} xhr
                         * */
                        async (
                            token: OauthTokenResponse,
                            xhr: XMLHttpRequest
                        ) => {
                            if (OauthUtils.assertAvailable(token)) {
                                if (
                                    OauthUtils.assertAvailable(
                                        token.accessToken
                                    )
                                ) {
                                    // Save token
                                    await this.saveAccess(token);

                                    if (typeof params.callback === 'function') {
                                        params.callback(
                                            await Oauth.storage.get(
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
                        /**
                         * Ajax Response callback
                         * @param {OauthTokenResponse} token
                         * @param {XMLHttpRequest} xhr
                         * */
                        async (
                            token: OauthTokenResponse,
                            xhr: XMLHttpRequest
                        ) => {
                            if (OauthUtils.assertAvailable(token)) {
                                if (
                                    OauthUtils.assertAvailable(
                                        token.accessToken
                                    )
                                ) {
                                    // Save token
                                    await this.saveAccess(token);

                                    if (typeof params.callback === 'function') {
                                        params.callback(
                                            await Oauth.storage.get(
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
        const refreshOauthToken = (refreshToken: string) => {
            this.oauthRefreshToken(
                refreshToken,
                /**
                 * Ajax Response callback
                 * @param {OauthTokenResponse} token
                 * @param {XMLHttpRequest} xhr
                 * */
                async (token: OauthTokenResponse, xhr: XMLHttpRequest) => {
                    if (OauthUtils.assertAvailable(token)) {
                        if (OauthUtils.assertAvailable(token.accessToken)) {
                            // Save token
                            await this.saveAccess(token);

                            if (typeof params.callback === 'function') {
                                params.callback(
                                    await Oauth.storage.get(
                                        OauthStorageKeys.AccessTokenKey
                                    )
                                );
                            }
                        } else if (OauthUtils.assertAvailable(token.error)) {
                            if (typeof params.callback === 'function') {
                                params.callback(false, token.errorDescription);
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
                }
            );
        };

        if (
            OauthUtils.assertAvailable(OauthUtils.getUrlParam('access_token'))
        ) {
            const accessToken = OauthUtils.getUrlParam('access_token');
            if (!(await OauthUtils.hasTokenExpired(accessToken))) {
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
            const accessToken = await Oauth.storage.get(
                OauthStorageKeys.AccessTokenKey
            );
            const refreshToken = await Oauth.storage.get(
                OauthStorageKeys.RefreshTokenKey
            );
            /*Token available, check for refreshing*/
            if (OauthUtils.assertAvailable(accessToken)) {
                if (!(await OauthUtils.hasTokenExpired(accessToken))) {
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
    async hasExpired() {
        return OauthUtils.hasTokenExpired(
            await Oauth.storage.get(OauthStorageKeys.AccessTokenKey)
        );
    }

    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {string} redirect_url
     * @param {string} user_id
     * @param {string} state
     * */
    oauthAuthorize(
        scope: string[],
        redirect_url: string,
        user_id: string,
        state: string
    ) {
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

        // Open authorization url
        window.open(url, '_blank');
    }

    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {string} redirect_url
     * @param {string} email
     * @param {string} state
     * */
    oauthAuthorizeWithEmail(
        scope: string[],
        redirect_url: string,
        email: string,
        state: string
    ) {
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

        // Open authorization url
        window.open(url, '_blank');
    }

    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {string} redirect_url
     * @param {string} user_id
     * @param {string} state
     * */
    oauthAuthorizeImplicit(
        scope: string[],
        redirect_url: string,
        user_id: string,
        state: string
    ) {
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

        // Open authorization url
        window.open(url, '_blank');
    }

    /**
     * Get oauth token with Client credentials
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthTokenWithClientCredentials(
        scope: string[],
        callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any
    ) {
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.Client_Credentials,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: scope.join(' '),
            },
            /**Ajax Response callback
             * @param {XMLHttpRequest} xhr
             * */
            success: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param {XMLHttpRequest} xhr
             * */
            fail: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
        });
    }

    /**
     * Get oauth token with Client credentials
     * @param {string} username
     * @param {string} password
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthTokenWithUserCredentials(
        username: string,
        password: string,
        scope: string[],
        callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any
    ) {
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
             * @param {XMLHttpRequest} xhr
             * */
            success: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param {XMLHttpRequest} xhr
             * */
            fail: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
        });
    }

    /**Get oauth token with Client credentials
     * @param {string} code
     * @param {string} redirect_uri
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthTokenWithAuthorizationCode(
        code: string,
        redirect_uri: string,
        callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any
    ) {
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
             * @param {XMLHttpRequest} xhr
             * */
            success: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param {XMLHttpRequest} xhr
             * */
            fail: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
        });
    }

    /**Get oauth Refresh Token with
     * Client credentials
     * @param {string} refreshToken
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthRefreshToken(
        refreshToken: string,
        callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any
    ) {
        OauthRequest.post({
            url: this.tokenUrl,
            params: {
                grant_type: OauthGrantType.Refresh_Token,
                refresh_token: refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret,
            },
            /**Ajax Response callback
             * @param {XMLHttpRequest} xhr
             * */
            success: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
            /**Ajax Response callback
             * @param {XMLHttpRequest} xhr
             * */
            fail: (xhr: XMLHttpRequest) => {
                const token = OauthResponse.parseTokenResponse(
                    xhr.responseText
                );
                if (typeof callback === 'function') {
                    callback(token, xhr);
                }
            },
        });
    }

    /**
     * Get oauth Refresh Token with
     * Client credentials
     * @param accessToken string
     * @param callback function
     * */
    oauthVerifyToken(
        accessToken: string,
        callback: (
            verify: OauthVerificationResponse,
            xhr: XMLHttpRequest
        ) => any
    ) {
        if (this.verifyTokenUrl) {
            OauthRequest.get({
                url: this.verifyTokenUrl,
                accessToken,
                /**Ajax Response callback
                 * @param {XMLHttpRequest} xhr
                 * */
                success: (xhr: XMLHttpRequest) => {
                    const verify = OauthResponse.parseVerificationResponse(
                        xhr.responseText
                    );
                    if (typeof callback === 'function') {
                        callback(verify, xhr);
                    }
                },
                /**Ajax Response callback
                 * @param {XMLHttpRequest} xhr
                 * */
                fail: (xhr: XMLHttpRequest) => {
                    const verify = OauthResponse.parseVerificationResponse(
                        xhr.responseText
                    );
                    if (typeof callback === 'function') {
                        callback(verify, xhr);
                    }
                },
            });
        } else {
            throw new Error("'verifyTokenUrl' was not specified");
        }
    }
}

/**Grant Types*/
export enum OauthGrantType {
    Client_Credentials = 'client_credentials',
    Authorization_Code = 'authorization_code',
    User_Credentials = 'password',
    Refresh_Token = 'refresh_token',
    Auto = 'auto',
}

/**Http Request Method*/
export enum OauthRequestMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
}

/**Http Request Params*/
export interface OauthRequestParams {
    url: string;
    headers?: {
        [header: string]: string;
    };
    query?: {
        [query: string]: string;
    };
    params?: {
        [param: string]: any;
    };
    withCredentials?: boolean;
    username?: string;
    password?: string;
    withAccessToken?: boolean;
    accessTokenType?: string;
    accessToken?: string;
    success?: (xhr?: XMLHttpRequest, result?: string) => any;
    fail?: (xhr?: XMLHttpRequest) => any;
}

/**Make Oauth Http requests*/
export class OauthRequest {
    private readonly xhttp: XMLHttpRequest;
    private data: OauthRequestParams;
    private method: OauthRequestMethod;

    /**Make GET Requests
     * @param {OauthRequestParams} data
     * */
    static get(data: OauthRequestParams) {
        const http = new OauthRequest(data, OauthRequestMethod.GET);
        http.request();
    }

    /**Make POST Requests
     * @param {OauthRequestParams} data
     * */
    static post(data: OauthRequestParams) {
        const http = new OauthRequest(data, OauthRequestMethod.POST);
        http.request();
    }

    /**Make PUT Requests
     * @param {OauthRequestParams} data
     * */
    static put(data: OauthRequestParams) {
        const http = new OauthRequest(data, OauthRequestMethod.PUT);
        http.request();
    }

    /**Make DELETE Requests
     * @param {OauthRequestParams} data
     * */
    static delete(data: OauthRequestParams) {
        const http = new OauthRequest(data, OauthRequestMethod.DELETE);
        http.request();
    }

    /**
     * @param {OauthRequestParams} data
     * @param {OauthRequestMethod} method
     * */
    constructor(
        data: OauthRequestParams,
        method: OauthRequestMethod = OauthRequestMethod.GET
    ) {
        this.data = data;
        this.method = method;
        this.xhttp = new XMLHttpRequest();
    }

    /**Make Http requests*/
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

        // If Queries available
        if (OauthUtils.assertAvailable(this.data.query)) {
            if (this.data.url.match(/('?')/) == null) {
                this.data.url += `?${OauthUtils.urlEncodeObject(
                    this.data.query
                )}`;
            } else {
                this.data.url += `&${OauthUtils.urlEncodeObject(
                    this.data.query
                )}`;
            }
        }

        // If GET Request
        if (this.method === OauthRequestMethod.GET) {
            if (OauthUtils.assertAvailable(this.data.params)) {
                if (this.data.url.match(/('?')/) == null) {
                    this.data.url += `?${OauthUtils.urlEncodeObject(
                        this.data.params
                    )}`;
                } else {
                    this.data.url += `&${OauthUtils.urlEncodeObject(
                        this.data.params
                    )}`;
                }
            }
        }

        this.xhttp.withCredentials = this.data.withCredentials;
        this.xhttp.open(this.method.toString().toLowerCase(), this.data.url);

        // Get response
        this.xhttp.onreadystatechange = () => {
            if (this.xhttp.readyState === this.xhttp.DONE) {
                if (this.xhttp.status === 200) {
                    if (
                        this.data.success &&
                        typeof this.data.success === 'function'
                    ) {
                        this.data.success(this.xhttp, this.xhttp.responseText);
                    }
                } else {
                    if (
                        this.data.fail &&
                        typeof this.data.fail === 'function'
                    ) {
                        this.data.fail(this.xhttp);
                    }
                }
            }
        };

        // Add headers
        if (
            this.data.headers !== null &&
            typeof this.data.headers === 'object'
        ) {
            for (const key in this.data.headers) {
                if (this.data.headers.hasOwnProperty(key)) {
                    if (
                        this.data.headers[key as keyof object] !== null &&
                        typeof this.data.headers[key as keyof object] !==
                            'undefined'
                    ) {
                        this.xhttp.setRequestHeader(
                            key,
                            this.data.headers[key as keyof object]
                        );
                    }
                }
            }
        }

        // Add Basic Credentials if requested
        if (this.data.withCredentials) {
            this.xhttp.setRequestHeader(
                'Authorization',
                'Basic ' +
                    Buffer.from(
                        this.data.username + ':' + this.data.password
                    ).toString('base64')
            );
        }

        // Add Access Token if requested
        if (this.data.withAccessToken) {
            this.xhttp.setRequestHeader(
                'Authorization',
                (this.data.accessTokenType || 'Bearer') +
                    ' ' +
                    this.data.accessToken
            );
        }

        // Send Request
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
                const data = OauthUtils.urlEncodeObject(this.data.params);
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
    static parseVerificationResponse(
        result: string
    ): OauthVerificationResponse | null {
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
    static parseAuthorizationResponse(result: string) {
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
    static parseTokenResponse(result: string): OauthTokenResponse {
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
    public success: boolean;
    public error: string;
    public errorDescription: string;

    constructor(data?: object) {
        if (!data) return;
        this.success = data['success' as keyof object];
        this.error = data['error' as keyof object];
        this.errorDescription = data['error_description' as keyof object];
    }
}

/**Authorization Response*/
export class OauthAuthorizationResponse {
    public state: string;
    public code: string;
    public error: string;
    public errorDescription: string;

    constructor(data?: object) {
        if (!data) return;
        this.state = data['state' as keyof object];
        this.code = data['code' as keyof object];

        this.error = data['error' as keyof object];
        this.errorDescription = data['error_description' as keyof object];
    }
}

/**Authorization Response*/
export class OauthTokenResponse {
    public accessToken: string;
    public refreshToken: string;
    public tokenType: string;
    public accessScope: string;
    public expiresIn: number;
    public error: string;
    public errorDescription: string;

    constructor(data?: object) {
        if (!data) return;
        this.accessToken = data['access_token' as keyof object];
        this.refreshToken = data['refresh_token' as keyof object];
        this.tokenType = data['token_type' as keyof object];
        this.accessScope = data['scope' as keyof object];
        this.expiresIn = data['expires_in' as keyof object];

        this.error = data['error' as keyof object];
        this.errorDescription = data['error_description' as keyof object];
    }
}
