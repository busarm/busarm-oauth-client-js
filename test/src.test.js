// Requiring module
import { doesNotReject, equal, notEqual, ok } from "assert";
import { Oauth, OauthGrantType } from "../index.js";

// Initialize data
const initOauth = (storage = null) => {
    return new Oauth({
        clientId: "oauth_client_test_11226677",
        clientSecret: "sdfg89sdfgs6dfgiodjg45ggmlkm4lk5l45d4",
        authorizeUrl: "http://localhost:8000/authorize/request",
        tokenUrl: "http://localhost:8000/token/request",
        verifyTokenUrl: "http://localhost:8000/token/verify",
        storage,
    });
};
const username = 'sam2022@test.com';
const password = 'V8Af3VY4';

describe("Source - for server", () => {
    before(() => {
        console.log("Started");
    });

    after(() => {
        console.log("Completed");
    });

    describe("Initialization", () => {
        it("Should not fail", () => {
            ok(initOauth());
        });

        it("Should not be empty", () => {
            notEqual(initOauth(), null);
        });
    });

    describe("Default Storage", () => {
        it("Should not be empty", () => {
            notEqual(Oauth.storage, null);
        });
        it("Should not reject promise on get", async () => {
            return doesNotReject(Oauth.storage.get("test"));
        });
    });

    describe("Custom Storage", () => {
        let storage = {
            store: {},
            get: async (key) => {
                return storage.store[key];
            },
            set: async (key, value) => {
                return (storage.store[key] = value);
            },
            remove: async (key) => {
                return delete storage.store[key];
            },
            clearAll: async () => {
                return (storage.store = {});
            },
        };

        it("Should not be empty", () => {
            initOauth(storage);
            notEqual(Oauth.storage, null);
        });
        it("Should match custom", () => {
            equal(Oauth.storage, storage);
        });

        it("Should set & get value from storage", async () => {
            await Oauth.storage.set("test", 10);
            equal(await Oauth.storage.get("test"), 10);
        });
        it("Should remove from storage", async () => {
            await Oauth.storage.remove("test");
            equal(await Oauth.storage.get("test"), null);
        });
        it("Should clear storage", async () => {
            await Oauth.storage.set("test", 10);
            await Oauth.storage.set("test2", 11);
            await Oauth.storage.clearAll();
            equal(await Oauth.storage.get("test"), null);
            equal(await Oauth.storage.get("test2"), null);
        });
    });

    describe("Grant types", () => {
        describe("Client Credentials", () => {
            let oauth = initOauth();
            let accessToken = null;
            it("Should return a valid token", async () => {
                let token = await new Promise((resolve) => {
                    oauth.oauthTokenWithClientCredentials([], (token) => {
                        resolve(token);
                    });
                });
                notEqual(token, null);
                notEqual(token.accessToken, undefined, token.errorDescription);
                notEqual(token.accessToken, null, token.errorDescription);
                accessToken = token.accessToken;
            });

            it("Should verify token", async () => {
                let verify = await new Promise((resolve) => {
                    oauth.oauthVerifyToken(accessToken, (verify) => {
                        resolve(verify);
                    });
                });
                notEqual(verify, null);
                ok(verify.success, verify.errorDescription);
            });
        });

        describe("User Credentials", () => {
            let oauth = initOauth();
            let accessToken = null;
            let refreshToken = null;
            it("Should return a valid token", async () => {
                let token = await new Promise((resolve) => {
                    oauth.oauthTokenWithUserCredentials(username, password, [], (token) => {
                        resolve(token);
                    });
                });
                notEqual(token, null);
                notEqual(token.accessToken, undefined, token.errorDescription);
                notEqual(token.accessToken, null, token.errorDescription);
                accessToken = token.accessToken;
                refreshToken = token.refreshToken;
            });
            
            it("Should verify token", async () => {
                let verify = await new Promise((resolve) => {
                    oauth.oauthVerifyToken(accessToken, (verify) => {
                        resolve(verify);
                    });
                });
                notEqual(verify, null);
                ok(verify.success, verify.errorDescription);
            });
            
            it("Should refresh token", async () => {
                let token = await new Promise((resolve) => {
                    oauth.oauthRefreshToken(refreshToken, (token) => {
                        resolve(token);
                    });
                });
                notEqual(token, null);
                notEqual(token.accessToken, undefined, token.errorDescription);
                notEqual(token.accessToken, null, token.errorDescription);
            });
        });
    });

    describe("Grant types Authorization", () => {
        describe("Client Credentials", () => {
            let oauth = initOauth();
            it("Should return a valid token", async () => {
                let token = await new Promise((resolve, reject) => {
                    oauth
                        .authorizeAccess({
                            grant_type: OauthGrantType.Client_Credentials,
                            callback: (token) => {
                                resolve(token);
                            },
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
                notEqual(token, null);
                notEqual(token, false);
            });
        });

        describe("User Credentials", () => {
            let oauth = initOauth();
            it("Should return a valid token", async () => {
                let token = await new Promise((resolve, reject) => {
                    oauth
                        .authorizeAccess({
                            grant_type: OauthGrantType.User_Credentials,
                            username, 
                            password,
                            callback: (token) => {
                                resolve(token);
                            },
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
                notEqual(token, null);
                notEqual(token, false);
            });
        });
    });
});
