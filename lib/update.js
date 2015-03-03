'use strict';

var async = require('async');
var request = require('supertest');

var config = require('../config/configuration.js');

var getSubFolder = function getSubFolder(serviceData, cursor, id, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/folders/" + id;

  async.waterfall([
    function getFolderContent(cb) {
      request(apiUrl)
      .get(url)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', 'Bearer ' + serviceData.access_token)
      .expect(200)
      .end(cb);
    },
    function processFolderContent(content, cb) {
      var allFilesId = [];
      var total = content.body.item_collection.total_count;
      if(total === 0) {
        cb(null, allFilesId);
      }
      var processed = 0;
      content.body.item_collection.entries.forEach(function(item) {
        if(item.type === 'folder') {
          // found a folder? Let's recurs then !
          getSubFolder(serviceData, cursor, item.id, function(err, filesId) {
            allFilesId = allFilesId.concat(filesId);
            if(++processed === total) {
              cb(null, allFilesId);
            }
          });
        }
        else {
          allFilesId.push(item.id);
          if(++processed === total) {
            cb(null, allFilesId);
          }
        }
      });
    }
    ], cb);
};

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
    function parseFolders(data, cb) {
      // saving the new tokens
      serviceData = data.body;
      // 0 is the default id of the root folder
      getSubFolder(serviceData, cursor, 0, cb);
    },
    function sendFiles(files, cb) {
      console.log(files);
      cb(null);
    }
    ], function(err) {
      console.log('ERROR ____________' + err);
      cb(null, new Date(), serviceData);
    });
};
