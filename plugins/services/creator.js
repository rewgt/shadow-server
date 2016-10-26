// static head of plugin source
//-----------------------------
var path = require('path'),
    main = require(path.join(__dirname,'../main'));

var M = exports = module.exports = main.modules['services/creator.js'];

// import modules
//---------------
var fs = require('fs');

// module global definition
//-------------------------

// onload() will be called for every online-update
//------------------------------------------------
M.onload = function(app) {

var is_in_develop_ = app.get('env') === 'development';
var config = main.config;  // trunk.js loaded before all plugin module, main.config must be ready

main.pluginServices['$creator'] = [function(req,res,sCateProj,sServPath) { // sCateProj: $$cate/project, sServPath: $service/...
  if (req.method != 'GET') {
    res.status(400).send('Bad request');
    return;
  }
  
  var sPage = req.query.page || 'index.html';
  var sFile, sDir = path.join(config.STATIC_DIR,sCateProj);
  if (fs.existsSync(sDir))
    sFile = path.join(config.STATIC_DIR,sCateProj,sPage);
  else sFile = path.join(config.USER_DIR,sCateProj,sPage);
  
  if (fs.existsSync(sFile)) {
    var content = null;
    try {
      content = fs.readFileSync(sFile,'utf-8');
    }
    catch(e) { console.log('read file (' + sFile + ') failed.'); }
    
    if (content !== null) {
      var sEndTag = '<!-- END OF CONTAINER, DO NOT CHANGE THIS LINE. -->';
      var iPos = content.indexOf(sEndTag);
      if (iPos > 0) {
        var bSeg = [content.slice(0,iPos + sEndTag.length),'',content.slice(iPos + sEndTag.length)];
        bSeg[1] = '<script>(function(node){if (node) {node.setAttribute("__design__","1"); node.setAttribute("__debug__","1");}})(document.getElementById("react-container"))</script>\n' +
          '<script src="/app/files/rewgt/web/js/creator_base.js"></script>\n' +
          '<script src="/app/files/rewgt/web/js/online_design.js"></script>';
        content = bSeg.join('\n');
      }
      var fNow = new Date(), fTill = new Date(fNow.valueOf()+(is_in_develop_?60000:600000));
      res.set('Date',fNow.toUTCString()).set('Expires',fTill.toUTCString())
         .set('Content-Type','text/html; charset=utf-8').send(content);
      return;
    }
  }
  
  res.status(404).send('can not find file: ' + path.join(sCateProj,sPage));
},'1.0','rewgt'];  // version='1.0', vendor='rewgt'

};
