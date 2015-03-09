'use strict';

var log = require('anyfetch-provider').log;

var uploadFile = require('./helpers/upload.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  log.info({
    name: 'addition',
    identifier: job.task.identifier
  }, "Uploading");
  uploadFile(job.task, job.anyfetchClient, job.serviceData.access_token, cb);
};

module.exports.deletion = function deletionQueueWorker(job, cb) {
  cb(null);
};
