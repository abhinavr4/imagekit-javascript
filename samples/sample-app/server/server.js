const express = require('express');
const router = express.Router();
const cors = require('cors');
const ImageKit = require('imagekit');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const pugTemplatePath = path.join(__dirname, "../views/index.pug");

const app = express();
app.use(cors());
app.use(express.json());
app.set('view engine', 'pug');

const startServer = (port = 3000, PUBLIC_KEY, PRIVATE_KEY, URL_ENDPOINT) => {
    return new Promise((resolve, reject) => {
        try {
            const imagekit = new ImageKit({
                publicKey: PUBLIC_KEY,
                privateKey: PRIVATE_KEY,
                urlEndpoint: URL_ENDPOINT
            });

    
            router.get("/auth", (req, res) => {
                try {
                    const token = req.query.token || uuid.v4();
                    const expiration = req.query.expire || parseInt(Date.now()/1000)+ (60 * 10); // Default expiration in 10 mins
    
                    const signatureObj = imagekit.getAuthenticationParameters(token, expiration);
    
                    res.status(200).send(signatureObj);
    
                } catch (err) {
                    console.error("Error while responding to auth request:", JSON.stringify(err, undefined, 2));
                    res.status(500).send("Internal Server Error");
                }
            });

            router.post("/auth-v2", (req, res) => {
                try {
                    const payload = req.body;
                    const token = jwt.sign(payload.uploadPayload, PRIVATE_KEY, {
                        expiresIn: payload.expire,
                        header: {
                          alg: "HS256",
                          typ: "JWT",
                          kid: payload.publicKey,
                        },
                      });
    
                    res.status(200).send({ token });
                } catch (err) {
                    console.error("Error while responding to auth-v2 request:", JSON.stringify(err, undefined, 2));
                    res.status(500).send("Internal Server Error");
                }
            });

            router.get("/", (req, res) => {
                try {
                    res.render(pugTemplatePath, {
                        publicKey: PUBLIC_KEY,
                        urlEndpoint: URL_ENDPOINT,
                        authenticationEndpoint: `http://localhost:3000/auth`,
                        authenticationEndpointV2: "http://localhost:3000/auth-v2",
                    });
                } catch (err) {
                    console.error("Error while responding to static page request:", JSON.stringify(err, undefined, 2));
                    res.status(500).send("Internal Server Error");
                }
            });

            app.use("/",router);
    
            app.listen(port, () => {
                console.info(`Auth server running on port ${port}.`);
                resolve();
            });
        } catch (err) {
            console.error(JSON.stringify(err, undefined, 2));
            reject("Error starting auth server.")
        }
        
    });
}

module.exports = {
    startServer
}