'use strict';

// var rarity = require('rarity');
var log = require('anyfetch-provider').log;
var logError = require('anyfetch-provider').util.logError;
var request = require('supertest');
var async = require('async');
var crypto = require('crypto');
var http = require('https');
var fs = require('fs');


module.exports = function upload(file, anyfetchClient, accessToken, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/files/" + file.id;
  var filename = '/tmp/' + crypto.randomBytes(10).toString('hex');

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
      // Let's build the file address for the user
      document.identifier = 'https://app.box.com/files/0/f/' + metadata.parent.id + '/1/f_' + metadata.id;
      document.actions.show = document.identifier;
      // do not download the file when it is scheduled for deletion or if it is bigger than 50Mb
      if(!metadata.trashed_at && metadata.size < 52428800) {
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
        cb(new Error('File will be soon deleted'));
      }
    },
    function getFileUrl(cb) {
      request(apiUrl)
        .get(url + '/content/')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(302)
        .end(function(err, res) {
          if(err && res.statusCode !== 302 && res.statusCode !== 202) {
            cb(err);
          }
          else {
            cb(null, res);
          }
        });
    },
    function getFileLocation(res) {
      if(res.statusCode === 302) {
        return cb(null, res.header.location);
      }
      else if(res.statusCode === 202) {
        return cb(new Error('Testing the retry after header:' + res.header['Retry-After']));
      }
    },
    function downloadFile(url, cb) {
      var outFile = fs.createWriteStream(filename);
      fileConfig.file = filename;
      outFile.on('error', cb);
      http.get(url, function(response) {
          response.pipe(outFile);
          response.on('end', cb);
        }).on('error', cb);
    }
  ], function(err) {
    if(err) {
      log.error(err);
      logError(err);
      cb();
    }
    // Let's send the document and the file to AnyFetch!
    anyfetchClient.sendDocumentAndFile(document, fileConfig, cb);
  });
};
