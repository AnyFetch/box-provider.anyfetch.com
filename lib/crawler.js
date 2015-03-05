'use strict';

var async = require('async');
var request = require('supertest');

var Crawler = function Crawler(serviceData, queues, cursor, cb) {
  this.queues = queues;
  this.serviceData = serviceData;
  this.cursor = cursor;
  this.finalCb = cb;
  this.taskQueue = async.queue(this.processTask.bind(this), 5);
  this.taskQueue.drain = function() {
    // drain is called when the last worker on the queue has returned, but we need to check if that last worker has pushed new tasks
    if(this.taskQueue.length() === 0) {
      this.finalCb(null, new Date(), this.serviceData);
    }
  }.bind(this);
  this.taskQueue.error = function(err) {
    console.log(err);
  }.bind(this);
};

Crawler.prototype.processTask = function(folder, cb) {
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
        return {id: item.id, sha1: item.sha1};
      });
      // push files in provider queue
      allFilesId.forEach(function(item) {
        self.queues.addition.push(item);
      });
      var folders = content.body.item_collection.entries.filter(function(item) {
        return item.type === 'folder';
      });
      // push folders in the recursive queue
      // We need to check the folders length because an empty task will automatically trigger a call to drain()
      if(folders.length > 0) {
        self.taskQueue.push(folders);
      }
      cb(null);
    }
  ], cb);
};

module.exports = Crawler;
