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
mongo-restful [options] [arguments]
```

Specify the MongoDB URI as the first argument to the mongo-restful
command.

Options:

- `--port` - specify which port the HTTP server should run on (defaults to 8080)

Example:

```
mongo-restful --port 3000 localhost/my-database
```

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
