'use strict';

// var rarity = require('rarity');
var log = require('anyfetch-provider').log;
var request = require('supertest');
var async = require('async');
var crypto = require('crypto');
var http = require('https');
var fs = require('fs');


module.exports = function upload(file, anyfetchClient, accessToken, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/files/" + file.id;
  var filename = '/tmp/' + crypto.randomBytes(10).toString('hex');
  var metadata;


  var document = {
    actions: {},
    data: {},
    document_type: "file",
    user_access: [anyfetchClient.accessToken]
  };

  // file to send
  var fileConfig = {};

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
      document.identifier = 'https://app.box.com/files/0/f/' + metadata.parent.id + '/1/f_' + metadata.id;
      // do not download the filenamee when it is scheduled for deletion
      if(!metadata.trashed_at) {
        fileConfig.filename = metadata.name;
        fileConfig.knownLength = metadata.size;
        document.creation_date = metadata.created_at;
        document.modification_date = metadata.modified_at;
        document.metadata = {
          title: metadata.name
        };
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
          // TODO: handle the 'retry after'
          if(res && res.statusCode === 302) {
            return cb(null, res.header.location);
          }
          cb(err);
        });
    },
    function downloadFile(url, cb) {
      var outFile = fs.createWriteStream(filename);
      fileConfig.file = filename;
      outFile.on('error', cb);
      http.get(url, function(response) {
          response.pipe(outFile);
          response.on('end', cb);
        }).on('error', cb);
      cb(null);
    }
  ], function(err, file) {
    log.error(err, file);
    anyfetchClient.sendDocumentAndFile(document, fileConfig, cb);
  });
};
