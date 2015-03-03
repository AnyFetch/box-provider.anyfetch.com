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

  var token;
  var apiUrl = "https://api.box.com/oauth2/";

  async.waterfall([
    function getToken(cb) {
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
    function callFinalCb(data, cb) {
      cb(null, data);
    }
  ], function(err, res) {
    console.log(err, res.body);
  });
  cb(null, 'accountName', {some: "data"});
};

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },

  config: config
};
