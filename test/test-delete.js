'use strict';

require('should');

var update = require('../lib/update.js');
var config = require('../config/configuration.js');

describe("Testing the delete event", function() {
  var fakeQueue = {
    deletion: []
  };

  before(function(done) {
    var nock = require('nock');
    // mocking the refresh token request
    nock('https://api.box.com:443')
    .post('/oauth2/token', "grant_type=refresh_token&refresh_token=fake_token&client_secret=" + config.box.secret + "&client_id=" + config.box.api)
    .reply(200, {
      access_token: 'fake_access'
    });

    // mocking the very dummy call event
    nock('https://api.box.com:443')
    .get('/2.0/events?stream_position=1')
    .reply(200, {
      "next_stream_position": "1",
      "entries": [{
        "event_type": "ITEM_TRASH",
        "source": {
          "type": "file",
          "id": "10"
        }
      }]
    });

    done();
  });

  it('Should add one file to the deletion queue', function(done) {
    update({refresh_token: 'fake_token', next_stream_position: '1'}, null, fakeQueue, function(err, cursor, serviceData) {
      cursor.should.not.equal(null);
      serviceData.access_token.should.equal('fake_access');
      serviceData.next_stream_position.should.equal('1');
      fakeQueue.deletion.should.have.lengthOf(1);
      fakeQueue.deletion[0].identifier.should.equal('10');
      done(err);
    });
  });
});
