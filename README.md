# MCR Server Worker JWT

A simple Service Worker to communicate with the MyCoRe REST-API. The Service Worker appends a JWT to every request to
the MyCoRe REST-API and renews it if necessary.
## Usage

### registerMCRServiceWorker

**Code:**
``` javascript
import {registerMCRServiceWorker} from "registerMCRServiceWorker.js";

registerMCRServiceWorker({
    jwtResource: webApplicationBaseURL + "rsc/jwt/",
    webApplicationBaseURL: webApplicationBaseURL,
});

```

## Optional Custom Parameters



| Parameter | Format                                        | Description                                                                                                                              | Default Value                                  |
| --------- |-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|
| `jwtResource` | String | URL of the JWT Resource                                                                                                                  | `/rsc/jwt/`|
| `webApplicationBaseURL` | String | Base URL of the Application                                                                                                              | `document.location.origin`|
| `apiUrlPattern` | RegEx | RegEx Pattern of the REST-API, the Service Worker will only intercept requests that match                                                | `/(http[s]?:\/\/)?([^\/\s]+\/)(.*)\/api\/(.*)/`|
| `jwtAuth` | String | Basic Authentification, to recive the JWT. Leave empty if Service Worker runs inside of MyCoRe. <br/>`Basic {base64(username:password)}` | none |
