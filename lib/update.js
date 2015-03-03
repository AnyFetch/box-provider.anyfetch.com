'use strict';

var async = require('async');
var request = require('supertest');

var config = require('../config/configuration.js');

var getSubFolder = function getSubFolder(serviceData, cursor, id, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/folders/" + id;

  request(apiUrl)
  .get(url)
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .set('Authorization', 'Bearer ' + serviceData.access_token)
  .expect(200)
  .end(function(err, res) {
    if(err) {
      cb(err);
    }
    else {
      var allFilesId = [];
      var total = res.body.item_collection.total_count;
      if(total === 0) {
        cb(null, allFilesId);
      }
      var processed = 0;
      res.body.item_collection.entries.forEach(function(item) {
        if(item.type === 'folder') {
          console.log('Folder = ' + item.name);
          getSubFolder(serviceData, cursor, item.id, function(err, filesId) {
            allFilesId = allFilesId.concat(filesId);
            if(++processed === total) {
              cb(null, allFilesId);
            }
          });
        }
        else {
          console.log('File = ' + item.name);
          allFilesId.push(item.id);
          if(++processed === total) {
            cb(null, allFilesId);
          }
        }
      });
    }
  });
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
    function parseFolders(folders, cb) {
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
