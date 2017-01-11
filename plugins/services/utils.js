// static head of plugin source
//-----------------------------
var path = require('path'),
    main = require(path.join(__dirname,'../main'));

var M = exports = module.exports = main.modules['services/utils.js'];

// import modules
//---------------
var fs = require('fs');

// module global definition
//-------------------------

// onload() will be called for every online-update
//------------------------------------------------
M.onload = function(app) {

var is_in_develop_ = app.get('env') === 'development';
var config = main.config;
var systemSamples = null;

function recursiveMkDir(sBase,sPath) {
  var b = sPath.split('/'), sTarg = sBase;
  while (b.length) {
    var item = b.shift();
    if (item) {
      sTarg = path.join(sTarg,item);
      if (!fs.existsSync(sTarg)) {
        try {
          fs.mkdirSync(sTarg);
        }
        catch(e) { }
      }
    }
  }
}

function locateHtmlTitle(sText) {
  var iPos = sText.search(/\<title\W/);
  if (iPos > 0) {
    var sTail = '</title>', iPos2 = sText.indexOf(sTail,iPos);
    if (iPos2 > iPos) {
      var sTmp = sText.slice(iPos,iPos2);
      var iPos3 = sTmp.lastIndexOf('>');
      if (iPos3 > 0)
        return [sTmp.slice(iPos3+1).trim(),iPos,iPos2+sTail.length];
    }
  }
  return null;
}

function tryScanCateProj(bRet,sDir,sFile,sPrefix) {  // sDir/sFile must be directory, and sFile is $$xxx 
  var sCate = sPrefix + '/' + sFile;
  sDir = path.join(sDir,sFile);
  
  try {
    var b2 = fs.readdirSync(sDir);
    b2.forEach( function(item) {
      if (item[0] == '.') return;
      
      var sSubDir = path.join(sDir,item);
      if (fs.lstatSync(sSubDir).isDirectory()) {
        if (item.slice(0,2) == '$$')
          tryScanCateProj(bRet,sDir,item,sCate);
        else {
          if (fs.existsSync(path.join(sSubDir,'index.html')))
            bRet.push(sCate + '/' + item);
        }
      }
    });
  }
  catch(e) { }  // ignore any failed
}

main.pluginServices['$utils'] = [function(req,res,sCateProj,sServPath) { // sCateProj: $$cate/project, sServPath: $service/...
  var sCmd = req.query.cmd || '';
  if (req.method == 'GET') {
    if (sCmd == 'get_config') {
      res.json( { cacheSize: config.cacheSize, 
        backupHTML: config.backupHTML,
        resourcePages: config.resourcePages,
      });
      return;
    }
    else if (sCmd == 'list_page') {
      var sDir = path.join(config.STATIC_DIR,sCateProj);
      if (!fs.existsSync(sDir)) {
        sDir = path.join(config.USER_DIR,sCateProj);
        if (!fs.existsSync(sDir)) sDir = '';
      }
      if (sDir) {
        var b = fs.readdirSync(sDir), bRet = [];
        b.forEach( function(item) {
          if (item[0] == '.') return;
          var sFile = path.join(sDir,item);
          if (item.split('.').pop() == 'html' && fs.lstatSync(sFile).isFile())
            bRet.push(item);
        });
        res.json(bRet);
        return;
      }
    }
    else if (sCmd == 'list_project') {
      var bDir = [config.STATIC_DIR,config.USER_DIR], bRet = [[],[]];
      bDir.forEach( function(sDir,idx) {
        if (!fs.existsSync(sDir)) return;
        
        var b = fs.readdirSync(sDir), bOut = bRet[idx];
        b.forEach( function(item) {
          if (item[0] == '.') return;
          
          var sPath = path.join(sDir,item), st = fs.lstatSync(sPath);
          if (st.isDirectory()) {
            if (item.slice(0,2) == '$$')
              tryScanCateProj(bOut,sDir,item,'');
            else {
              if (fs.existsSync(path.join(sPath,'index.html')))
                bOut.push('/' + item);
            }
          }
        });
        bOut.sort();
      });
      
      res.json(bRet);
      return;
    }
    else if (sCmd == 'list_template') {
      if (!systemSamples) {
        systemSamples = [];
        var sDir = path.join(config.FILES_DIR,'rewgt/config/pages');
        if (fs.existsSync(sDir) && fs.lstatSync(sDir).isDirectory()) {
          var b = fs.readdirSync(sDir);
          b.forEach( function(item) {
            if (item[0] == '.') return;
            if (item.slice(-5) != '.html') return;
            
            var sFile = path.join(sDir,item);
            var st = fs.lstatSync(sFile);
            if (st.isFile()) {
              try {
                var bInfo = locateHtmlTitle(fs.readFileSync(sFile,'utf-8'));
                if (bInfo) systemSamples.push(['/files/rewgt/config/pages/'+item,bInfo[0]]);
              }
              catch(e) { console.log(e); }
            }
          });
        }
      }
      
      var bHistory = [], bSample = config.historySamples || [];
      bSample.forEach( function(item) {
        var ss = item[0];
        if (systemSamples.findIndex( function(item2) { return item2[0] == ss; } ) < 0)
          bHistory.push(item);
      });
      res.json([systemSamples,bHistory]);
      return;
    }
  }
  else if (req.method == 'POST') {
    var dBody = req.body;
    if (sCmd == 'create_page' && typeof dBody == 'object' && dBody.source && dBody.name) {
      if (dBody.name.slice(-5).toLowerCase() == '.html') {
        var sDir = path.join(config.STATIC_DIR,sCateProj);
        if (!fs.existsSync(sDir)) {
          sDir = path.join(config.USER_DIR,sCateProj);
          if (!fs.existsSync(sDir))
            recursiveMkDir(config.USER_DIR,sCateProj);
        }
        
        var sSrcFile, sTarFile = path.join(sDir,dBody.name), sSrcSample = dBody.source || '';
        if (sSrcSample && sSrcSample[0] != '/') sSrcSample = '/' + sSrcSample;
        
        if (sSrcSample.indexOf('/files/') == 0)
          sSrcFile = path.join(config.FILES_DIR,sSrcSample.slice(7));
        else {
          sSrcFile = path.join(config.STATIC_DIR,sSrcSample);
          if (!fs.existsSync(sSrcFile))
            sSrcFile = path.join(config.USER_DIR,sSrcSample);
        }
        if (sSrcFile && fs.existsSync(sSrcFile)) {
          var stat = fs.lstatSync(sSrcFile);
          if (!stat.isFile() || stat.isSymbolicLink())
            sSrcFile = '';
        }
        else sSrcFile = '';
        if (!sSrcFile) {
          console.log('error: create page (' + dBody.name + ') failed: invalid template (' + sSrcSample + ')');
          res.status(400).send('create page failed');
          return;
        }
        
        var succ = false, sSrcTitle = '';
        try {
          var sSrcHtml = fs.readFileSync(sSrcFile,'utf-8');
          var bInfo = locateHtmlTitle(sSrcHtml);
          if (bInfo) {
            var sHead = dBody.head || '';
            if (sHead && sHead.slice(-1) != '\n') sHead += '\n';
            var sTarHtml = sSrcHtml.slice(0,bInfo[1]) + sHead + sSrcHtml.slice(bInfo[2]);
            fs.writeFileSync(sTarFile,sTarHtml,'utf-8');
            sSrcTitle = bInfo[0];
            succ = true;
          }
        }
        catch(e) {
          console.log('error: create page (' + dBody.name + ') from template (' + sSrcSample + ') failed!');
          console.log(e);
        }
        
        if (succ)
          res.json({result:'OK'});
        else res.status(400).send('create page failed');
        
        if (succ) {
          var bSample = config.historySamples || [];
          var iPos = bSample.findIndex( function(item) {return item[0] == sSrcSample;} );
          if (iPos != 0) {
            if (iPos > 0) bSample.splice(iPos,1);
            bSample.unshift([sSrcSample,sSrcTitle]);
            if (bSample.length > 8) bSample.splice(8,65535); // max hold 8 history items
            
            setTimeout( function() {  // save config in next tick
              var dNewCfg = {
                cacheSize: config.cacheSize || 5,
                backupHTML: config.backupHTML === undefined? true: config.backupHTML,
                resourcePages: config.resourcePages || [],
                historySamples: bSample,
              };
              config.historySamples = bSample; // config save more things than dNewCfg, such as APP_DIR, USER_DIR
              
              var cfgFile = path.join(config.FILES_DIR,'rewgt/config/config.json');
              try {
                fs.writeFileSync(cfgFile,JSON.stringify(dNewCfg),'utf-8');
              }
              catch(e) {
                console.log('warning: save rewgt/config/config.json failed');
              }
            },0);
          }
        }
        return;
      }
    }
    else if (sCmd == 'del_history' && typeof dBody == 'object' && dBody.source) {
      var bNewHist = config.historySamples;
      if (Array.isArray(bNewHist)) {
        var iPos = bNewHist.findIndex( function(item) {
          return item[0] === dBody.source;
        });
        if (iPos >= 0) bNewHist.splice(iPos,1);
      }
      else bNewHist = config.historySamples = [];
      
      var dNewCfg = {  // re-assign, avoid saving unknown key
        cacheSize:  config.cacheSize || 5,
        backupHTML: !!config.backupHTML,
        resourcePages: config.resourcePages || [],
        historySamples: bNewHist,
      };
      
      var succ = false;
      Object.assign(config,dNewCfg);
      var cfgFile = path.join(config.FILES_DIR,'rewgt/config/config.json');
      try {
        fs.writeFileSync(cfgFile,JSON.stringify(dNewCfg),'utf-8');
        succ = true;
      }
      catch(e) {
        console.log('warning: save rewgt/config/config.json failed');
      }
      if (succ) {
        res.json({result:'OK'});
        return;
      }
    }
    else if (sCmd == 'save_config' && typeof dBody == 'object' && dBody.resourcePages) {
      var dNewCfg = {  // re-assign, avoid saving unknown key
        cacheSize:  dBody.cacheSize || 5,
        backupHTML: !!dBody.backupHTML,
        resourcePages: Array.isArray(dBody.resourcePages)? dBody.resourcePages: [],
        historySamples: config.historySamples || [],
      };
      
      var succ = false;
      Object.assign(config,dNewCfg);
      var cfgFile = path.join(config.FILES_DIR,'rewgt/config/config.json');
      try {
        fs.writeFileSync(cfgFile,JSON.stringify(dNewCfg),'utf-8');
        succ = true;
      }
      catch(e) {
        console.log('warning: save rewgt/config/config.json failed');
      }
      if (succ) {
        res.json({result:'OK'});
        return;
      }
    }
  }
  res.status(400).send('Bad request');
},'1.0','rewgt'];  // version='1.0', vendor='rewgt'

};
