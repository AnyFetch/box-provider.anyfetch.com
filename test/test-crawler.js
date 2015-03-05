'use strict';

require('should');
var nock = require('nock');

var update = require('../lib/update.js');
var config = require('../config/configuration.js');


describe("Testing the crawler", function() {
  var filesPushed = [];

  var fakeQueue = {
    addition: {
      push: function(file) {
        filesPushed.push(file);
      }
    }
  };

  var mockRefreshToken =
  nock('https://api.box.com:443')
  .post('/oauth2/token', "grant_type=refresh_token&refresh_token=fake_token&client_secret=" + config.box.secret + "&client_id=" + config.box.api)
  .reply(200, {
    access_token: 'fake_access'
  });


  var mockRootFolder =
  nock('https://api.box.com:443')
  .get('/2.0//folders/0')
  .reply(200, ["1f8b0800000000000003bd52c94ec33010fd15e473859286d2e54485c407c01155916b4fd2118e1dbc14952affce386eba40e1c86d3cdb7bf3fcf6ccef5a600b561925c1b2114349af8c0207ef01b480326674506ac4c0f37a88356fe2dc52a99b2754e0684258e01e64c9fdd0d41889155ea4243861b1f568348d471cfca44577b33c1f8ff3116bb9df94c2280522f5ec99379e2bca054d5b32a2a1bd45425cbcaeba13ea7ad7f7a673823b1dc38e642952a6c61eb83b63f7ebe8b8288a595164d3d38ea5f646a3be79c635f020cf56f254b1a9f050371cd5ad304d84f296bbcd850e6db0f5454218ede9b2f2a78a43e58a9ae643ff0b7fb7e1968014eab7013a39a60cad325c9610bb8fb751b33e72440f4de93cf7c14514fad62db043fa8f8fcecf3f7a7fdda7453e9fdecff3c96cf2ddb0bd85935ffbf070bdd8b26e45b25595836426850d46b48c6263e3ee8816154d90e458b40345b67c7924390ef57ee795faaaebbe00373666de58030000"], { server: 'ATS',
    date: 'Thu, 05 Mar 2015 09:29:31 GMT',
    'content-type': 'application/json',
    'cache-control': 'no-cache, no-store',
    'content-encoding': 'gzip',
    vary: 'Accept-Encoding',
    'content-length': '367',
    age: '0',
    connection: 'close' });

  it('should require a new token and get the root folder', function(done) {
    update({refresh_token: 'fake_token'}, null, fakeQueue, function(err) {
      console.log(err);
      done(err);
    });
  });
});
