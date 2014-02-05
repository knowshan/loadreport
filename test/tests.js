'use strict';

var should = require('should');
var grunt = require('grunt');
var http = require('http');
var express = require('express');
var log = require('npmlog');

var url_congestion = {
  '/index.js':[500,1000],
  '/data.js':[500,1000]
};

var www_dir = __dirname + '/www';
var app_server;

describe('loadreport tests', function () {

  this.timeout(15000);

  before(function(){

    log.level = "info";
    log.level = "log";
    log.level = "silent";

    // to really mute grunt
    grunt.log.muted = !false;

    var app = express();
    if( log.level == "info" ) app.use(express.logger());
    // catch the requests
    app.use(function(req,res,next){
      var f = www_dir+req.path;
      // if the file exists in www dir
      if( grunt.file.exists(f) ){
        var timeout = 1;
        // and is applying congestion
        if( url_congestion[req.path] ){
          // generate a timeout given the configuration
          timeout = random_num(url_congestion[req.path][0],url_congestion[req.path][1]);
        }
        // render the content, with delay or not
        setTimeout(function(){
          res.send(grunt.file.read(f))
        },timeout)
        // or pass to 404 handler
      }else{
        next();
      }
    });
    app_server = http.createServer(app).listen(8080);

    grunt.file.delete("output/");
  });

  after(function(done){
    app_server.close(done);
  });

  afterEach(function(){
    grunt.file.delete("output/");
  });


  var url = "http://localhost:8080/index.html";
  var properties = [
    'url',
    'domReadystateLoading',
    'domReadystateInteractive',
    'windowOnload',
    'elapsedLoadTime',
    'numberOfResources',
    'totalResourcesTime',
    'slowestResource',
    'largestResource',
    'totalResourcesSize',
    'nonReportingResources',
    'timeStamp',
    'date',
    'time',
    'errors'
  ];

  it('should expose the wrappers path correctly', function() {
    var loadreport = require("../lib/main.js");
    for( var n in loadreport ){
      grunt.file.exists(loadreport[n]).should.be.eql(true,n+' has wrong file path : '+loadreport[n]);
      grunt.file.read(loadreport[n]).length.should.be.greaterThan(0,n+' is an empty file : '+loadreport[n]);
    }
  });
  it('should display the output', function(done) {
    var loadreport = require("../lib/main.js");
    run_phantomjs([loadreport.load_reports, "--url="+url, "--task=performancecache", "--output=output/"],function(code,stdout,stderr){
      stdout.should.match(/(DOMContentLoaded)/);
      stdout.should.match(/(onload)/);
      stdout.should.match(/(Elapsed load time:\s+[0-9]+ms)/);
      done();
    });
  });

  it('should produce a json file, performance', function(done) {
    var loadreport = require("../lib/main.js");
    var outfile = "output/reports/loadreport.json";
    run_phantomjs([loadreport.load_reports, "--url="+url, "--task=performance", "--format=json", "--output=output/"],function(code,stdout,stderr){
      var c = grunt.file.read(outfile);
      var report = JSON.parse(c);
      c.length.should.be.greaterThan(0);
      report.should.not.be.null;
      if( report.length ){
        report.length.should.be.greaterThan(0);
        for( var p in properties ){
          report[0].should.have.properties( properties[p] );
        }
      }else{
        for( var p in properties ){
          report.should.have.properties( properties[p] );
        }
      }
      done();
    });
  });

  it('should produce a json file, performancecache', function(done) {
    var loadreport = require("../lib/main.js");
    var outfile = "output/reports/loadreport.json";
    run_phantomjs([loadreport.load_reports, "--url="+url, "--task=performancecache", "--format=json", "--output=output/"],function(code,stdout,stderr){
      var c = grunt.file.read(outfile);
      var report = JSON.parse(c);
      c.length.should.be.greaterThan(0);
      report.should.not.be.null;
      if( report.length ){
        report.length.should.be.greaterThan(0);
        for( var p in properties ){
          report[0].should.have.properties( properties[p] );
        }
      }else{
        for( var p in properties ){
          report.should.have.properties( properties[p] );
        }
      }
      done();
    });
  });

  it('should produce a csv file, performancecache', function(done) {
    var loadreport = require("../lib/main.js");
    var outfile = "output/reports/loadreport.csv";
    run_phantomjs([loadreport.load_reports, "--url="+url, "--task=performancecache", "--format=csv", "--output=output/"],function(code,stdout,stderr){
      var c = grunt.file.read(outfile);
      c.length.should.be.greaterThan(0);
      done();
    });
  });

  it('should produce a csv file, performance', function(done) {
    var loadreport = require("../lib/main.js");
    var outfile = "output/reports/loadreport.csv";
    run_phantomjs([loadreport.load_reports, "--url="+ url, "--task=performance", "--format=csv", "--output=output/"],function(code,stdout,stderr){
      var c = grunt.file.read(outfile);
      c.length.should.be.greaterThan(0);
      done();
    });
  });

  it('should produce a junit file, performancecache', function(done) {
    var loadreport = require("../lib/main.js");
    var outfile = "output/reports/loadreport.xml";
    run_phantomjs([loadreport.load_reports, "--url="+url, "--task=performancecache", "--format=junit", "--output=output/"],function(code,stdout,stderr){
      var c = grunt.file.read(outfile);
      c.length.should.be.greaterThan(0);
      done();
    });
  });

  it('should produce a junit file, performance', function(done) {
    var loadreport = require("../lib/main.js");
    var outfile = "output/reports/loadreport.xml";
    run_phantomjs([loadreport.load_reports, "--url="+url, "--task=performance", "--format=junit", "--output=output/"],function(code,stdout,stderr){
      var c = grunt.file.read(outfile);
      c.length.should.be.greaterThan(0);
      done();
    });
  });


  it('should produce a speed report test', function(done) {
    var loadreport = require("../lib/main.js");
    var outfile = "output/speedreports/localhost_8080index.html.html";
    run_phantomjs([loadreport.speedreports, "--url="+url, "--output=output/", "--template=template/speedreport.html"],function(code,stdout,stderr){
      var c = grunt.file.read(outfile);
      c.length.should.be.greaterThan(0);
      done();
    });
  });


  it('should produce a speed report test', function(done) {
    var outfile = "output/speedreports/localhost_8080index.html.html";

    var args = [__dirname+"/../lib/speedreport.js", "--url="+url, "--output=output/"];

    log.info('stdout', '', phantomjs.path+" "+args.join(" "));

    var node_process = require('child_process').spawn("node", args);
    node_process.stdout.on('data', function (data) {
      log.info('stdout', '', data.toString());
    });
    node_process.stderr.on('data', function (data) {
      log.info('stderr', '', data.toString());
    });
    node_process.on('exit', function (code) {
      var c = grunt.file.read(outfile);
      c.length.should.be.greaterThan(0);
      done();
    });
  });
  it('should display the output', function(done) {
    var args = [__dirname+"/../lib/loadreport.js", "--url="+url, "--output=output/"];

    log.info('stdout', '', phantomjs.path+" "+args.join(" "));

    var stdout = "";
    var stderr = "";

    var node_process = require('child_process').spawn("node", args);
    node_process.stdout.on('data', function (data) {
      log.info('stdout', '', data.toString());
      stdout += data.toString();
    });
    node_process.stderr.on('data', function (data) {
      log.info('stderr', '', data.toString());
      stderr += data.toString();
    });
    node_process.on('exit', function (code) {
      stdout.should.match(/(DOMContentLoaded)/);
      stdout.should.match(/(onload)/);
      stdout.should.match(/(Elapsed load time:\s+[0-9]+ms)/);
      done();
    });
  });


});

// helper functions
// ------------
function random_num(min,max){
  return ( min+Math.floor(Math.random() * (max-min)) );
}
var phantomjs = require('phantomjs');
function run_phantomjs(args,cb){
  var stdout = "";
  var stderr = "";

  log.info('stdout', '', phantomjs.path+" "+args.join(" "))

  var phantomjs_process = require('child_process').spawn(phantomjs.path, args);
  phantomjs_process.stdout.on('data', function (data) {
    log.info('stdout', '', data.toString());
    stdout+=data.toString();
  });
  phantomjs_process.stderr.on('data', function (data) {
    log.info('stderr', '', data.toString());
    stderr+=data.toString();
  });
  phantomjs_process.on('exit', function (code) {
    if(cb) cb(code,stdout,stderr);
  });
  return phantomjs_process;
}