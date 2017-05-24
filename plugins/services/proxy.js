// static head of plugin source
//-----------------------------
var path = require('path'),
    main = require(path.join(__dirname,'../main'));

var M = exports = module.exports = main.modules['services/proxy.js'];

// import modules
//---------------
var fs = require('fs'),
    najax = require('najax');

// module global definition
//-------------------------

// onload() will be called for every online-update
//------------------------------------------------
M.onload = function(app) {

var is_in_develop_ = app.get('env') === 'development';
var config = main.config;
var utils = main.utils;

main.pluginServices['$proxy'] = [function(req,res,sCateProj,sServPath) { // sCateProj: $$cate/project, sServPath: $service/...
  var sUrl = req.query.url;  // sUrl fix using '/'
  if (req.method == 'GET' && sUrl) {  // only support get 'text/html; charset=utf-8' content
    if (sUrl.indexOf('http') == 0 && (sUrl[4] == ':' || sUrl.slice(4,6) == 's:')) {
      delete req.query.url;
      var sQuery = '';
      for (var sKey in req.query) {
        sQuery += (sQuery?'&':'?') + sKey + '=' + encodeURIComponent(req.query[sKey]);
      }
      
      najax({ method:'GET', url:sUrl + sQuery,
        success: function(data) {  // data should be utf-8 responseText
          var fNow = new Date(), fTill = new Date(fNow.valueOf()+(is_in_develop_?60000:600000));
          res.set('Date',fNow.toUTCString()).set('Expires',fTill.toUTCString())
             .set('Content-Type','text/html; charset=utf-8').send(data);
        },
        error: function(xhr,statusText) {
          // console.log('error',xhr.status,statusText,xhr.responseText);
          res.status(xhr.status).send(statusText || '');
        },
      });
      return;
    }
    else {  // request from local, can not use najax() which will raise 'connect EHOSTUNREACH' error
      var sItem = sUrl[0] != '/'? '/' + sCateProj + '/' + sUrl: sUrl;
      if (sItem.slice(-1) == '/') sItem += 'index.html';
      
      var sFile = '';
      if (sItem.startsWith('/app/')) {
        var iPos = sItem.indexOf('/',5);
        if (iPos > 5) {
          if (sItem.slice(5,iPos) == 'files') { // take as static file for 'GET' method
            var b = sItem.slice(iPos+1).split('/');
            if (b[1] == 'web') { // [proj,'web',...]
              b.splice(1,1);     // remove 'web'
              sItem = 'files/' + b.join('/');
              sFile = path.join(config.STATIC_DIR,sItem);
            }
            // else, invalid path, not support none-web
          }
          else {
            var sPath = sItem.slice(iPos);      // remove: /app/xxx
            var b = utils.scanCategory(sPath);  // sPath:  /cate_proj/ver/file
            if (b) {
              var sTmp2, sTmp = b[1], iPos2 = sTmp.indexOf('/web/');
              if (iPos2 > 0 && (sTmp2=sTmp.slice(0,iPos2)).indexOf('/') == -1) {
                sItem = b[0] + sTmp2 + sTmp.slice(iPos2+4);
                sFile = path.join(config.STATIC_DIR,sItem);
                if (!fs.existsSync(sFile))
                  sFile = path.join(config.USER_DIR,sItem);
              }
              // else, invalid path
            }
            // else, invalid path
          }
        }
        // else, invalid path
      }
      else {
        sFile = path.join(config.STATIC_DIR,sItem);
        if (!fs.existsSync(sFile))
          sFile = path.join(config.USER_DIR,sItem);
      }
      
      if (sFile && fs.existsSync(sFile) && sFile.indexOf(config.USER_PATH) == 0) {
        if (main.returnStaticFile(sFile,res))
          return;
      }
    }
  }
  res.status(404).send('Not found');
},'1.0','rewgt'];  // version='1.0', vendor='rewgt'

};
