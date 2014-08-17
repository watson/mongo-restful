# mongo-restful

A very simple MongoDB RESTful proxy

This is work in progress!

[![Build Status](https://travis-ci.org/watson/mongo-restful.png)](https://travis-ci.org/watson/mongo-restful)

## Installation

```
npm install -g watson/mongo-restful
```

## Usage

Just run the following command:

```
MONGO_URI=... mongo-restful
```

Default port is 8080 (override with `PORT` environment variable)

## API

Query a collection:

```
GET /{collection}?q={query}&filter={filter}&sort={sort}&limit={limit}&skip={skip}
```

Request a specific document:

```
GET /{collection}/{_id}
```

## License

MIT
