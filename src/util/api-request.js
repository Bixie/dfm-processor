let apiRequest;

const HEADER_KEY_APITOKEN = 'x-dfm-apitoken';

/*
 * How long the WordPress site gets to answer. A PUT carries a whole archive —
 * 34 KB of DEFLATE for a normal calculation — so this is generous rather than
 * tight; the point is that it ends. Until task 23 there was no timeout on any
 * hop, and a site that accepted the connection and then stopped talking held
 * this process's promise open forever.
 */
const API_TIMEOUT_MS = 30000;

/**
 * Read the response body once, and only parse it as JSON if it looks like JSON.
 *
 * This is the bug that used to take the whole process down. The old putFile()
 * called JSON.parse(body) inside a `request` callback, so a 502 from
 * ddev-router or an nginx error page — HTML, or empty — threw a SyntaxError
 * *outside* the promise chain, where no .catch() could see it. One unlucky
 * response killed node and every other customer's calculation with it. The
 * `body.substr(0, 1) === '<'` guard ahead of it caught exactly the HTML case
 * and nothing else: an empty body threw on `.substr` of undefined.
 */
async function readBody(response) {
    const text = await response.text();
    const trimmed = text.trim();

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            return {data: JSON.parse(trimmed), text,};
        } catch (e) {
            return {data: null, text,};
        }
    }

    return {data: null, text,};
}

function describe(response, text) {
    const body = text.trim().substring(0, 500);
    return `Status ${response.status}${body === '' ? ' with an empty body' : `: ${body}`}`;
}

class ApiRequest {

    constructor(server_url, api_key) {
        this.server_url = server_url;
        this.api_key = api_key;
    }

    /**
     * GET, resolving in the response data object.
     */
    get(url, data, headers = {}) {
        return this.send('GET', url, data, headers);
    }

    /**
     * POST, resolving in the response data object.
     */
    post(url, data, headers = {}) {
        return this.send('POST', url, data, headers);
    }

    /**
     * PUT an archive as raw bytes, resolving in the response data object.
     *
     * The body is the engine's own zip, forwarded unopened — see PROTOCOL.md §5.
     */
    putFile(url, buffer, headers = {}) {
        return this.send('PUT', url, buffer, {
            ...headers,
            'Content-type': 'application/zip',
            'Content-length': buffer.length,
        });
    }

    async send(method, url, data, headers = {}) {
        const uri = `${this.server_url}/${url}`;
        const isBuffer = Buffer.isBuffer(data);
        const options = {
            method,
            headers: this.getHeaders(isBuffer ? headers : {'Content-type': 'application/json', ...headers,}),
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
        };

        if (data !== undefined && data !== null) {
            options.body = isBuffer ? data : JSON.stringify(data);
        }

        let response;

        try {
            response = await fetch(uri, options);
        } catch (err) {
            //A timeout arrives as an AbortError, which says nothing about what
            //was being waited for.
            const reason = err.name === 'TimeoutError' || err.name === 'AbortError'
                ? `no answer within ${API_TIMEOUT_MS / 1000}s`
                : err.message;
            throw new Error(`${method} ${uri} failed: ${reason}`);
        }

        const {data: body, text,} = await readBody(response);

        if (!response.ok) {
            throw new Error(`${method} ${uri}: ${describe(response, body?.error ? String(body.error) : text)}`);
        }

        if (body === null) {
            throw new Error(`${method} ${uri} answered ${response.status} with a non-JSON body: ${text.trim().substring(0, 500)}`);
        }

        return body;
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
    putToApi(url, buffer, headers = {}) {
        if (!apiRequest) {
            throw Error('ApiRequest has not been set up!');
        }
        return apiRequest.putFile(url, buffer, headers);
    },
};
