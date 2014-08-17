#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var app = require('../')(argv['_'][0]);

app.listen(argv['port'] || 8080, function () {
  console.log('Server running on port', app.address().port);
});
