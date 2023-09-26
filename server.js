const DynamicImportsSw = {};

let sw = "";
DynamicImportsSw.configure = ({
  cacheKey = ""
}) => {
  sw = `
const CACHE = "mdisw-1.0.0"

String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener("fetch", async (event) => {
  if (event.request.method !== "POST") return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (!event.request.url.endsWith("/__meteor__/dynamic-import/fetch")) return;

  const clonedRequest = event.request.clone();

  return clonedRequest.json().then((json) => {
    return findMatchingCachedDynamicImports(json).then(({
      matched,
      response
    }) => {
      if (matched) {
        return response;
      }

      return fetch(event.request).then((response) => {
        response.json().then((json) => {
          iterateAndAddKeysToCache(json, "");
        })

        return response;
      })
    });
  });
});

const iterateAndAddKeysToCache = (json, parent = "") => {
  for (let key of Object.keys(json)) {
    if (typeof json[key] == "string") {
      const cacheKey = \`\${parent}\${key}\`;
      const hash = cacheKey.hashCode();

      caches.open(CACHE).then(cache => {
        cache.put(new Request(\`/__meteor__/dynamic-import/fetch?hash=\${hash}\`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Key": cacheKey
          }
        }), new Response(json[key], {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Key": cacheKey
          }
        }))
      });
    } else if (json[key]) {
      iterateAndAddKeysToCache(json[key], \`\${parent}\${key},\`)
    }
  }
}

const findMatchingCachedDynamicImports = (json) => {
  return new Promise((resolve) => {
    let matched = false;
    let response = null;

    const cacheKeys = gatherKeys(json);
    const keys = Object.keys(cacheKeys);

    caches.open(CACHE).then(cache => {
      cache.matchAll("/__meteor__/dynamic-import/fetch", { ignoreSearch: true }).then(async (responses) => {
        let matches = responses.filter((response) => keys.includes(response.headers.get("Cache-Key")));
        if (matches.length == keys.length) {
          let body = {};
          for (let response of responses) {
            body = await addKeysToBody(body, response);
          }

          response = new Response(JSON.stringify(body), {
            statusCode: 200,
            headers: {
              "Content-Type": "application.json"
            }
          });

          matched = true;
        }

        resolve({
          matched,
          response
        })
      });
    });
  });
}

const gatherKeys = (json, parent = "", results = {}) => {
  for (let key of Object.keys(json)) {
    if (typeof json[key] == "number") {
      const cacheKey = \`\${parent}\${key}\`;
      const hash = cacheKey.hashCode();
      results[cacheKey] = \`/__meteor__/dynamic-import/fetch?hash=\${hash}\`;
    } else if (json[key]) {
      results = gatherKeys(json[key], \`\${parent}\${key},\`, results);
    }
  }

  return results;
}

const addKeysToBody = async (body, response) => {
  const cacheKey = response.headers.get("Cache-Key");
  const split = cacheKey.split(",")
  const lastKey = split.pop();

  let child = body;

  for (const key of split) {
    if (!child[key]) {
      child[key] = {};
    }

    child = child[key];
  }

  child[lastKey] = await response.text();

  return body;
}`
}

WebApp.connectHandlers.use('/dynamic-imports-sw.js', (req, res, next) => {
  // add proper mime type
  res.setHeader("Content-Type", "text/javascript")
  res.writeHead(200);
  res.end(sw);
});

export default DynamicImportsSw;