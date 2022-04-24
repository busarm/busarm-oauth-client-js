/**Store and Retrieve Oauth variables
 * @interface
 */
interface OauthStorageInterface<T> {
    /**
     * Get Item from storage
     * @param {String} key
     * @returns {Promise<T>}
     */
    get(key: string): Promise<T>;
    /**
     * Set Item to storage
     * @param {String} key
     * @param {T} value
     * @param {Boolean} temporary
     * @returns {Promise<void>}
     */
    set(key: string, value: T, temporary?: boolean): Promise<void>;
    /**
     * Remove Item from storage
     * @param {String} key
     * @returns {Promise<void>}
     */
    remove(key: string): Promise<void>;
    /**
     * Clear all items from storage
     * @param {Boolean} temporary
     * @returns {Promise<void>}
     */
    clearAll(temporary?: boolean): Promise<void>;
}
/**
 * Oauth Storage Keys
 * @enum
 */
declare enum OauthStorageKeys {
    /** @type {String} */
    AccessTokenKey = "access_token",
    /** @type {String} */
    RefreshTokenKey = "refresh_token",
    /** @type {String} */
    AccessScopeKey = "scope",
    /** @type {String} */
    TokenTypeKey = "token_type",
    /** @type {String} */
    ExpiresInKey = "expires_in",
    /** @type {String} */
    CurrentStateKey = "current_state"
}
/**
 * OAuth Default Storage
 * - localstorage for persistant storage
 * - sessionstorage for temporary storage
 * @class
 */
declare class OauthStorage implements OauthStorageInterface<string> {
    get(key: string): Promise<string>;
    set(key: string, value: string, temporary?: boolean): Promise<void>;
    remove(key: string): Promise<void>;
    clearAll(temporary?: boolean): Promise<void>;
}
/**Common Utils Functions
 * @class
 * */
declare class OauthUtils {
    /**
     * Check if token is a JWT token and return claims if so
     *
     * @param {String} token
     * @param {String} type  - "header" | "claims" | "signature". Default "claims"
     * @returns {String}
     */
    static parseJWT(token: string, type?: "header" | "claims" | "signature"): string;
    /**
     * Check if JWT Token has expired
     * @param {String} token
     * @return {boolean}
     * */
    static hasJWTExpired(token: string): boolean;
    /**
     * Check given timestamp has expired
     * @param {Number} exp
     * @param {Number} buffer Buffer time in seconds to account for any unexpected delays e.g network latency
     * @return {boolean}
     * */
    static hasExpired(exp: number, buffer?: number): boolean;
    /**
     * Get a safe form of string to store,
     * eliminating null and 'undefined'
     * @param {String} item
     * @return {String}
     * */
    static safeString(item: string): string;
    /**
     * Get a safe form of stIntring to store,
     * eliminating null and 'undefined'
     * @param {Number} item
     * @return {Number}
     * */
    static safeInt(item: number): number;
    /**
     * Check if item is nut null, undefined or empty
     * eliminating null and 'undefined'
     * @param {any} item
     * @return {boolean}
     * */
    static assertAvailable(item: any): boolean;
    /**
     * Count Object array
     * @param {Object} obj
     * @return {Number}
     * */
    static count(obj: object): number;
    /**
     * Merge Object with another
     * @param {Object} obj
     * @param {Object} src
     * @returns {Object}
     */
    static mergeObj(obj: object, src: object): object;
    /**Encode Object content to url string
     *  @param {Object} myData Object
     *  @return {String}
     * */
    static urlEncodeObject(myData: object): string;
    /** Parse Json string to object
     *  @param {String} json string
     *  @return {any}
     *  */
    static parseJson(json: string): any;
    /**
     * Get Url param
     * #source http://www.netlobo.com/url_query_string_javascript.html
     *
     * @param {String} name
     * @param {String} url
     * @returns {String}
     */
    static getUrlParam(name: string, url?: string): string;
    /**
     * Return url without it's url parameters
     * @param {String} url Url to strip
     * @return {String}
     * */
    static stripUrlParams(url: string): string;
    /**
     * Generate Random value
     * @param {Number} length
     * @return {String}
     * */
    static generateKey(length: number): string;
}
declare class Oauth {
    private readonly clientId;
    private readonly clientSecret;
    private readonly authorizeUrl;
    private readonly tokenUrl;
    private readonly verifyTokenUrl;
    static get storage(): OauthStorageInterface<string>;
    private static _storage;
    /**
     * @param {Object} data
     * @param {String} data.clientId - Your Application's Client ID
     * @param {String} data.clientSecret - Your Application's Client Secret
     * @param {String} data.authorizeUrl - [GET] Url endpoint to authorize or request access
     * @param {String} data.tokenUrl - Url endpoint to obtain token
     * @param {String} data.verifyTokenUrl - [GET] Url endpoint to verify token
     * @param {OauthStorageInterface<string>} data.storage - Handle custom storage - Default storage = browser localStorage or sessionStorage
     * */
    constructor(data: {
        clientId: string;
        clientSecret: string;
        authorizeUrl: string;
        tokenUrl: string;
        verifyTokenUrl?: string;
        storage?: OauthStorageInterface<string>;
    });
    /**
     * Save Access data to Local storage
     * @param {OauthTokenResponse} accessData
     * */
    saveAccess(accessData: OauthTokenResponse): Promise<[void, void, void, void, void]>;
    /**Clear all access data from session*/
    clearAccess(): Promise<void>;
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
    authorizeAccess(params: {
        grant_type?: OauthGrantType;
        allowed_grant_types?: OauthGrantType[];
        redirect_uri?: string;
        user_id?: string;
        username?: string;
        password?: string;
        state?: string;
        scope?: string[];
        callback?: (token: string | boolean, msg?: string) => any;
    }): Promise<void>;
    /**
     * Check if authorization or token has expired
     * @param {String} token
     * @return {Promise<boolean>}
     * */
    hasExpired(token?: string): Promise<boolean>;
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {String} redirect_url
     * @param {String} user_id
     * @param {String} state
     * @param {(url: string)=>any} callback
     * */
    oauthAuthorize(scope: string[], redirect_url: string, user_id: string, state: string, callback?: (url: string) => any): void;
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {String} redirect_url
     * @param {String} email
     * @param {String} state
     * @param {(url: string)=>any} callback
     * */
    oauthAuthorizeWithEmail(scope: string[], redirect_url: string, email: string, state: string, callback?: (url: string) => any): void;
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {String} redirect_url
     * @param {String} user_id
     * @param {String} state
     * @param {(url: string)=>any} callback
     * */
    oauthAuthorizeImplicit(scope: string[], redirect_url: string, user_id: string, state: string, callback?: (url: string) => any): void;
    /**
     * Get oauth token with Client credentials
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse)=>any} callback
     * */
    oauthTokenWithClientCredentials(scope: string[], callback: (verify: OauthTokenResponse, msg?: string) => any): void;
    /**
     * Get oauth token with Client credentials
     * @param {String} username
     * @param {String} password
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse)=>any} callback
     * */
    oauthTokenWithUserCredentials(username: string, password: string, scope: string[], callback: (verify: OauthTokenResponse, msg?: string) => any): void;
    /**Get oauth token with Client credentials
     * @param {String} code
     * @param {String} redirect_uri
     * @param {(verify: OauthTokenResponse)=>any} callback
     * */
    oauthTokenWithAuthorizationCode(code: string, redirect_uri: string, callback: (verify: OauthTokenResponse, msg?: string) => any): void;
    /**Get oauth Refresh Token with
     * Client credentials
     * @param {String} refresh_token
     * @param {(verify: OauthTokenResponse)=>any} callback
     * */
    oauthRefreshToken(refresh_token: string, callback: (verify: OauthTokenResponse, msg?: string) => any): void;
    /**
     * Get oauth Refresh Token with
     * Client credentials
     * @param {String} access_token
     * @param {(verify: OauthVerificationResponse, msg?: string) => any} callback
     * */
    oauthVerifyToken(access_token: string, callback: (verify: OauthVerificationResponse, msg?: string) => any): void;
}
/**Grant Types
 * @enum
 */
declare enum OauthGrantType {
    /** @type {String} */
    Client_Credentials = "client_credentials",
    /** @type {String} */
    Authorization_Code = "authorization_code",
    /** @type {String} */
    User_Credentials = "password",
    /** @type {String} */
    Refresh_Token = "refresh_token",
    /** @type {String} */
    Auto = "auto"
}
/**Http Request Method
 * @enum
 */
declare enum OauthRequestMethod {
    /** @type {String} */
    GET = "get",
    /** @type {String} */
    POST = "post",
    /** @type {String} */
    PUT = "put",
    /** @type {String} */
    DELETE = "delete"
}
/**Http Request Params
 * @interface
 * */
interface OauthRequestParams<T> {
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
    success?: (result?: T) => any;
    fail?: (result?: T, reason?: string) => any;
}
/**Make Oauth Http requests
 * @class
 * */
declare class OauthRequest {
    private readonly axhttp;
    private method;
    /**Make GET Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static get<T>(data: OauthRequestParams<T>): Promise<T>;
    /**Make POST Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static post<T>(data: OauthRequestParams<T>): Promise<T>;
    /**Make PUT Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static put<T>(data: OauthRequestParams<T>): Promise<T>;
    /**Make DELETE Requests
     * @param {OauthRequestParams} data
     * @returns {Promise<T>}
     * */
    static delete<T>(data: OauthRequestParams<T>): Promise<T>;
    /**
     * @param {OauthRequestParams} data
     * @param {OauthRequestMethod} method
     * */
    constructor(method?: OauthRequestMethod);
    /**
     * Make Http requests
     * @param {OauthRequestParams<T>} data
     * @returns {Promise<T>}
     */
    request<T>(data: OauthRequestParams<T>): Promise<T>;
}
/**Oauth Response
 * @class
 * */
declare class OauthResponse {
    /**
     * @param {String} result json result
     * @returns {OauthVerificationResponse}
     * */
    static parseVerificationResponse(result: string): OauthVerificationResponse | null;
    /**
     * @param {String} result json result
     * @returns {OauthAuthorizationResponse}
     * */
    static parseAuthorizationResponse(result: string): OauthAuthorizationResponse;
    /**
     * @param {String} result json result
     * @returns {OauthTokenResponse}
     * */
    static parseTokenResponse(result: string): OauthTokenResponse;
}
/**Verification Response
 * @class
 * */
declare class OauthVerificationResponse {
    success: boolean;
    error: string;
    errorDescription: string;
    /**
     * @param {Object} data
     */
    constructor(data?: object);
}
/**Authorization Respons
 * @class
 * */
declare class OauthAuthorizationResponse {
    state: string;
    code: string;
    error: string;
    errorDescription: string;
    /**
     * @param {Object} data
     */
    constructor(data?: object);
}
/**Token Response
 * @class
 * */
declare class OauthTokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessScope: string;
    expiresIn: number;
    error: string;
    errorDescription: string;
    /**
     * @param {Object} data
     */
    constructor(data?: object);
}
export { OauthStorageInterface, OauthStorageKeys, OauthStorage, OauthUtils, Oauth, OauthGrantType, OauthRequestMethod, OauthRequestParams, OauthRequest, OauthResponse, OauthVerificationResponse, OauthAuthorizationResponse, OauthTokenResponse, };
