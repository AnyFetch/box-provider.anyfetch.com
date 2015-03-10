'use strict';

var log = require('anyfetch-provider').log;
var logError = require('anyfetch-provider').util.logError;
var request = require('supertest');
var async = require('async');


module.exports = function upload(serviceData, queues, cb) {
  var apiUrl = "https://api.box.com/2.0/";
  var url = "/events?" + 'stream_position=';
  url += !serviceData.next_stream_position ? 'now' : serviceData.next_stream_position;

  async.waterfall([
    function getFileMetadata(cb) {
      request(apiUrl)
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer ' + serviceData.access_token)
        .expect(200)
        .end(cb);
    },
    function handleMetada(metadata, cb) {
      if(serviceData.next_stream_position) {
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
          return item.event_type === 'ITEM_MOVE' && item.source.type === 'file';
        }).map(function(item) {
          return {id: item.source.id, cursor: 0};
        });
        movedFilesId.forEach(function(item) {
          queues.addition.push(item);
        });
        // handling moved folder
        // var movedFoldersId = metadata.body.entries.filter(function(item) {
        //   return item.event_type === 'ITEM_MOVE' && item.source.type === 'folder';
        // }).map(function(item) {
        //   return {id: item.source.id, cursor: 0};
        // });
        // movedFilesId.forEach(function(item) {
        //   queues.addition.push(item);
        // });

      }
      serviceData.next_stream_position = metadata.body.next_stream_position;
      cb(null);
    }
  ], function(err) {
    if(err) {
      log.error(err);
      logError(err);
      return cb(err);
    }
    cb();
  });
};