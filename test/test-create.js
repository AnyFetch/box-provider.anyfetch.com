'use strict';

require('should');

var update = require('../lib/update.js');
var config = require('../config/configuration.js');

describe("Testing the create/upload event", function() {
  var fakeQueue = {
    addition: []
  };

  before(function(done) {
    var nock = require('nock');
    // mocking the refresh token request
    nock('https://api.box.com:443')
    .post('/oauth2/token', "grant_type=refresh_token&refresh_token=fake_token&client_secret=" + config.box.secret + "&client_id=" + config.box.api)
    .reply(200, {
      access_token: 'fake_access'
    });

    // mocking the event call
    nock('https://api.box.com:443')
    .get('/2.0//events?stream_position=1')
    .reply(200, {
      "next_stream_position": "1",
      "entries": [{
        "event_type": "ITEM_CREATE",
        "source": {
          "type": "file",
          "id": "10"
          }
        },
        {"event_type": "ITEM_UPLOAD",
        "source": {
          "type": "file",
          "id": "11"
        }
      }]
    });

    done();
  });

  it('should add the two events to the addition queue', function(done) {
    update({refresh_token: 'fake_token', next_stream_position: '1'}, null, fakeQueue, function(err, cursor, serviceData) {
      cursor.should.not.equal(null);
      serviceData.access_token.should.equal('fake_access');
      serviceData.next_stream_position.should.equal('1');
      fakeQueue.addition.should.have.lengthOf(2);
      fakeQueue.addition[0].id.should.equal('10');
      fakeQueue.addition[1].id.should.equal('11');
      done(err);
    });
  });
});
