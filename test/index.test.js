// Requiring module
import { doesNotReject, doesNotThrow, equal, notEqual, ok, rejects } from "assert";
import { Oauth } from "../index.js";

describe("Test Features", () => {
    /**
     * @var {Oauth}
     */
    let oauth = null;

    before(() => {
        console.log("Started");
    });

    after(() => {
        console.log("Completed");
    });

    describe("Initialization", () => {
        it("Should not fail", () => {
            oauth = new Oauth({
                clientId: "123xxxxx",
                clientSecret: "xxxxxxabcd",
                authorizeUrl: "http://localhost/authorize",
                tokenUrl: "http://localhost/token",
                verifyTokenUrl: "http://localhost/verify",
            });
            ok(oauth);
        });

        it("Should not be empty", () => {
            notEqual(oauth, null);
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
            Oauth.storage = storage;
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
});
