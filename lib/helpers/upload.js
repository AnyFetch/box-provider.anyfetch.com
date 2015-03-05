'use strict';

// var rarity = require('rarity');
var request = require('supertest');
var async = require('async');
var crypto = require('crypto');
var http = require('https');
var fs = require('fs');


module.exports = function upload(file, anyfetchClient, accessToken, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/files/" + file.id;
  var metadata;

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
      metadata = metadata.body;
      // do not download the file when it is scheduled for deletion
      if(!metadata.trashed_at) {
        cb(null);
      }
      else {
        cb('Error: File will be soon deleted');
      }
    },
    function getFileUrl(cb) {
      request(apiUrl)
        .get(url + '/content/')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .end(function(err, res) {
          // We need to handle the 'retry after'
          if(res && res.statusCode === 302) {
            return cb(null, res.header.location);
          }
          cb(err);
        });
    },
    function downloadFile(url, cb) {
      var outFile = fs.createWriteStream('/tmp/' + crypto.randomBytes(10).toString('hex'));
      outFile.on('error', cb);
      http.get(url, function(response) {
          response.pipe(outFile);
        }).on('error', cb);
      cb(null);
    }
  ], function(err, res) {
    console.log(err, res);
    cb(null);
  });
  // anyfetchClient.postDocument(formattedContact, rarity.slice(1, cb));
};
