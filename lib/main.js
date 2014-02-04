'use strict';

var path = require('path');

// loadreport Node module
// ----------
// to get phantomjs reporters path use
// require("loadreport").load_reports;
// require("loadreport").speedreports;
(function(exports) {

  exports.load_reports = path.resolve(__dirname+"/../")+"/loadreport.js";
  exports.speedreports = path.resolve(__dirname+"/../")+"/speedreport.js";

}(typeof exports === 'object' && exports || this));