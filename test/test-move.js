'use strict';

require('should');

var update = require('../lib/update.js');
var config = require('../config/configuration.js');

describe("Testing the move event", function() {
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
    .get('/2.0/events?stream_position=1')
    .reply(200, {
      "next_stream_position": "1",
      "entries": [{
        "event_type": "ITEM_MOVE",
        "source": {
          "type": "file",
          "id": "10"
          }
        },
        {"event_type": "ITEM_MOVE",
        "source": {
          "type": "folder",
          "id": "11"
        }
      }]
    });

    // mock the folder crawling
    nock('https://api.box.com:443')
    .get('/2.0/folders/11')
    .reply(200, {
      "item_collection": {
        "entries": [
          {
            "type": "file",
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

    done();
  });

  it('should add one file to the addition list and crawl the moved folder', function(done) {
    update({refresh_token: 'fake_token', next_stream_position: '1'}, null, fakeQueue, function(err, cursor, serviceData) {
      cursor.should.not.equal(null);
      serviceData.access_token.should.equal('fake_access');
      serviceData.next_stream_position.should.equal('1');
      fakeQueue.addition.should.have.lengthOf(3);
      fakeQueue.addition[0].id.should.equal('10');
      fakeQueue.addition[1].id.should.equal('1');
      fakeQueue.addition[2].id.should.equal('2');
      done(err);
    });
  });
});
