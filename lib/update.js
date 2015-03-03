'use strict';

var async = require('async');
var request = require('supertest');

var config = require('../config/configuration.js');

var util = require('util');

module.exports = function updateAccount(serviceData, cursor, queues, cb) {
  async.waterfall([
    function refreshToken(cb) {
      var apiUrl = "https://api.box.com/oauth2/";
      var url = '/token';
      request(apiUrl)
      .post(url)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({grant_type: 'refresh_token',
        refresh_token: serviceData.refresh_token,
        client_secret: config.box.secret,
        client_id: config.box.api})
      .expect(200)
      .end(cb);
    },
    function getRootFolder(data, cb) {
      serviceData = data.body;
      var apiUrl = "https://api.box.com/2.0/";
      var url = "/folders/0";

      request(apiUrl)
      .get(url)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', 'Bearer ' + serviceData.access_token)
      .expect(200)
      .end(cb);
    },
    function parseFolders(data, folders) {
      console.log('Parse folders ' + util.inspect(data.body));
      cb(null, new Date(), serviceData);
    }
    ], function(err) {
      console.log('ERROR ____________' + err);
      cb(null, new Date(), serviceData);
    });
};
