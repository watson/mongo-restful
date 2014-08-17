#!/usr/bin/env node
'use strict';

var util = require('util');
var JSONStream = require('JSONStream');
var pump = require('pump');
var db = require('mongojs')(process.env.MONGO_URI);
var app = require('root')();

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
  var query  = parseJSON(options.q),
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
  var cursor = getCursor(req.params.collection, req.query);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  pump(cursor, JSONStream.stringify(), res);
};

var get = function (req, res) {
  var id = db.ObjectId(req.params.id);
  db.collection(req.params.collection).findOne({ _id: id }, function (err, doc) {
    // TODO: Handle error
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(doc));
  });
};

app.get('/{collection}', query);
app.get('/{collection}/{id}', get);
app.listen(process.env.PORT || 8080, function () {
  console.log('Server running on port', app.address().port);
});
