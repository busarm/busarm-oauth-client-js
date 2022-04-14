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
    })

    describe("Storage", () => {
        let storage = {
            store: {},
            get: (key)=> {
                return storage.store[key]
            },
            set: (key, value)=> {
                return storage.store[key] = value
            },
            remove: (key)=> {
                return delete storage.store[key]
            },
            clearAll: ()=> {
                return storage.store = {};
            },
        };

        it("Should not be empty", () => {
            oauth.setStorage(storage);
            notEqual(oauth.getStorage(), null);
        });
        it("Should match custom", () => {
            equal(oauth.getStorage(), storage);
        });

        it("Should set & get value from storage", () => {
            oauth.getStorage().set('test', 10)
            equal(oauth.getStorage().get('test'), 10);
        });
        it("Should remove from storage", () => {
            oauth.getStorage().remove('test')
            equal(oauth.getStorage().get('test'), null);
        });
        it("Should clear storage", () => {
            oauth.getStorage().set('test', 10)
            oauth.getStorage().set('test2', 11)
            oauth.getStorage().clearAll()
            equal(oauth.getStorage().get('test'), null);
            equal(oauth.getStorage().get('test2'), null);
        });
    });
});
