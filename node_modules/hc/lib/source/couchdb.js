/*global __dirname */

(function() {
  
  var nano = require("nano"),
      async = require("async");
  
  var CouchDBSource = module.exports = function(options) {
    options = options || {};
    this.db = nano(options.db);
    if(options.id) {
      this.ids = options.id.push ? options.id : [options.id];
    }
    
  };
  
  CouchDBSource.prototype.load = function (env, fn) {
    var conf, ids, parseConf, that;
    
    that = this;
    ids = that.ids || ["config", "config_"+env];
    
    parseConf = function(obj) {
      return obj[env] || obj;
    };
    
    async.until(function() {
      return !ids.length || conf;
    }, function(next) {
      that.db.get(ids.pop(), {
        include_docs: true
      }, function(e, obj) {
        if(e && e.status_code !== 404) {
          return next(e);
        }
        if(obj) {
          conf = parseConf(obj);
        }
        next(null);
      });
    }, function(e) {
      if(e) {
        return fn(e);
      }
      if(!conf) {
        return fn(new Error("cannot find config in couch"));
      }
      fn(null, conf);
    });
    
  };
  
}());