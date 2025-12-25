var ConfLoader = require("./conf_loader");

(function() {
  var loader, hc;
  
  hc = module.exports = function(options, fn) {
    if(typeof options === "function") {
      fn = options;
      options = {};
    }
    loader = new ConfLoader(options);
    return loader.load(options.env ,fn);
  };
  
  hc.get = function() {
    if(loader) {
      return loader.get.apply(loader, arguments);
    }
  };
  
  hc.getSync = function(options) {
    options = options || {};
    if(!loader) {
      loader = new ConfLoader(options);
    }
    loader.load(options.env);
    return loader.get();
  };
  
  hc.reset = function() {
    if(loader) {
      loader.reset();
    }
  };
  
  hc.sources = {
    Couch: require("./source/couchdb"),
    HTTP: require("./source/http"),
    Local: require("./source/local")
  };
  
}());