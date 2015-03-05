'use strict';

// var rarity = require('rarity');
var request = require('supertest');
var async = require('async');


module.exports = function upload(file, anyfetchClient, accessToken, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/files/" + file.id + "/content/";

  async.waterfall([
    function getFileUrl(cb) {
      request(apiUrl)
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .end(function(err, res) {
          // handle the retry after
          if(res && res.statusCode === 302) {
            return cb(null, res.header.location);
          }
          cb(err);
        });
    },
    function processFileUrl(content, cb) {
      console.log(content);
      cb(null);
    }
    ], function(err, res) {
      cb(null);
    });
  // anyfetchClient.postDocument(formattedContact, rarity.slice(1, cb));
};
