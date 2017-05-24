// static head of plugin source
//-----------------------------
var path = require('path'),
    main = require(path.join(__dirname,'../main'));

var M = exports = module.exports = main.modules['services/list.js'];

// import modules
//---------------
var fs = require('fs');

// module global definition
//-------------------------

// onload() will be called for every online-update
//------------------------------------------------
M.onload = function(app) {

var is_in_develop_ = app.get('env') === 'development';
var utils = main.utils;

var config = main.config;
var metaCfgFile = path.join(config.FILES_DIR,'rewgt/config/meta.json');
var metaDict = fs.existsSync(metaCfgFile)?JSON.parse(fs.readFileSync(metaCfgFile,'utf-8')):{};
var unknownMeta = {meta:'application/octet-stream',icon:'/files/rewgt/res/file_other.png',template:null,preview:null};

main.pluginServices['$list'] = [function(req,res,sCateProj,sServPath) { // sCateProj: $$cate/project, sServPath: $service/...
  if (req.method != 'GET') {
    res.status(400).send('Bad request');
    return;
  }
  
  // step 1: check work path and target path
  var succ = true, sDir = path.join(config.STATIC_DIR,sCateProj);
  if (!fs.existsSync(sDir)) {
    sDir = path.join(config.USER_DIR,sCateProj);
    if (!fs.existsSync(sDir))
      succ = false;
  }
  if (succ) {
    var st = fs.lstatSync(sDir);
    if (!st.isDirectory() || sDir.indexOf(config.USER_PATH) != 0)
      succ = false;
  }
  if (!succ) {
    res.status(404).send('can not find work directory: /' + sCateProj);
    return;
  }
  
  var appWebRoot = false;
  var sTargDir, sUrl = req.query.url || '';  // sUrl fix using '/'
  if (!sUrl) {
    sTargDir = sDir;
    sUrl = '/' + sCateProj;
  }
  else {
    if (sUrl.slice(-1) == '/') sUrl = sUrl.slice(0,-1);
    if (sUrl[0] != '/') sUrl = '/' + sUrl;
    
    if (sUrl.slice(0,5) == '/app/') {
      var iPos = sUrl.indexOf('/',5);
      if (iPos > 5) {
        if (sUrl.slice(5,iPos) == 'files') {
          var b = sUrl.slice(iPos+1).split('/');
          if (b[1] == 'web') { // ['proj','web',...]
            b.splice(1,1);     // remove 'web'
            sUrl = '/files/' + b.join('/');
          }
          else succ = false;   // invalid url
        }
        else {
          var sTmp = sUrl.slice(iPos);       // remove: /app/xxx
          var b = utils.scanCategory(sTmp);  // sTmp:   /cate_proj/ver/file
          if (b) {
            sTmp = b[1];
            var sTmp2,b2, sTmp = b[1], iPos2 = sTmp.indexOf('/web/');
            if (iPos2 > 0 && (sTmp2=sTmp.slice(0,iPos2)).indexOf('/') == -1)
              sUrl = '/' + b[0] + sTmp2 + sTmp.slice(iPos2+4);
            else if ((b2=sTmp.split('/')).length == 2 && b2[1] == 'web') {
              sUrl = '/' + b[0] + b2[0];
              appWebRoot = true;
            }
            else succ = false;
          }
          else succ = false;
        }
      }
      else succ = false;
    }
    
    if (succ) {
      sTargDir = path.join(config.STATIC_DIR,sUrl);
      if (!fs.existsSync(sTargDir)) {
        sTargDir = path.join(config.USER_DIR,sUrl);
        if (!fs.existsSync(sTargDir) || sTargDir.indexOf(config.USER_PATH) != 0)
          succ = false;
      }
    }
  }
  if (succ) {
    var st = fs.lstatSync(sTargDir);
    if (!st.isDirectory())
      succ = false;
  }
  if (!succ) {
    res.status(404).send('can not find target directory: ' + sUrl);
    return;
  }
  
  // step 2: analyse target path is topmost or not
  var atTop = false;
  if (sUrl == '/files/rewgt/templates' || sUrl == '/' || appWebRoot)
    atTop = true;  // can not go uplevel of system templates folder
  
  var bFolder = [], bFile = [], bTemplate = [];
  if (sUrl == '/') {   // list root folders
    [config.STATIC_DIR,config.USER_DIR].forEach( function(sDir,idx) {
      if (!fs.existsSync(sDir)) return;
      
      fs.readdirSync(sDir).forEach( function(item) {
        if (item[0] == '.') return;
        
        var sPath = path.join(sDir,item), st = fs.lstatSync(sPath);
        if (st.isDirectory()) { 
          if (idx == 0 && item == 'files') return;  // not includes '/files'
          if (idx == 1 && item == 'shadow-server') return; // not includes '/shadow-server'
          if (bFolder.indexOf(item) < 0)
            bFolder.push(item);
        }
      });
    });
  }
  else {
    // step 3: get meta dict
    var dMeta, sCfgFile = path.join(sTargDir,'.meta.json');
    if (fs.existsSync(sCfgFile)) {
      var dCfg = {};
      try {
        var sCfg = fs.readFileSync(sCfgFile,'utf-8'), dTmp = JSON.parse(sCfg);
        if (typeof dTmp == 'object') dCfg = dTmp;
      }
      catch(e) { }
      dMeta = Object.assign({},metaDict,dCfg);
    }
    else dMeta = Object.assign({},metaDict);
    
    // step 4: scan folders, files, and templates
    var bFileList = fs.readdirSync(sTargDir);
    bFileList.forEach( function(item) {
      if (item[0] == '.') return;  // ignore:  .  ..  .XXX
      
      var st = fs.lstatSync(path.join(sTargDir,item));
      if (st.isFile()) {  // [sName,sMeta,sImgUrl]
        var d, bExt = item.split('.'), sExt = bExt.length >= 2? bExt.pop(): '', isJsonSvg = false;
        if (sExt) {
          sExt = sExt.toLowerCase();
          if (sExt == 'svg' && bExt.length >= 2 && bExt.pop() == 'json')
            isJsonSvg = true;
          d = dMeta[sExt] || unknownMeta;
        }
        else d = unknownMeta;
        
        if (isJsonSvg) {
          bTemplate.push(item);
          return;
        }
        else if (d.meta.indexOf('image/') == 0) {
          if (fs.existsSync(path.join(sTargDir,item+'.json'))) {
            bTemplate.push(item);
            return;
          }
        }
        
        bFile.push([item,d.meta,d.icon]);
      }
      else bFolder.push(item);
    });
    bTemplate.forEach( function(item) { // remove template.png.json from bFile
      var iPos = bFile.findIndex( function(item2) { return item2[0] === item+'.json'; } );
      if (iPos >= 0) bFile.splice(iPos,1);
    });
  }
  var dRet = {
    title:path.basename(sUrl), path:sUrl, atTop:atTop,
    folders:bFolder, files:bFile, templates:bTemplate,
  };
  
  // step 5: sort by name
  bFolder.sort();
  bFile.sort(function(a,b) { return a[0] > b[0]? 1: (a[0] == b[0]? 0: -1); });
  bTemplate.sort();
  
  res.json(dRet);
},'1.0','rewgt'];  // version='1.0', vendor='rewgt'

};
