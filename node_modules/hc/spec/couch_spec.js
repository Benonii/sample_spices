var hc = require("../index");
var expect = require("chai").expect;

xdescribe("CouchDBSource", function() {
  
  it("should load conf by naming convention", function(done) {
    var cSource = new hc.sources.Couch({db:"http://127.0.0.1:5984/hc"});
    
    hc({
      source: cSource
    }, function(e, conf) {
      if(e) {done(e);}
      expect(conf).to.be.ok;
      expect(conf.foo).to.equal("bar");
      done();
    });
    
  });
  
  it("should load conf by given name", function(done) {
    hc({
      source: new hc.sources.Couch({
        db:"http://127.0.0.1:5984/hc", 
        id: "foobar"
      })
    }, function(e, conf) {
      if(e) {done(e);}
      expect(conf).to.be.ok;
      expect(conf.foo).to.equal("bar");
      done();
    });
  });
  
});