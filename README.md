# fetch-api-progress

Upload and download progress for [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Getting started

### Upload progress
```typescript
import { trackRequestProgress } from 'fetch-api-progress';

const blob = new Blob([new Uint8Array(5 * 1024 * 1024)]);

const request = {
    headers: {
        'Content-Type': 'application/octet-stream'
    },
    method: 'PUT',
    body: blob
};

const trackedRequest = trackRequestProgress(
    request,
    (progress) => {
        console.log(`Uploaded ${progress.loaded} bytes out of ${progress.total ?? 'unknown'}`)
    }
);

const response = await fetch("https://httpbin.org/put", trackedRequest);
```

### Download progress
```typescript
import { trackResponseProgress } from 'fetch-api-progress';

const response = await fetch("https://httpbin.org/put", {
    headers: {
        'Content-Type': 'application/octet-stream'
    },
    method: 'PUT',
    body: blob
});

const trackedResponse = trackResponseProgress(
    response,
    (progress) => {
        console.log(`Downloaded ${progress.loaded} bytes out of ${progress.total ?? 'unknown'}`)
    }
);

// Read the response. E.G. with a function from https://github.com/teil-one/fetch-api-progress/blob/main/tests/node/response/tracked.test.mjs
await readResponse(trackedResponse);
```

## Supported platforms
| Tracking progress of | Chrome | Edge | Safari | Firefox | Node.js |
| -------------------- | ------ | ---- | ------ | ------- | ------- |
| Request              | ✅     | ✅  | ✅    | ❌     | ✅     |
| Response             | ✅     | ✅  | ✅    | ✅     | ✅     |

## Integrations
Can be used with [api-registry](https://www.npmjs.com/package/api-registry#track-progress) – an HTTP API client.

[GitHub](https://github.com/teil-one/fetch-api-progress) · [NPM package](https://www.npmjs.com/package/fetch-api-progress)
