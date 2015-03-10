'use strict';

require('should');

var update = require('../lib/update.js');
var config = require('../config/configuration.js');

describe("Testing the crawler", function() {
  var fakeQueue = {
    addition: [],
    deletion: []
  };

  before(function(done) {
    var nock = require('nock');
    // nock.recorder.rec();
    // mocking the refresh token request
    nock('https://api.box.com:443')
    .post('/oauth2/token', "grant_type=refresh_token&refresh_token=fake_token&client_secret=" + config.box.secret + "&client_id=" + config.box.api)
    .reply(200, {
      access_token: 'fake_access'
    });

    // mocking the root folder crawling
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

    // mocking the subfolder crawling
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

    // mocking the very first event call
    nock('https://api.box.com:443')
    .get('/2.0//events?stream_position=now')
    .reply(200, {
      "next_stream_position": "1"
    });

    done();
  });

  it('should require a new token, get the root folder and make the first /event call', function(done) {
    update({refresh_token: 'fake_token'}, null, fakeQueue, function(err, cursor, serviceData) {
      cursor.should.not.equal(null);
      serviceData.access_token.should.equal('fake_access');
      serviceData.next_stream_position.should.equal('1');
      fakeQueue.addition.length.should.equal(2);
      done(err);
    });
  });

  // it('should refresh the previous token, and call /event right away.', function(done) {
  //   update({refresh_token: 'fake_token', cursor: 0, next_stream_position: 1}, null, fakeQueue, function(err) {
  //     fakeQueue.addition.length.should.equal(2);
  //     done(err);
  //   });
  // });
});
