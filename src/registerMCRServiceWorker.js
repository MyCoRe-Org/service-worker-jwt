// This function is used to register the MCR Service Worker
export const registerMCRServiceWorker = async (options) => {
    // Check if the browser supports service workers
    if ("serviceWorker" in navigator) {
        // Define the base URL as the current origin
        let baseURL = document.location.origin + "/";
        // If options are provided and a webApplicationBaseURL is specified, use it as the base URL
        if (options && options.webApplicationBaseURL){
            baseURL = options.webApplicationBaseURL
        }
        try {
            // Register the service worker
            const registration = await navigator.serviceWorker.register(baseURL + "mcrServiceWorker.js",
                {type: "module"});
            // If the service worker is installed reload the page
            if (registration.installing) {
                console.log("MCR Serviceworker installed");
                location.reload();
            } else if (registration.waiting) {
                console.log("MCR Serviceworker installing");
            } else if (registration.active) {
                console.log("MCR Serviceworker active");
                // If options are provided, send them as messages to the service worker
                if (options){
                    if (options.apiUrlPattern) {
                        registration.active.postMessage({"apiUrlPattern": options.apiUrlPattern});
                    }
                    if (options.jwtResource) {
                        registration.active.postMessage({"jwtResource": options.jwtResource});
                    }
                    if (options.jwtAuth) {
                        registration.active.postMessage({"jwtAuth": options.jwtAuth});
                    }
                }
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};
