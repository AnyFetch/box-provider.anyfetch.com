'use strict';
/**
 * This object contains all the handlers to use for this provider
 */
var crypto = require('crypto');
var async = require('async');
var request = require('supertest');

var config = require('../config/configuration.js');
var state = crypto.randomBytes(10).toString('hex');


var redirectToService = function(callbackUrl, cb) {
	var redirectUrl = 'https://app.box.com/api/oauth2/authorize?response_type=code&client_id=' + config.box.api + '&redirect_uri=' + config.providerUrl + '/init/callback' + '&state=security_token' + state;
  cb(null, redirectUrl, {state: state});
};

var retrieveTokens = function(reqParams, storedParams, cb) {
  // Store new data
  console.log('callback --- ', reqParams, storedParams);
  cb(null, 'accountName', {some: "data"});
};

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },

  config: config
};
