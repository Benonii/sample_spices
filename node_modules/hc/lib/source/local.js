/*global __dirname */

(function() {
  
  var fs = require("fs"),
      path = require("path");
  
  var LocalSource = module.exports = function(options) {
    options = options || {};
    this.root = typeof options === "string" ? options : options.root;
  };
  
  LocalSource.prototype.load = function(env, fn) {
    var root, candidates, i, conf;
    
    candidates = [];
    root = this.root || process.env.CC_PATH || process.cwd();
    candidates.push(path.join(path.dirname(require.main.filename), "config.json"));
    candidates.push(path.join(root, "config.json"));
    candidates.push(path.join(root, "config.js"));
    candidates.push(path.join(root, "config/config.json"));
    candidates.push(path.join(root, "config/config.js"));
    candidates.push(path.join(root, "config/" + env + ".json"));
    candidates.push(path.join(root, "config/" + env + ".js"));
    i = candidates.length;
    while(i--) {
      if(fs.existsSync(candidates[i])) {
        break;
      }
    }
    if(candidates[i]) {
      try {
        conf = require(candidates[i]);
      } catch(e) {
        return fn(e);
      }
    }
    if(conf) {
      return fn(null, conf[env] || conf);
    }
    fn(new Error("cannot find conf with env " + env));
  };
  
  
}());