'use strict';

require('should');
var nock = require('nock');

var update = require('../lib/update.js');
var config = require('../config/configuration.js');


describe("Testing the crawler", function() {

  var filesPushed = [];

  var fakeQueue = {
    addition: []
  };

  before(function(done) {

    var mockRefreshToken =
    nock('https://api.box.com:443')
    .post('/oauth2/token', "grant_type=refresh_token&refresh_token=fake_token&client_secret=" + config.box.secret + "&client_id=" + config.box.api)
    .reply(200, {
      access_token: 'fake_access'
    });

    var mockRootFolder =
    nock('https://api.box.com:443')
    .get('/2.0//folders/0')
    .reply(200, {
      "item_collection": {
        "entries": [{
          "type": "folder",
          "id": "1",
          "sha1": "134b65991ed521fcfe4724b7d814ab8ded5185dc",
          },
          {
          "type": "file",
          "id": "2",
          "sha1": "134b65991ed521fcfe4724b7d814ab8ded5185dc",
          }
        ],
      }
    });

    var mockSubFolder =
    nock('https://api.box.com:443')
    .get('/2.0//folders/1')
    .reply(200, {
      "item_collection": {
        "entries": [{
          "type": "file",
          "id": "2",
          "sha1": "134b65991ed521fcfe4724b7d814ab8ded5185dc",
          }
        ],
      }
    });
    done();
  });

  it('should require a new token and get the root folder', function(done) {
    update({refresh_token: 'fake_token'}, null, fakeQueue, function(err) {
      fakeQueue.addition.length.should.equal(2);
      done(err);
    });
  });
});
