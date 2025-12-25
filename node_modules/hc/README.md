HC
==

**Human-friendly configuration tools**

[![Build Status](https://travis-ci.org/RobinQu/hc.svg?branch=master)](https://travis-ci.org/RobinQu/hc)

Usage
-----

Loading conf from following possible paths:

* $CC_ROOT/config.json
* $CC_RROT/config/config.json
* $CC_ROOT/config/{env}.json

where `$CC_ROOT` is default to the directory containing current running file (aka `require.main.filename`), or specified by env varialbe.

    require("hc")(function(e, conf) {
      if(e) {
        console.log("failed to load conf");
        console.error(e);
        return;
      }
      console.log(conf);
    });


DataSources
-----------

### Local files and conventions

`local-fs` is the default source which loads config data from local filesystem. It attemps to load file at some conventinonal places:

* config.json
* ./config/config.json
* ./config/{test|development|production}.json

Configs for multiple environment can be supplied in a single JSON  file in the structure like this

	{
		"test": {"foo":"bar"},
		"development": {"foo":"bar"},
		"production": {"foo":"bar"}
	}

### CouchDB source
	
	var hc = require("hc");
	hc({
        source: new hc.sources.Couch({
          db:"http://127.0.0.1:5984/hc"
        })
      }, function(e, conf) {
	      //TODO
      });
    });

Options for CouchDB source

* **db**, db connection options, see options format in `nano`
* **id**, doc id for config data

### HTTP Source

Fetch remote json configs

    var source = new hc.sources.HTTP("http://config.example.com/app/config.json", function(e, conf) {
      //TODO
    });


    
TODO
----

* More configuration source support:

  * ~~CouchDB~~
  * ~~MongoDB~~
  * ~~HTTP Source~~

* Browser Support
  
  * LocalStorage
  * HTTP
    