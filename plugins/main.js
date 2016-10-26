// redeploy is required when this file is modified
//------------------------------------------------

var express = require('express'),
    path = require('path'),
    fs = require('fs');

exports = module.exports = {
  sources: [   // define source module table
    'trunk.js',
  ],
  
  routers: [   // define root-router table
    ['/', express.Router()],
  ],
};

(function() {
  var sPath = path.join(__dirname,'services');
  var bList = fs.readdirSync(sPath);
  bList.forEach( function(item) {
    if (item == '.' || item == '..') return;   // compatible with old node version
    if (path.extname(item) != '.js') return;
    var st = fs.lstatSync(path.join(sPath,item));
    if (st.isFile()) exports.sources.push('services/' + item);
  });
})();

exports.modules = {};
exports.sources.forEach( function(item) {
  exports.modules[item] = {};
});
