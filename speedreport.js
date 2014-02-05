var fs = require('fs')
    , page = require('webpage').create()
    , t
    , address=''
    , requests={}
    , responses={}
    , pageInfo={url:address, assets:[]};


var process = {
  argv:require('system').args,
  argc:require('system').args.length,
  exit:function(){
    phantom.exit();
  }
}
var Getopt = require("./node_modules/node-getopt/lib/getopt.js");

var getopt = new Getopt([
  ['u' , 'url=ARG'  , 'the URL of the site to load test'],
  ['' , 'output[=CONFIG_FILE]'],
  ['' , 'format[=FILE_FORMAT]'],
  ['h' , 'help'],
  ['v' , 'verbose']
]).bindHelp();

var opt = getopt.parse(require('system').args);

if( !opt.options.url ){
  console.log('Usage: speedreport.js --url=[url]');
  phantom.exit();
}
if( !opt.options.format || !opt.options.format.match(/^(json|html)/) ){
  opt.options.format = 'html';
}
if( !opt.options.output ){
  opt.options.output = '';
}

address = opt.options.url;


page.onResourceRequested = function (r) {
    if(r)requests[r.id]=r;
};
page.onResourceReceived = function (r) {
    if(r && !(r.id in responses)){
        responses[r.id]=r;
    } else {
        for(var i in responses[r.id]){
            if(responses[r.id].hasOwnProperty(i) && !(i in r)){
                r[i]=responses[r.id][i];
            }
        }
        r.received=responses[r.id].time;
        pageInfo.assets.push({
            request:requests[r.id],
            response:r
        });
    }
};
page.onError=function(){
    console.error("error");
    console.dir(arguments);
}
t = Date.now();
page.open(address, function (status) {
    pageInfo.requestTime=t;
    pageInfo.responseTime=Date.now();
    if (status !== 'success') {
        console.error('/* FAIL to load the address */');
    } else {
        t = Date.now() - t;
        try {
            var data=JSON.stringify(pageInfo, undefined, 4)
            printToFile(data);
        }catch(e){
            console.error("error writing to file ",e);
        }
    }
    phantom.exit();
});

function printToFile(data) {
    var f
        , g
        , html
        , myfile
        , fileid
        , myjson
        , jspath
        , keys = []
        , values = []
        , extension = 'html';

  if( opt.options.format == 'html' ){
    fileid = opt.options.url.replace('http://','').replace('https://','').replace(/\//g,'');
    fileid = fileid.split('?')[0];
    myjson = opt.options.output+'speedreports/' + fileid + '.js';
    myfile = opt.options.output+'speedreports/' + fileid + '.' + extension;
  }else{
    fileid = opt.options.url.replace('http://','').replace('https://','').replace(/\//g,'');
    myjson = opt.options.output+''+fileid;
    myfile = null;
  }

  // Given localhost:8880/some
  // Transforms to localhost_8880/some
  myjson = myjson.replace(":","_");
  if( myfile ) myfile = myfile.replace(":","_");

    if(myfile!==null){
        try {
            data = "var reportdata = " + data + ";";
    		if(fs.exists(myfile)){
    		    fs.remove(myfile);
    		}
            if(!fs.exists('speedreport.html')){
                html = fs.read('loadreport/speedreport.html');
            }else{
                html = fs.read('speedreport.html');
            }
            if(opt.options.format != 'html'){
                html=html.replace('{{REPORT_DATA_URI}}', '\/rest\/performance\/js\?uuid\=' + myjson);
            }else{
                html=html.replace('{{REPORT_DATA_URI}}', fileid + '.js');
            }
            html=html.replace('{{url}}', opt.options.url);
            f = fs.open(myfile, "w");
            f.write(html);
            f.flush();
            f.close();
        } catch (e) {
            console.log("problem writing to file",e);
        }
    }

    try {
        g = fs.open(myjson, "w");
        g.write(data);
        g.flush();
        g.close();
    } catch (e) {
        console.error("problem writing to file",e);
    }
}

