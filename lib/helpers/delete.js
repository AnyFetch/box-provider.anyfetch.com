'use strict';

// var rarity = require('rarity');
var log = require('anyfetch-provider').log;
var logError = require('anyfetch-provider').util.logError;
var request = require('supertest');
var async = require('async');


module.exports = function upload(file, anyfetchClient, accessToken, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/files/" + file.id;

  async.waterfall([
    function getFileMetadata(cb) {
      request(apiUrl)
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .end(cb);
    },
    function handleMetada(metadata, cb) {
      // Let's build the file address
      console.log(metadata.name);
      anyfetchClient.deleteDocumentByIdentifier('https://app.box.com/files/0/f/' + metadata.body.parent.id + '/1/f_' + metadata.body.id, function(err) {
        if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
          err = null;
        }
        cb(err);
      });
    }
  ], function(err) {
    if(err) {
      log.error(err);
      logError(err);
      return cb();
    }
  });
};
