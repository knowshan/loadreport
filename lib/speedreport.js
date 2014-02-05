'use strict';

var phantomjs = require('phantomjs');
var loadreport = require('./main.js');

(function(exports) {

  var args = process.argv;
  args.unshift(loadreport.speedreports);
  if( ! args.join("").match("template"))
    args.push("--template="+loadreport.speedreports_template);
  var child = require('child_process');
  var ps = child.spawn(phantomjs.path, args);
  ps.stdout.pipe(process.stdout);
  ps.stdin.pipe(process.stdin);

  return ps;

}(typeof exports === 'object' && exports || this));