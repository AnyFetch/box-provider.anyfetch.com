'use strict';

var async = require('async');
var request = require('supertest');

var config = require('../config/configuration.js');
var Crawler = require('./crawler.js');


module.exports = function updateAccount(serviceData, cursor, queues, cb) {
  async.waterfall([
    function refreshToken(cb) {
      var apiUrl = "https://api.box.com/oauth2";
      var url = '/token';
      request(apiUrl)
      .post(url)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        grant_type: 'refresh_token',
        refresh_token: serviceData.refresh_token,
        client_secret: config.box.secret,
        client_id: config.box.api
      })
      .expect(200)
      .end(cb);
    },
    function parseFolders(data, cb) {
      // saving the new tokens
      serviceData = data.body;
      // init of the crawler
      var crawler = new Crawler(serviceData, queues, cursor, cb);
      // push the root folder to the taskQueue to init the crawling
      crawler.taskQueue.push({id: 0});
    }
  ], function(err) {
    cb(err, new Date().getTime(), serviceData);
  });
};
