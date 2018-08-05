const rp = require('request-promise');
const fs = require('fs');
const tough = require('tough-cookie');
const request = require('request');
const Promise = require('bluebird');

let apiRequest;

const HEADER_KEY_APITOKEN = 'x-dfm-apitoken';

class ApiRequest {

    constructor(server_url, api_key) {
        this.server_url = server_url;
        this.api_key = api_key;
        this.cookiejar = rp.jar();
        if (process.env.NODE_ENV === 'development') {
            let cookie = new tough.Cookie({
                key: 'XDEBUG_SESSION',
                value: 'PHPSTORM',
                domain: server_url.replace(/(https?:\/\/)/, '.').replace(/\/index.php/, ''),
                httpOnly: true,
                maxAge: 31536000,
            });
            // Put cookie in a jar which can be used across multiple requests
            this.cookiejar.setCookie(cookie.toString(), server_url);
        }
    }

    /**
     * Get message to server. Returns Promise that resolves in the results data Object
     * @param url
     * @param data
     * @param headers
     * @returns {Promise}
     */
    get(url, data, headers = {}) {
        const options = {
            method: 'GET',
            uri: `${this.server_url}/${url}`,
            jar: this.cookiejar,
            body: data,
            json: true,
            headers: this.getHeaders(headers),
        };
        return rp(options);
    }

    /**
     * Post message to server. Returns Promise that resolves in the results data Object
     * @param url
     * @param data
     * @param headers
     * @returns {Promise}
     */
    post(url, data, headers = {}) {
        const options = {
            method: 'POST',
            uri: `${this.server_url}/${url}`,
            jar: this.cookiejar,
            body: data,
            json: true,
            headers: this.getHeaders(headers),
        };
        return rp(options);
    }

    /**
     * Post message to server. Returns Promise that resolves in the results data Object
     * @param url
     * @param filepath
     * @param headers
     */
    putFile(url, filepath, headers = {}) {
        url = `${this.server_url}/${url}`;
        if (process.env.NODE_ENV === 'development') {
            const cookie_domain = this.server_url.replace(/(https?:\/\/)/, '.').replace(/\/index.php/, '');
            headers.Cookie = `XDEBUG_SESSION=XDEBUG_ECLIPSE; path=/; domain=${cookie_domain};`;
        }
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }
                headers['Content-type'] = 'application/zip';
                headers['Content-length'] = buffer.length;
                headers = this.getHeaders(headers);
                request.put({url, headers, body: buffer,}, (err, {statusCode, body,}) => {
                    if (err) {
                        reject(err);
                    } else {
                        const data = JSON.parse(body);
                        if (statusCode === 200) {
                            resolve(data);
                        } else {
                            reject(`Status ${statusCode}: ${data.error || body}`);
                        }
                    }
                });
            });
        });
    }

    /**
     * Compute headers for request
     * @param headers
     * @returns {{}}
     */
    getHeaders(headers = {}) {
        return {
            [HEADER_KEY_APITOKEN]: this.api_key,
            ...headers,
        };
    }
}

module.exports = {
    setup(server_url, api_key) {
        apiRequest = new ApiRequest(server_url, api_key);
    },
    getFromApi(url, data) {
        if (!apiRequest) {
            throw Error('ApiRequest has not been set up!');
        }
        return apiRequest.get(url, data);
    },
    postToApi(url, data) {
        if (!apiRequest) {
            throw Error('ApiRequest has not been set up!');
        }
        return apiRequest.post(url, data);
    },
    putToApi(url, filepath, headers = {}) {
        if (!apiRequest) {
            throw Error('ApiRequest has not been set up!');
        }
        return apiRequest.putFile(url, filepath, headers);
    },
};

