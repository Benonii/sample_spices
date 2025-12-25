(function() {
  
  var request = require("request");
  
  var HttpSource = module.exports = function(options) {
    this.endpoint = typeof options === "string" ? options : options.endpoint;
  };
  
  HttpSource.prototype.load = function(env, fn) {
    request.get({url: this.endpoint.replace(/\{env\}/i, env) ,json:true}, function(e, resp, body) {
      if(e) {
        return fn(e);
      }
      fn(null, body[env] || body);
    });
  };
  
  
  
}());