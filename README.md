# Cache API

API is deployed at [https://cactro-backend.onrender.com](https://cactro-backend.onrender.com)

## Endpoints

The following endpoints are available:

-   `POST /cache`: Insert a new cache item
-   `GET /cache/:key`: Get a cache item by key
-   `DELETE /cache/:key`: Delete a cache item by key

## Features

-   Cache key and value can be a number or a string. They are stored as strings in the database.
-   Cache size limit: The cache has a maximum size of 10 items. Any attempt to insert a new cache item when the cache is full will return a 400 status code.
-   Cache update: Updates are handled by the POST route. Any request with a key that already exists will update the corresponding cache item.

## Usage

### Insert a new cache item

```bash
curl -X POST \
  https://cactro-backend.onrender.com/cache \
  -H 'Content-Type: application/json' \
  -d '{
    "key": "my-key",
    "value": "my-value"
  }'
```

### Get a cache item by key

```bash
curl -X GET https://cactro-backend.onrender.com/cache/my-key
```

### Delete a cache item by key

```bash
curl -X DELETE https://cactro-backend.onrender.com/cache/my-key
```

## Updates since demo video

-   There was a bug in the POST route where the max size validation was in place even for update requests so existing cache items could not be updated when the cache was full. This has been fixed.
