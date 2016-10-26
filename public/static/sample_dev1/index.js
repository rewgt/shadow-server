'use strict';

var useBrowserify = false, useWebpack = false;
var reactRequire_ = arguments[3], reactModules_ = arguments[4], reactExport_ = arguments[5];
if ((typeof reactRequire_ == 'function') && reactModules_)
  useBrowserify = true;
else if (typeof __webpack_require__ != 'undefined' && __webpack_require__.c)
  useWebpack = true;

var React, ReactDOM, W;
if (useBrowserify) {
  try {
    React = require('react');
  } catch(e) {
    if (React = window.React)
      reactExport_['react'] = { exports:React };
  }
  try {
    ReactDOM = require('react-dom');
  } catch(e) {
    if (ReactDOM = window.ReactDOM)
      reactExport_['react-dom'] = { exports:ReactDOM };
  }
  try {
    W = require('shadow-widget');
  } catch(e) {
    if (W = window.W)
      reactExport_['shadow-widget'] = { exports:W };
  }
}
else if (useWebpack) {
  React = require('react');
  ReactDOM = require('react-dom');
  W = require('shadow-widget');
}
else console.log('fatal error: unknown package tool!');
  
// write your code here ...
var my_module = require('./src/my_module');

var exportModules = {
  react: React,
  'react-dom': ReactDOM,
  'shadow-widget': W,
};

if (useBrowserify) {
  Object.keys(exportModules).forEach( function(sName) {
    reactExport_[sName] = { exports:exportModules[sName] };
  });
  
  // regist pseudo module, module ID is fixed to 9999
  reactModules_[9999] = [W.$utils.loadingEntry,reactModules_[1][1]];
  setTimeout( function() {
    if (!W.$main.isStart) {
      W.$main.isStart = true;
      reactRequire_(reactModules_,reactExport_,[9999]); // load pseudo module
    }
  },300);  // delay, wait main modules ready and let window initial event run first
}
else if (useWebpack) {
  // regist pseudo module, module ID is fixed to 9999
  var module = { exports:{}, id:9999, loaded:true };
  __webpack_require__.c[9999] = module;
  
  setTimeout( function() {
    if (!W.$main.isStart) {
      W.$main.isStart = true;
      W.$utils.loadingEntry( function(nameOrId) { // wrap require()
        if (typeof nameOrId == 'number')
          return __webpack_require__(nameOrId);   // such as require(1), only used when debugging
        else {
          var ret = exportModules[nameOrId];
          if (!ret)
            console.log('can not find module: ' + nameOrId);
          return ret;
        }
      }, module,module.exports);
    }
  },300);
}
