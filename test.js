'use strict';

process.argv = process.argv.concat('--port 8081 localhost/mongo-restful-test'.split(' '))
var argv = require('minimist')(process.argv.slice(2));

// start the server
require('./');

var http = require('http');
var querystring = require('querystring');
var test = require('tape');
var db = require('mongojs')(argv['_'][0], ['test']);

var data = [
  { _id: 1, foo: 1 },
  { _id: 2, foo: 2 },
  { _id: 3, foo: 2 },
  { _id: 4, foo: new Date() },
  { _id: 5, foo: 'text' },
  { bar: 1 }
];

var bootstrap = function (callback) {
  db.test.remove({}, function (err) {
    if (err) throw err;
    db.test.insert(data, function (err, res) {
      if (err) throw err;
      callback();
    });
  });
};

var find = function (collection, options, expected, t) {
  if (expected instanceof test.Test) return find(collection, null, options, expected);
  if (options) {
    if (options.q)      options.q      = JSON.stringify(options.q);
    if (options.filter) options.filter = JSON.stringify(options.filter);
    if (options.sort)   options.sort   = JSON.stringify(options.sort);
  }
  var url = 'http://localhost:' + argv['port'] + '/' + collection +
            (options ? '?' + querystring.stringify(options) : '');
  http.get(url, function (res) {
    var buffers = [];
    res.on('data', buffers.push.bind(buffers));
    res.on('end', function () {
      var result = JSON.parse(Buffer.concat(buffers));
      t.deepEqual(result, expected);
      t.end();
    });
  });
};

var getDoc = function (collection, id, expected, t) {
  var url = 'http://localhost:' + argv['port'] + '/' + collection + '/' + id;
  http.get(url, function (res) {
    var buffers = [];
    res.on('data', buffers.push.bind(buffers));
    res.on('end', function () {
      var result = JSON.parse(Buffer.concat(buffers));
      t.deepEqual(result, expected);
      t.end();
    });
  });
};

bootstrap(function () {
  var date = data[3].foo = data[3].foo.toISOString();
  var oid = data[data.length-1]._id = data[data.length-1]._id.toString();

  test('should return everything if no query are given', function (t) {
    find('test', data, t);
  });

  test('should return an empty array if the collection does not exist', function (t) {
    find('nowhere', [], t);
  });

  test('should query', function (t) {
    find('test', { q: { foo: 2 } }, [{ _id: 2, foo: 2 }, { _id: 3, foo: 2 }], t);
  });

  test('should limit', function (t) {
    find('test', { q: { foo: 2 }, limit: 1 }, [{ _id: 2, foo: 2 }], t);
  });

  test('should skip', function (t) {
    find('test', { q: { foo: 2 }, limit: 1, skip: 1 }, [{ _id: 3, foo: 2 }], t);
  });

  test('should sort', function (t) {
    find('test', { q: { foo: 2 }, sort: { _id: -1 } }, [{ _id: 3, foo: 2 }, { _id: 2, foo: 2 }], t);
  });

  test('should filter', function (t) {
    find('test', { q: { foo: 2 }, filter: { _id: 1 } }, [{ _id: 2 }, { _id: 3 }], t);
  });

  test('should allow querying for an ObjectId', function (t) {
    find('test', { q: { $oid: oid } }, [{ _id: oid, bar: 1 }], t);
  });

  test('should allow querying for a date', function (t) {
    find('test', { q: { foo: { $date: date } } }, [{ _id: 4, foo: date }], t);
  });

  test('should allow querying with a regular expression', function (t) {
    find('test', { q: { foo: { $regex: 'XT$', $options: 'i' } } }, [{ _id: 5, foo: 'text' }], t);
  });

  test('should respond to GET /collection/id', function (t) {
    getDoc('test', oid, { _id: oid, bar: 1 }, t);
  });

  test('end', function (t) {
    t.end();
    process.exit();
  });
});
