import { Oauth, OauthGrantType } from "../index.js";

// Init
let oauth = new Oauth({
    clientId: "oauth_client_test_11226677",
    clientSecret: "sdfg89sdfgs6dfgiodjg45ggmlkm4lk5l45d4",
    authorizeUrl: "http://localhost:8000/authorize/request",
    tokenUrl: "http://localhost:8000/token/request"
});

// Get token
oauth
    .authorizeAccess({
        grant_type: OauthGrantType.Client_Credentials,
        callback: (token) => {
            console.log(token);
        },
    })
    .catch((error) => {
        console.log(error);
    });
