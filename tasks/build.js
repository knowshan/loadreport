'use strict';

module.exports = function(grunt) {

  var fs = require("fs");

  var childProcess = require('child_process');
  var phantomjs = require('phantomjs');
  var loadreport = require('../lib/main.js');
  var ph_libutil = require("phantomizer-libutil");
  var url_parser = require('url');

  // loadreport runner
  // ------------
  // use it for any project
  grunt.registerMultiTask("loadreport",
    "Measure page loading times with loadreport", function () {

      var options = this.options({
        urls:[],

        // (performance|performancecache|filmstrip|speedreport)
        action:null,
        // only if action=(performance|performancecache) (csv|json|junit|xml)
        format:null,
        // file path to a config.json file
        config_file:null,
        // specify output path
        output:null,
        // produce human friendly output
        readable:false
      });

      var done = this.async();

      var urls = unique_urls(options.urls);
      grunt.log.ok("Running "+urls);

      var base_args = forge_loadreport_args(options);

      var run_url = function (){
        var url = urls.shift();
        var args = base_args.slice(0).unshift("--url="+url);
        var loadreport_process = run_phantomjs(args,function(stderr,stdout){
          if( urls.length == 0 ){
            done();
          }else{
            run_url();
          }
        });
        loadreport_process.stdout.on('data', function (data) {
          if(options.output=="-"){
            grunt.log.write(data.toString());
          }
        });
      };
      run_url();

    });

  // loadreport phantomizer
  // ------------
  // specific to phantomizer projects
  grunt.registerMultiTask("phantomizer-loadreport",
    "Measure page loading times with loadreport", function () {

      var options = this.options({
        web_server_paths:[],
        urls:[],
        host:'localhost',
        port:'',
        ssl_port:'',
        web_server_log:false,
        inject_assets:true,

        // specify output path
        output:null,
        // produce human friendly output
        readable:false,

        meta_dir:''
      });

      var web_server_paths = options.web_server_paths;
      var host = options.host;
      var port = options.port?options.port:"";
      var ssl_port = options.ssl_port?options.ssl_port:"";
      var web_server_log = options.web_server_log;
      var inject_assets = options.inject_assets;

      var meta_dir = options.meta_dir;


      var done = this.async();

      var webserver           = ph_libutil.webserver;
      var router_factory      = ph_libutil.router;
      var optimizer_factory   = ph_libutil.optimizer;
      var meta_factory        = ph_libutil.meta;

      var config = grunt.config.get();

      var meta_manager = new meta_factory(process.cwd(), meta_dir);
      var optimizer = new optimizer_factory(meta_manager, config, grunt);
      var router = new router_factory(config.routing);

      router.load(function(){

        if( host+port+ssl_port != '' ){
          webserver = new webserver(router,optimizer,meta_manager,grunt, web_server_paths);
          webserver.enable_dashboard(false);
          webserver.enable_build(false);
          webserver.enable_assets_inject(inject_assets);

          webserver.start(port, ssl_port, host);
        }

        var urls = unique_urls(options.urls);
        grunt.log.ok("Running "+urls);

        var base_args = forge_loadreport_args(options);

        var run_url = function (){
          var url = urls.shift();
          var args = base_args.slice(0).unshift("url="+url);
          var loadreport_process = run_phantomjs(args,function(stderr,stdout){
            if( urls.length == 0 ){
              done();
            }else{
              run_url();
            }
          });
          loadreport_process.stdout.on('data', function (data) {
            if(options.output=="-"){
              grunt.log.write(data.toString());
            }
          });
        };
        run_url();

      });

    });

  // helper functions
  // --------
  function unique_urls(urls){
    var retour = [];
    for( var n in urls ){
      if( urls[n] && retour.indexOf(urls[n]) == -1 ){
        retour.push(urls[n])
      }
    }
    return retour;
  }
  // tranforms options to --[switch] [value]
  // does not manage urls
  function forge_loadreport_args(options){
    var args = [];

    if( options.action.match(/(performance|performancecache|filmstrip|speedreport)/) ){
      args.push( "--task="+options.action )
    }else{
      grunt.fail.fatal("Unknown action "+options.action);
    }

    if( options.format ){
      if( options.action.match(/(performance|performancecache)/) ){
        if( options.format.match(/(csv|json|junit|xml)/) ){
          args.push( "--format="+options.format )
        }else{
          grunt.fail.fatal("Unknown action "+options.action);
        }
      }else{
        grunt.log.error("Cannot change format for action "+options.action);
      }
    }

    if( options.config_file ){
      if( grunt.file.exists(options.config_file) ){
        args.push( "--config="+options.config_file )
      }else{
        grunt.log.error("config.json file does not exsist "+options.config_file);
      }
    }

    if( options.output ){
      args.push( "--output="+options.output )
    }
    return args;
  }
  // runs phantomjs and pipes output to grunt
  function run_phantomjs(args,then){

    args.unshift(loadreport.path);

    var stdout = "";
    var stderr = "";

    grunt.log.write(phantomjs.path+" "+args.join(" "));
    var pantomjs_process = require('child_process').spawn(phantomjs.path, args);
    // with live output piping
    pantomjs_process.stdout.on('data', function (data) {
      stdout+=data.toString();
      grunt.verbose.write(data.toString());
    });
    pantomjs_process.stderr.on('data', function (data) {
      stderr+=data.toString();
      grunt.log.error(stderr);
    });
    // and callback on exit process
    pantomjs_process.on('exit', function (code) {
      if(then) then(stderr,stdout);
    });

    return pantomjs_process;
  }
};