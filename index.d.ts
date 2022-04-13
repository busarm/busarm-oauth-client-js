/**Store and Retrieve Oauth variables*/
export declare class OauthStorage {
    static get accessTokenKey(): string;
    static get refreshTokenKey(): string;
    static get accessScopeKey(): string;
    static get tokenTypeKey(): string;
    static get expiresInKey(): string;
    static get currentStateKey(): string;
    /**Save Access data to Local storage
     * @param accessData OauthTokenResponse */
    static saveAccess(accessData: OauthTokenResponse): void;
    /**Clear all access data from session*/
    static clearAccess(): void;
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
    /**@param data object
     * @param data.clientId - Your Application's Client ID
     * @param data.clientSecret - Your Application's Client Secret
     * @param data.authorizeUrl - Url to Authorize access (For authorization_code grant_type)
     * @param data.tokenUrl - Url to obtain token
     * @param data.verifyTokenUrl - Url to verify token
     * */
    constructor(data: {
        clientId?: string;
        clientSecret?: string;
        authorizeUrl?: string;
        tokenUrl?: string;
        verifyTokenUrl?: string;
    });
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
    /**Oauth Authorization
     * @param scope
     * @param redirect_url
     * @param user_id
     * @param state
     * */
    oauthAuthorize(scope: string[], redirect_url: string, user_id: string, state: string): void;
    /**Oauth Authorization
     * @param scope
     * @param redirect_url
     * @param email
     * @param state
     * */
    oauthAuthorizeWithEmail(scope: string[], redirect_url: string, email: string, state: string): void;
    /**Oauth Authorization
     * @param scope
     * @param redirect_url
     * @param user_id
     * @param state
     * */
    oauthAuthorizeImplicit(scope: string[], redirect_url: string, user_id: string, state: string): void;
    /**Get oauth token with Client credentials
     * @param scope
     * @param callback function
     * */
    oauthTokenWithClientCredentials(scope: string[], callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**Get oauth token with Client credentials
     * @param username
     * @param password
     * @param scope
     * @param callback function
     * */
    oauthTokenWithUserCredentials(username: string, password: string, scope: string[], callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**Get oauth token with Client credentials
     * @param code String
     * @param redirect_uri String
     * @param callback function
     * */
    oauthTokenWithAuthorizationCode(code: string, redirect_uri: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**Get oauth Refresh Token with
     * Client credentials
     * @param refreshToken string
     * @param callback function
     * */
    oauthRefreshToken(refreshToken: string, callback: (verify: OauthTokenResponse, xhr: XMLHttpRequest) => any): void;
    /**Get oauth Refresh Token with
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
    url?: string;
    headers?: {
        [header: string]: string | string[];
    };
    query?: {
        [query: string]: string | string[];
    };
    params?: {
        [param: string]: string | string[];
    };
    username?: string;
    password?: string;
    withCredentials?: boolean;
    withAccessToken?: boolean;
    success?: (xhr?: XMLHttpRequest, result?: string) => any;
    fail?: (xhr?: XMLHttpRequest) => any;
}
/**Make Oauth Http requests*/
export declare class OauthRequest {
    private readonly xhttp;
    private username;
    private password;
    private withCredentials;
    private withAccessToken;
    private method;
    private url;
    private headers;
    private query;
    private params;
    private success;
    private fail;
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
    static get(data: OauthRequestParams): void;
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
    static post(data: OauthRequestParams): void;
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
    static put(data: OauthRequestParams): void;
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
    static delete(data: OauthRequestParams): void;
    constructor();
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
