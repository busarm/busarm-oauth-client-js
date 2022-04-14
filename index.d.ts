/**Store and Retrieve Oauth variables*/
export interface OauthStorageInterface<T> {
    get(key: string): Promise<T>;
    set(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    clearAll(): Promise<void>;
}
export declare enum OauthStorageKeys {
    AccessTokenKey = "access_token",
    RefreshTokenKey = "refresh_token",
    AccessScopeKey = "scope",
    TokenTypeKey = "token_type",
    ExpiresInKey = "expires_in",
    CurrentStateKey = "current_state"
}
export declare class OauthStorage implements OauthStorageInterface<string> {
    get(key: string): Promise<string>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<any>;
    clearAll(): Promise<any>;
    /** Set data - localstorage
     * @param name  name
     * @param value  value
     * */
    static set(name: string, value: any, temporary?: boolean): void;
    /** Set data - localStorage
     * @param name  name
     * */
    static get(name: string): string;
    /** Remove data - localStorage
     * @param name  string
     * */
    static remove(name: string): void;
    /**Clear all user data*/
    static clearAll(withTemp?: boolean): void;
    /**Set Access Token
     * @param accessToken String
     * */
    static set accessToken(accessToken: string);
    /**Get Access Token
     * @return String
     * */
    static get accessToken(): string;
    /**Get Refresh Token
     * @return String
     * */
    static get refreshToken(): string;
    /**Get Access Scope
     * @return String
     * */
    static get accessScope(): string;
    /**Get Expires In
     * @return string
     * */
    static get expiresIn(): string;
    /**Get Token Type
     * @return String
     * */
    static get tokenType(): string;
}
/**Common Functions*/
export declare class OauthUtils {
    /**Check if token is a JWT token and return claims if so
     *  @return string
     * */
    static parseJWT(token: string): string;
    /**Check if JWT Token has expired
     *  @return boolean
     * */
    static hasJWTExpired(token: string): boolean;
    /**Check if token has expired
     *  @return boolean
     * */
    static hasTokenExpired(token?: string): boolean;
    /**Get a safe form of string to store,
     * eliminating null and 'undefined'
     * @param item
     *  @return String*/
    static safeString(item: string): string;
    /**Get a safe form of stIntring to store,
     * eliminating null and 'undefined'
     * @param item
     *  @return int*/
    static safeInt(item: number): number;
    /**Check if item is nut null, undefined or empty
     * eliminating null and 'undefined'
     * @param item
     *  @return boolean*/
    static assertAvailable(item: any): boolean;
    /**Count Object array
     * @return int*/
    static count(obj: object): number;
    /**Merge Object with another*/
    static mergeObj(obj: object, src: object): object;
    /**Encode Object content to url string
     *  @param myData Object
     *  @return String
     * */
    static urlEncodeObject(myData: object): string;
    /** Parse Json string to object
     *  @param json string
     *  @return object
     *  */
    static parseJson(json: string): any;
    /**Get Url param
     * #source http://www.netlobo.com/url_query_string_javascript.html
     * */
    static getUrlParam(name: string, url?: string): string;
    /**Return url without it's url parameters
     * @param url Url to strip
     * @return string
     * */
    static stripUrlParams(url: string): string;
    /**Generate Random value*/
    static generateKey(length: number): string;
}
export declare class Oauth {
    private readonly clientId;
    private readonly clientSecret;
    private readonly authorizeUrl;
    private readonly tokenUrl;
    private readonly verifyTokenUrl;
    private storage;
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
        clientId?: string;
        clientSecret?: string;
        authorizeUrl?: string;
        tokenUrl?: string;
        verifyTokenUrl?: string;
        storage?: OauthStorageInterface<string>;
    });
    /**
     * Get Oauth Storage
     * @returns {OauthStorageInterface<string>}
     */
    getStorage(): OauthStorageInterface<string>;
    /**
     * Set Oauth Storage
     * @param {OauthStorageInterface<string>} storage
     */
    setStorage(storage: OauthStorageInterface<string>): void;
    /**
     * Save Access data to Local storage
     * @param {OauthTokenResponse} accessData
     * */
    saveAccess(accessData: OauthTokenResponse): void;
    /**Clear all access data from session*/
    clearAccess(): void;
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
    }): void;
    /**
     * Check if authorization has expired
     */
    hasExpired(): boolean;
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {string} redirect_url
     * @param {string} user_id
     * @param {string} state
     * */
    oauthAuthorize(scope: string[], redirect_url: string, user_id: string, state: string): void;
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {string} redirect_url
     * @param {string} email
     * @param {string} state
     * */
    oauthAuthorizeWithEmail(scope: string[], redirect_url: string, email: string, state: string): void;
    /**
     * Oauth Authorization
     * @param {string[]} scope
     * @param {string} redirect_url
     * @param {string} user_id
     * @param {string} state
     * */
    oauthAuthorizeImplicit(scope: string[], redirect_url: string, user_id: string, state: string): void;
    /**
     * Get oauth token with Client credentials
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthTokenWithClientCredentials(scope: string[], callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**
     * Get oauth token with Client credentials
     * @param {string} username
     * @param {string} password
     * @param {string[]} scope
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthTokenWithUserCredentials(username: string, password: string, scope: string[], callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**Get oauth token with Client credentials
     * @param {string} code
     * @param {string} redirect_uri
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthTokenWithAuthorizationCode(code: string, redirect_uri: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**Get oauth Refresh Token with
     * Client credentials
     * @param {string} refreshToken
     * @param {(verify: OauthTokenResponse, xhr: XMLHttpRequest)} callback
     * */
    oauthRefreshToken(refreshToken: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**
     * Get oauth Refresh Token with
     * Client credentials
     * @param accessToken string
     * @param callback function
     * */
    oauthVerifyToken(accessToken: string, callback: (verify: OauthVerificationResponse, xhr: XMLHttpRequest) => any): void;
}
/**Grant Types*/
export declare enum OauthGrantType {
    Client_Credentials = "client_credentials",
    Authorization_Code = "authorization_code",
    User_Credentials = "password",
    Refresh_Token = "refresh_token",
    Auto = "auto"
}
/**Http Request Method*/
export declare enum OauthRequestMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
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
export declare class OauthRequest {
    private readonly xhttp;
    private data;
    private method;
    /**Make GET Requests
     * @param {OauthRequestParams} data
     * */
    static get(data: OauthRequestParams): void;
    /**Make POST Requests
     * @param {OauthRequestParams} data
     * */
    static post(data: OauthRequestParams): void;
    /**Make PUT Requests
     * @param {OauthRequestParams} data
     * */
    static put(data: OauthRequestParams): void;
    /**Make DELETE Requests
     * @param {OauthRequestParams} data
     * */
    static delete(data: OauthRequestParams): void;
    /**
     * @param {OauthRequestParams} data
     * @param {OauthRequestMethod} method
     * */
    constructor(data: OauthRequestParams, method?: OauthRequestMethod);
    /**Make Http requests*/
    request(): void;
}
/**Oauth Response*/
export declare class OauthResponse {
    /**@return OauthVerificationResponse
     * @param result string json result
     * @throws errorDescription
     * */
    static parseVerificationResponse(result: string): OauthVerificationResponse | null;
    /**@return OauthAuthorizationResponse
     * @param result string json result
     * */
    static parseAuthorizationResponse(result: string): OauthAuthorizationResponse;
    /**@return OauthTokenResponse
     * @param result string json result
     * */
    static parseTokenResponse(result: string): OauthTokenResponse;
}
/**Authorization Response*/
export declare class OauthVerificationResponse {
    success: boolean;
    error: string;
    errorDescription: string;
    constructor(data: []);
}
/**Authorization Response*/
export declare class OauthAuthorizationResponse {
    state: string;
    code: string;
    error: string;
    errorDescription: string;
    constructor(data: []);
}
/**Authorization Response*/
export declare class OauthTokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessScope: string;
    expiresIn: number;
    error: string;
    errorDescription: string;
    constructor(data: []);
}
