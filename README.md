# loadreport
Builds a report of DOM and resource load times using phantomjs

## install
* ``` npm install maboitespam/loadreport -g --production ```

## usage
* ``` loadreport --url=http://cnn.com ```
* ``` speedreport --url=http://cnn.com ```
* ``` webserver ```



# loadreport.js
[PhantomJS](http://www.phantomjs.org/) 1.9+ is required to run loadreport.js or speedreport.js.

You can take it for a spin in [this live demo](http://loadreport.wesleyhales.com/report.html).

## loadreport Examples
### loadreport will write, to csv, json or junit format xml (filmstrip writes to png):

```
Usage:  phantomjs loadreport.js --help

  -u, --url=ARG                    the URL of the site to load test
  -t, --task=ARG                   the task to perform
      --config[=CONFIG_FILE]
      --format[=OUTPUT_FORMAT]
      --output[=CONFIG_FILE]
      --wait[=WAIT]
      --cachewait[=CACHE_WAIT]
      --user_agent[=USER_AGENT]
      --file_suffix[=FILE_SUFFIX]
  -w, --wipe
  -h, --help
  -v, --verbose
```


* ``` loadreport --url=http://cnn.com performance csv ```

![loadreport](https://raw.github.com/wesleyhales/loadreport/master/doc/readme/cnn-loadreport.png)
    
* ``` loadreport --url=http://cnn.com --task=performancecache --format=json ```
    
* ``` loadreport --url=http://cnn.com --task=filmstrip ```

![loadreport filmstrip](https://raw.github.com/wesleyhales/loadreport/master/doc/readme/cnn-filmstrip.png)

## speedreport Examples
### speedreport produces a json and html file which will display detailed resource charting

```
Usage:  phantomjs speedreport.js --help

  -u, --url=ARG               the URL of the site to load test
      --output[=CONFIG_FILE]
      --format[=FILE_FORMAT]
  -h, --help
  -v, --verbose
```

* ``` speedreport --url=http://www.cnn.com```

![speedreport](https://raw.github.com/wesleyhales/loadreport/master/doc/readme/speedreport.png)

* ``` speedreport --url=http://www.cnn.com --output=output/```

* ``` speedreport --url=http://www.cnn.com --format=json```

## Embedded web server
### Quickly display speedreport HTML files

Generate a report

* ``` speedreport --url=http://www.cnn.com```

Run the webserver

* ``` webserver [www_dir]```

Run your favorite browser to **http://localhost:8080/**.


## Documentation index

http://wesleyhales.github.io/loadreport/documentation/schedule-loadreport.html

http://wesleyhales.github.io/loadreport/documentation/speedreport.html

http://wesleyhales.github.io/loadreport/documentation/loadreport.html

http://wesleyhales.github.io/loadreport/documentation/build.html

http://wesleyhales.github.io/loadreport/documentation/tests.html

http://wesleyhales.github.io/loadreport/documentation/main.html

http://wesleyhales.github.io/loadreport/documentation/webserver.html

## Development support
### Setup

Install npm packages

* ``` npm install grunt-cli -g```
* ``` npm install mocha -g```
* ``` npm install```

### Test

See mocha

* ``` npm test```

### Document

See grunt-gh-pages, docco

* ``` grunt```

### Release, Bump version

See grunt-release

* ``` grunt release:patch```

