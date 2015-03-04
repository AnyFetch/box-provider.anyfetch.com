'use strict';

var async = require('async');
var request = require('supertest');

var Crawler = function Crawler() {
  this.queues;
  this.serviceData;
  this.cursor;
  this.taskQueue;
};

Crawler.prototype.processTask = function(folder, callback) {
  var self = this;
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/folders/" + folder.id;

  async.waterfall([
    function getFolderContent(cb) {
      request(apiUrl)
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + self.serviceData.access_token)
        .expect(200)
        .end(cb);
    },
    function processFolderContent(content, cb) {
      var allFilesId = content.body.item_collection.entries.filter(function(item) {
        return item.type !== 'folder';
      }).map(function(item) {
        return item.id;
      });
      // push files in queues
      allFilesId.forEach(function(item) {
        self.queues.addition.push(item);
      });
      var folders = content.body.item_collection.entries.filter(function(item) {
        return item.type === 'folder';
      });
      self.taskQueue.push(folders);
      cb(null);
    }
    ], callback);
};

module.exports = Crawler;
