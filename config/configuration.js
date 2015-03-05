/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();

// nodeEnv can either be "development" or "production"
var nodeEnv = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var defaultPort = 8000;
if(nodeEnv === "production") {
  defaultPort = 80;
}

// Exports configuration for use by app.js
module.exports = {
  env: nodeEnv,
  port: process.env.PORT || defaultPort,

  // Optional params

  usersConcurrency: process.env.USERS_CONCURRENCY || 1,
  concurrency: process.env.CONCURRENCY || 1,

  providerUrl: process.env.PROVIDER_URL,
  appId: process.env.ANYFETCH_API_ID,
  appSecret: process.env.ANYFETCH_API_SECRET,

  box: {
    api: process.env.BOX_API_ID || 'api_id',
    secret: process.env.BOX_API_SECRET || 'api_secret'
  },

  opbeat: {
    organizationId: process.env.OPBEAT_ORGANIZATION_ID,
    appId: process.env.OPBEAT_APP_ID,
    secretToken: process.env.OPBEAT_SECRET_TOKEN
  }
};
