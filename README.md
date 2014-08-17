# mongo-restful

A very simple RESTful MongoDB proxy.

Allows you to query a MongoDB database over HTTP:

```
MongoDB <--- HTTP --> Browser
```

[![Build Status](https://travis-ci.org/watson/mongo-restful.png)](https://travis-ci.org/watson/mongo-restful)

## Limitations

Currencyly the API is read-only. Feel free to do a pull request :)

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
GET /my-collection?q=...
```

Use query parameters to filter your query. All query parameters are
optional, but if none are given the entire collection is retuned!

Query parameters:

- **q**: The MongoDB query. Use [MongoDB Extended JSON](docs.mongodb.org/manual/reference/mongodb-extended-json/) syntax, e.g. `{"createdAt":{"$date":"2014-01-01T00:00:00Z"}}`
- **filter**: Optional projection, e.g. `{"foo":1}`
- **sort**: Optional sorting object, e.g. `{"bar":-1}`
- **limit**: Return only _n_ results
- **skip**: Skip _n_ results

Request a specific document:

```
GET /my-collection/id
```

**Note:** It's expected that `id` is a MongoDB ObjectId.

## License

MIT
