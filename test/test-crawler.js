'use strict';

require('should');
var async = require('async');
var nock = require('nock');

var update = require('../lib/update.js');
var config = require('../config/configuration.js');
var crawler = require('../lib/crawler.js');


describe("Testing the crawler", function() {
  var filesPushed = [];

  var fakeQueue = {
    addition: {
      push: function(file) {
        filesPushed.push(file);
      }
    }
  };

  var mockRefreshToken =
  nock('https://api.box.com:443')
  .post('/oauth2/token', "grant_type=refresh_token&refresh_token=fake_token&client_secret=" + config.box.secret + "&client_id=" + config.box.api)
  .reply(200, {
    access_token: 'fake_access'
  });

  it('should require a new token', function(done) {
    update({refresh_token: 'fake_token'}, null, fakeQueue, function(err) {
      done(err);
    });
  });
});
