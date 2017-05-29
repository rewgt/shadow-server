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

function adjustMetaText(s) {
  return s.replace(/[\r\n]+/gm,'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');  // "
}

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
      
      var sIdxFile = path.join(sBase,sCateProj,'lib','show_doc.html');
      if (!fs.existsSync(sIdxFile)) {
        var sErr = 'can not find file (' + path.join(sCateProj,'lib','show_doc.html') + ')';
        res.status(400).send(sErr);
      }
      else {
        var htmlText = fs.readFileSync(sIdxFile,'utf-8');
        var markText = fs.readFileSync(sFile,'utf-8');
        var iPos = htmlText.indexOf('<body>');
        if (iPos < 0) {
          res.status(400).send('invalid file (lib/show_doc.html)');
          return;
        }
        
        var headPart = htmlText.slice(0,iPos), tailPart = htmlText.slice(iPos+6);
        var docTitle = dBody.title || '', docDesc = dBody.desc || '', docKey = dBody.keyword || '';
        if (docTitle || docDesc || docKey) {
          var i1 = headPart.indexOf('<title>'), i2 = headPart.indexOf('</title>');
          if (i1 > 0 && i2 > i1) {
            if (!docTitle) docTitle = 'Blog';
            headPart = headPart.slice(0,i1+7) + adjustMetaText(docTitle) + '</title>' + 
              (docDesc?'\n<meta name="description" content="'+adjustMetaText(docDesc)+'">':'') + 
              (docKey?'\n<meta name="keywords" content="'+adjustMetaText(docKey)+'">':'') + 
              headPart.slice(i2+8);
          }
        }
        
        htmlText = headPart + 
          '<body>\n\n<pre id="pinp-mrkdn" style="display:none"><code>' +
          markText + (markText.slice(-1) === '\n'?'':'\n') + 
          '</code></pre>' + tailPart;
        
        var output = fs.createWriteStream(path.join(sBase,sCateProj,sPureName+'.zip'));
        var archive = archiver('zip',{zlib:{level:9}});
        
        output.on('close', function() {
          res.send('OK');
        });
        archive.on('error', function(err) {
          res.status(500).send('write zip file failed.');
        });
        archive.pipe(output);
        
        archive.append(htmlText,{name:sPureName+'.html'});
        // archive.append(fs.createReadStream(sFile),{name:'md/'+sPureName+'.txt'});
        
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
