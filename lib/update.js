'use strict';

var async = require('async');
var request = require('supertest');

var config = require('../config/configuration.js');


module.exports = function updateAccount(serviceData, cursor, queues, cb) {
  console.log("______________Update fired!_________________");

  async.waterfall([
    function refreshToken(cb) {
      console.log('________refresh token_________');
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
      console.log('getRootFolder ' + JSON.stringify(data.body));
      // var apiUrl = "https://api.box.com/2.0/";
      // var url = "/folders/";

      // request(apiUrl)
      // .get(url)
      // .set('Content-Type', 'application/x-www-form-urlencoded')
      // .set('Authorization', 'Bearer ' + serviceData.access_token)
      // .expect(200)
      // .end(cb);
      cb(null, data.body);
    },
    function parseFolders(data, folders) {
      console.log('Parse folders ' + data.body);
      cb(null);
    }
    ], function(err) {
      console.log('ERROR ____________' + err);
      cb(null, new Date());
    });
};
