// static head of plugin source
//-----------------------------
var path = require('path'),
    main = require(path.join(__dirname,'../main'));

var M = exports = module.exports = main.modules['services/zip_doc.js'];

// import modules
//---------------
var fs = require('fs'),
    archiver = require('archiver');

// module global definition
//-------------------------

// onload() will be called for every online-update
//------------------------------------------------
M.onload = function(app) {

var is_in_develop_ = app.get('env') === 'development';
var config = main.config;

main.pluginServices['$zip_doc'] = [ function(req,res,sCateProj,sServPath) { // sCateProj: $$cate/project, sServPath: $service/...
  var sPath, dBody = req.body;
  if (req.method == 'POST' && typeof dBody == 'object' && typeof (sPath=dBody.path) == 'string') {
    var sBase = config.STATIC_DIR, sFile = path.join(sBase,sCateProj,sPath);
    if (!fs.existsSync(sFile)) {
      sBase = config.USER_DIR;
      sFile = path.join(sBase,sCateProj,sPath);
      if (!fs.existsSync(sFile))
        sFile = '';
    }
    
    if (!sFile) {
      var sErr = 'can not find file (' + path.join(sCateProj,sPath) + ')';
      res.status(400).send(sErr);
    }
    else {
      var txtName = sPath.split('/').pop(), bTmp = txtName.split('.');
      if (bTmp.length > 1) bTmp.pop();
      var sPureName = bTmp.join('.');
      
      var sIdxFile = path.join(sBase,sCateProj,'index.html');
      if (!fs.existsSync(sIdxFile)) {
        var sErr = 'can not find file (' + path.join(sCateProj,'index.html') + ')';
        res.status(400).send(sErr);
      }
      else {
        var output = fs.createWriteStream(path.join(sBase,sCateProj,sPureName+'.zip'));
        var archive = archiver('zip',{zlib:{level:9}});
        
        output.on('close', function() {
          res.send('OK');
        });
        archive.on('error', function(err) {
          res.status(500).send('write zip file failed.');
        });
        archive.pipe(output);
        
        archive.append(fs.createReadStream(sIdxFile),{name:sPureName+'.html'});
        archive.append(fs.createReadStream(sFile),{name:'md/'+sPureName+'.txt'});
        
        var sLibDir = path.join(sBase,sCateProj,'lib');
        if (fs.existsSync(sLibDir)) {
          var st = fs.lstatSync(sLibDir);
          if (st.isDirectory())
            archive.directory(sLibDir,'lib/');
        }
        
        var sResDir = path.join(sBase,sCateProj,'md','res',sPureName);
        if (fs.existsSync(sResDir)) {
          var st = fs.lstatSync(sResDir);
          if (st.isDirectory())
            archive.directory(sResDir,'md/res/'+sPureName+'/');
        }
        
        archive.finalize();
      }
    }
    return;
  }
  
  res.status(400).send('Bad request');
},'1.0','rewgt'];  // version='1.0', vendor='rewgt'

};
