'use strict';

var log = require('anyfetch-provider').log;
var request = require('supertest');
var async = require('async');

var Crawler = require('../crawler.js');


module.exports = function getEvents(serviceData, queues, cb) {
  var apiUrl = "https://api.box.com/2.0";
  var url = "/events?" + 'stream_position=';
  url += !serviceData.next_stream_position ? 'now' : serviceData.next_stream_position;

  async.waterfall([
    function getEvents(cb) {
      request(apiUrl)
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + serviceData.access_token)
        .expect(200)
        .end(cb);
    },
    function handleMetada(metadata, cb) {
      var movedFoldersId = [];
      // if this is the first call, just store the new stream position
      if(serviceData.next_stream_position && metadata.body.entries.length > 0) {
        // handling new files
        var addedFilesId = metadata.body.entries.filter(function(item) {
          return (item.event_type === 'ITEM_CREATE' || item.event_type === 'ITEM_UPLOAD') && item.source.type === 'file';
        }).map(function(item) {
          return {id: item.source.id, cursor: 0};
        });
        addedFilesId.forEach(function(item) {
          queues.addition.push(item);
        });

        // handling deleted items
        var deletedFilesId = metadata.body.entries.filter(function(item) {
          return item.event_type === 'ITEM_TRASH' && item.source.type === 'file';
        }).map(function(item) {
          return {identifier: item.source.id};
        });
        deletedFilesId.forEach(function(item) {
          queues.deletion.push(item);
        });

        // handling moved files
        var movedFilesId = metadata.body.entries.filter(function(item) {
          return (item.event_type === 'ITEM_MOVE' || item.event_type === 'ITEM_RENAME') && item.source.type === 'file';
        }).map(function(item) {
          return {id: item.source.id, cursor: 0};
        });
        movedFilesId.forEach(function(item) {
          queues.addition.push(item);
        });

        // handling moved folders
        movedFoldersId = metadata.body.entries.filter(function(item) {
          return item.event_type === 'ITEM_MOVE' && item.source.type === 'folder';
        }).map(function(item) {
          return {id: item.source.id};
        });
        if(movedFoldersId.length > 0) {
          // init of the crawler
          var crawler = new Crawler(serviceData, queues, 0, cb);
          movedFoldersId.forEach(function(item) {
            crawler.taskQueue.push(item);
          });
        }
      }
      serviceData.next_stream_position = metadata.body.next_stream_position;
      // The crawler will use cb() if there was folders to index
      if(movedFoldersId.length === 0) {
        cb(null);
      }
    }
  ], function(err) {
    if(err) {
      log.error(err);
    }
    return cb(err);
  });
};
