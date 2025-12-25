module.exports = (function() {
  
  var LocalSource = require("./source/local");
  
  var ConfLoader = function(options) {
    options = options || {};
    this.source = options.source || new LocalSource(options);
    this.env = options.env || process.env.NODE_ENV || "development";
    this.cache = {};
  };
  
  ConfLoader.prototype.load = function (env, fn) {
    var that = this;
    env = env || this.env;
    that.source.load(env, function(e, conf) {
      if(e) {
        return fn && fn(e);
      }
      that.cache[env] = conf;
      fn && fn(null, conf);
    });
  };
  
  ConfLoader.prototype.get = function (env) {
    env = env || this.env;
    return this.cache[env];
  };
  
  ConfLoader.prototype.refresh = function (fn) {
    this.load(this.env, fn);
  };
  
  ConfLoader.prototype.reset = function() {
    this.cache = {};
  };
  
  return ConfLoader;
  
}());