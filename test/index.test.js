// Requiring module
import { equal, notEqual, ok } from "assert";
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

    describe("Storage", () => {
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
            oauth.storage = storage;
            notEqual(oauth.storage, null);
        });
        it("Should match custom", () => {
            equal(oauth.storage, storage);
        });

        it("Should set & get value from storage", async () => {
            await oauth.storage.set("test", 10);
            equal(await oauth.storage.get("test"), 10);
        });
        it("Should remove from storage", async () => {
            await oauth.storage.remove("test");
            equal(await oauth.storage.get("test"), null);
        });
        it("Should clear storage", async () => {
            await oauth.storage.set("test", 10);
            await oauth.storage.set("test2", 11);
            await oauth.storage.clearAll();
            equal(await oauth.storage.get("test"), null);
            equal(await oauth.storage.get("test2"), null);
        });
    });
});
