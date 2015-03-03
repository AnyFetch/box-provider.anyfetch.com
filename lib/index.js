'use strict';
/**
 * This object contains all the handlers to use for this provider
 */
var crypto = require('crypto');
var CancelError = require('anyfetch-provider').CancelError;
var async = require('async');
var request = require('supertest');

var config = require('../config/configuration.js');
var state = crypto.randomBytes(10).toString('hex');


var redirectToService = function(callbackUrl, cb) {
  var redirectUrl = 'https://app.box.com/api/oauth2/authorize?response_type=code&client_id=' + config.box.api + '&redirect_uri=' + config.providerUrl + '/init/callback' + '&state=' + state;
  cb(null, redirectUrl, {state: state});
};

var retrieveTokens = function(reqParams, storedParams, cb) {
  // Store new data
  if(reqParams.error === 'access_denied') {
    return cb(new CancelError());
  }

  if(reqParams.state !== storedParams.state) {
    console.log('Sent state and recieved state does not match: \n' + reqParams.state + '\n' + storedParams.state);
    return cb(new CancelError());
  }

  var authData;

  async.waterfall([
    function getToken(cb) {
      var apiUrl = "https://api.box.com/oauth2/";
      var url = '/token';
      request(apiUrl)
        .post(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({grant_type: 'authorization_code',
              code: reqParams.code,
              client_secret: config.box.secret,
              client_id: config.box.api
            })
        .expect(200)
        .end(cb);
    },
    function getEmailAddress(data, cb) {
      authData = data.body;
      var apiUrl = "https://api.box.com/2.0/";
      var url = "/users/me";

      request(apiUrl)
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + data.body.access_token)
        .expect(200)
        .end(cb);
    },
    function callFinalCb(data, cb) {
      cb(null, data.body.login, authData);
    }
  ], cb);
};

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },

  config: config
};
