'use strict';

// var rarity = require('rarity');
var request = require('supertest');
var async = require('async');


module.exports = function upload(file, anyfetchClient, accessToken, cb) {

  var apiUrl = "https://api.box.com/2.0/";
  var url = "/files/" + file + "/content/";

  async.waterfall([
    function getFileContent(cb) {
      request(apiUrl)
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .end(cb);
    },
    function processFolderContent(content, cb) {
      console.log(content);
      cb(null);
    }
    ], function(err) {
      console.log('Error in upload:' + err);
      cb(null);
    });

  // anyfetchClient.postDocument(formattedContact, rarity.slice(1, cb));
};
