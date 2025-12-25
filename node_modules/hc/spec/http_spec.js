var expect = require("chai").expect;

describe("http config source", function() {
  
  var http = require("http");
  var hc = require("../index");
  var HS = require("../lib/source/http");
  var config = {foo: "bar"};
  var url = require("url");
  var srv = http.createServer(function(req, res) {
    var parsed = url.parse(req.url);
    res.writeHead(200, {
      "content-type": "application/json"
    });
    if(parsed.pathname === "/") {
      res.end(JSON.stringify(config));
    } else {
      res.end(JSON.stringify({
        env: parsed.pathname.split("/").pop()
      }));
    }
    
  });
  
  it("should read from http service", function(done) {
    srv.listen(9000, function() {
      hc({source: new HS("http://localhost:9000")}, function(e, conf) {
        if(e) {done(e);}
        expect(conf).to.be.ok;
        expect(conf).to.deep.equal(config);
        srv.close(done);
      });
    });
  });
  
  it("should replace env variable", function(done) {
    srv.listen(9000, function() {
      hc({source: new HS("http://localhost:9000/{env}")}, function(e, conf) {
        if(e) {done(e);}
        expect(conf).to.be.ok;
        expect(conf.env).to.equal(process.NODE_ENV || "test");
        done();
        srv.close();
      });
    });
  });
  
});