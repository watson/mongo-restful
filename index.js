'use strict';

var util = require('util');
var JSONStream = require('JSONStream');
var corsify = require('corsify')({ "Access-Control-Allow-Methods": "GET" });
var pump = require('pump');
var json2mongo = require('json2mongo');
var mongojs = require('mongojs');
var app = require('root')();

var db;

var objectify = function (json) {
  if ('$oid' in json)
    return db.ObjectId(json['$oid']);
  Object.keys(json).forEach(function (key) {
    var value = json[key];
    if (typeof value === 'object')
      json[key] = objectify(value);
  });
  return json;
};

var parseJSON = function (json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
};

var getCursor = function (collection, options) {
  var query  = json2mongo(parseJSON(options.q)),
      filter = parseJSON(options.filter),
      sort   = parseJSON(options.sort),
      limit  = parseInt(options.limit || 0, 10),
      skip   = parseInt(options.skip  || 0, 10),
      collection = db.collection(collection),
      cursor;

  query = objectify(query);
  console.log('querying: ' + util.inspect(query, false, null));
  cursor = collection.find(query, filter).sort(sort).skip(skip);
  if (limit) cursor.limit(limit);
  return cursor;
};

var query = function (req, res) {
  console.log(req.method, req.url);
  var cursor = getCursor(req.params.collection, req.query);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  pump(cursor, JSONStream.stringify(), res);
};

var get = function (req, res) {
  console.log(req.method, req.url);
  var id = db.ObjectId(req.params.id);
  db.collection(req.params.collection).findOne({ _id: id }, function (err, doc) {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Error: ' + err.message);
      return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(doc));
  });
};

module.exports = function (mongoUri) {
  db = mongojs(mongoUri);

  app.get('/{collection}', corsify(query));
  app.get('/{collection}/{id}([a-fA-f0-9]{24})', corsify(get));

  return app;
};
