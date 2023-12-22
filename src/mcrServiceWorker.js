// JWT resource URL
let jwtResource = "/rsc/jwt/";

// Regular expression pattern for API URLs
let apiUrlPattern = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)\/api\/(.*)/;

// JWT authentication token
let jwtAuth;

// JWT token
let jwt;

// Flag to indicate if JWT is being fetched
let runningJwt = false;

// Fetch JWT token
let jwtResp = getJWT();

// Event listener for ServiceWorker installation
self.addEventListener('install', function () {
    self.skipWaiting();
});

// Event listener for ServiceWorker activation
self.addEventListener('activate', function () {

});

// Event listener for messages from the main thread
self.addEventListener("message", (event) => {
    // Update global variables based on the received message
    if (event.data.jwtResource) {
        jwtResource = event.data.jwtResource;
    }
    if (event.data.apiUrlPattern) {
        apiUrlPattern = event.data.apiUrlPattern;
    }
    if (event.data.jwtAuth) {
        jwtAuth = event.data.jwtAuth;
    }
});

// Event listener for the 'fetch' event. This event is fired for every request made by the page.
self.addEventListener('fetch', async function (event) {
    // If the request URL matches the API URL pattern, add the JWT token to the request
    if (apiUrlPattern.test(event.request.url)) {
        // If there's no JWT token and JWT is not currently being fetched
        if (!jwt && !runningJwt) {
            // Fetch the API request without JWT
            event.respondWith(fetchAPIRequestWithoutJWT(event.request));
        }
        else {
            // If JWT is currently being fetched, wait for it to finish
            if (runningJwt) {
                await jwtResp;
            }
            // Fetch the API request with JWT
            event.respondWith(fetchAPIRequestWithJWT(event.request));
        }
    }
});

// Function to fetch API request with JWT
async function fetchAPIRequestWithJWT(apiRequest) {
    // Fetch the API request with JWT added to the request
    let apiResponse = await fetch(addJwtToRequest(apiRequest, jwt));
    // If the response status is 401 (Unauthorized) or 403 (Forbidden)
    if (apiResponse.status === 401 || apiResponse.status === 403) {
        // If the 'www-authenticate' header in the response indicates an invalid token
        let authHeader = apiResponse.headers.get("www-authenticate");
        if (authHeader && authHeader.includes("invalid_token")) {
            // If JWT is not currently being fetched, reset JWT
            if (!runningJwt){
                await resetJWT();
            }
            // Wait for JWT to finish fetching
            await jwtResp;
            // Fetch the API request with JWT again
            return fetchAPIRequestWithJWT(apiRequest);
        }
    }
    return apiResponse;
}

// Function to fetch API request without JWT
async function fetchAPIRequestWithoutJWT(apiRequest){
    // Fetch the API request without JWT
    let apiResponse = await fetch(apiRequest);
    // If the response status is 401 (Unauthorized) or 0 (Network Error)
    if (apiResponse.status === 401 || apiResponse.status === 0) {
        // If JWT is not currently being fetched, reset JWT
        if (!runningJwt) {
            await resetJWT();
        }
        // Wait for JWT to finish fetching
        await jwtResp;
        // Fetch the API request with JWT again
        return fetchAPIRequestWithJWT(apiRequest);
    }
    return apiResponse;
}

// Function to add JWT to the request
function addJwtToRequest(request, token) {
    // Add JWT to the 'Authorization' header of the request
    let header = Array.from(request.headers.entries());
    header.push(["Authorization", token.token_type + " " + token.access_token]);
    header.push(["X-Requested-With", 'ServiceWorker']);
    // Return a new request with the modified headers
    return new Request(request, {
        headers: new Headers(header),
        mode: "cors"
    });
}

// Function to fetch JWT
async function getJWT() {
    runningJwt = true;
    let jwtResp = undefined;
    try {
        let headers = {}
        if (jwtAuth) {
            headers["Authorization"] = jwtAuth;
        }
        // Fetch JWT from the JWT resource
        let resp = await fetch(jwtResource, {
            method: "GET",
            headers: headers
        });
        // If the response is OK, parse the response as JSON
        if (resp.ok){
            jwtResp = await resp.json();
        }
        if (resp.status === 404) {
            console.log("Cannot find JWT resource: ", jwtResource);
        }
    }
    catch (error) {
        console.error("JWT ERROR: ", error);
        runningJwt = false;
    }
    runningJwt = false;
    // If the JWT response indicates a successful login, update the JWT token
    if (jwtResp && jwtResp.login_success) {
        jwt = jwtResp;
        return jwtResp;
    }
    return undefined;
}

// Function to reset JWT
async function resetJWT() {
    // If JWT is not currently being fetched, reset JWT token and fetch JWT
    if (!runningJwt) {
        jwt = undefined;
        jwtResp = getJWT();
    }
}
