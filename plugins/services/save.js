// static head of plugin source
//-----------------------------
var path = require('path'),
    main = require(path.join(__dirname,'../main'));

var M = exports = module.exports = main.modules['services/save.js'];

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

var sContentFlagA = '<!-- BEGIN OF CONTAINER, DO NOT CHANGE THIS LINE. -->';
var sContentFlagB = '<!-- END OF CONTAINER, DO NOT CHANGE THIS LINE. -->';

main.pluginServices['$save'] = [function(req,res,sCateProj,sServPath) { // sCateProj: $$cate/project, sServPath: $service/...
  var dBody = req.body;
  if (req.method == 'POST' && typeof dBody == 'object' && typeof dBody.page == 'string') {
    var sBody = dBody.html || '';
    var sPage = dBody.page || 'index.html';
    
    var sFile = path.join(config.STATIC_DIR,sCateProj,sPage);
    if (!fs.existsSync(sFile)) {
      sFile = path.join(config.USER_DIR,sCateProj,sPage);
      if (!fs.existsSync(sFile))
        sFile = '';
    }
    
    var sErr = '';
    if (!sBody)
      sErr = 'invalid HTML content';
    else if (!sFile)
      sErr = 'can not find file (' + path.join(sCateProj,sPage) + ')';
    else {
      var sHtml = fs.readFileSync(sFile,'utf-8');
      if (config.backupHTML) {
        try {
          fs.writeFileSync(sFile+'.bak',sHtml,'utf-8');
        }
        catch(e) { } // ignore when failed
      }
      
      try {
        var sHead = dBody.head || '';
        if (sHead && typeof sHead == 'string') {  // try replace head segment
          var idxA = sHtml.search(/<head>/gi), idxB = sHtml.search(/<\/head>/gi);
          if (idxA >= 0 && idxB > idxA)
            sHtml = sHtml.slice(0,idxA) + '<head>\n' + sHead + (sHead.slice(-1) == '\n'?'':'\n') + sHtml.slice(idxB);
        }
        
        var iPosA = sHtml.indexOf(sContentFlagA), iPosB = -1;
        if (iPosA > 0) {
          iPosB = sHtml.indexOf(sContentFlagB,iPosA);        
          if (iPosB > 0) {  // iPosA must large than 0
            var bDepend = null, sDepend = dBody.depend || '';
            if (sDepend) {
              try {
                bDepend = JSON.parse(sDepend);
                if (!Array.isArray(bDepend)) bDepend = null;
              }
              catch(e) {
                console.log('invalid JSON (depend) for command: $save');
              }
            }
            
            sDepend = '';
            if (bDepend) {
              bDepend.forEach( function(item) {
                var sType = item[0], sSrc = item[1], sId = item[2] || '';
                if (sId) sId = ' id="' + sId + '"';
                if (sType == 'css')
                  sDepend += '<link rel="stylesheet"' + sId + ' href="' + sSrc + '" />\n';
                else if (sType == 'shared-css')
                  sDepend += '<link rel="stylesheet"' + sId + ' shared="true" href="' + sSrc + '" />\n';
                else if (sType == 'js')
                  sDepend += '<script' + sId + ' src="' + sSrc + '"></script>\n';
                else if (sType == 'inline-js')
                  sDepend += '<script' + sId + '>\n' + sSrc + '\n</script>\n';
              });
            }
            if (sDepend) sDepend = '<div id="react-resource">\n' + sDepend + '</div>\n';
            
            var sNewBody = '\n<div id="react-container" style="visibility:hidden; position:absolute; left:0px; top:0px">\n' + sBody + '</div>\n' + sDepend;
            sHtml = sHtml.slice(0,iPosA + sContentFlagA.length) + sNewBody + sHtml.slice(iPosB);
            fs.writeFileSync(sFile,sHtml,'utf-8');
          }
        }
        if (iPosB < 0) sErr = 'invalid history HTML content';
      }
      catch(e) {
        sErr = 'save file failed (' + path.join(sCateProj,sPage) + ')';
      }
    }
    
    if (sErr)
      res.status(400).send(sErr);
    else res.send('OK');
    return;
  }
  res.status(400).send('Bad request');
},'1.0','rewgt'];  // version='1.0', vendor='rewgt'

};
