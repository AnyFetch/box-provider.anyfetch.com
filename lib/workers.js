'use strict';

var log = require('anyfetch-provider').log;

// var uploadContact = require('./helpers/upload.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  // Send data to AnyFetch.
  // You may define this as an helper function
  // Job is an item with your task, an anyfetch client, and data stored by retrieveTokens()
  log.info({
    name: 'addition',
    identifier: job.task.identifier
  }, "Uploading");
  uploadContact(job.task, job.anyfetchClient, job.serviceData.access_token, cb);
};

module.exports.deletion = function deletionQueueWorker(job, cb) {
  // Delete data from AnyFetch.
  // You may define this as an helper function
  // Job is an item with your task, an anyfetch client, and data stored by retrieveTokens()
  cb(null);
};
