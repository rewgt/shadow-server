// static head of plugin source
//-----------------------------
var path = require('path'),
    main = require(path.join(__dirname,'main'));

var M = exports = module.exports = main.modules['trunk.js'];

// import modules
//---------------
var fs = require('fs'); // var crypto = require('crypto');

// module global definition
//-------------------------
var re_decode64_ = /[^A-Za-z0-9\+\/\=]/g;
var base64Key_   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

var Base64 = {   // only for utf-8 text
  encode: function(input) {
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var output = '', i = 0;
    
    input = Base64._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2))
        enc3 = enc4 = 64;
      else if (isNaN(chr3))
        enc4 = 64;
      output = output + base64Key_.charAt(enc1) + base64Key_.charAt(enc2) +
               base64Key_.charAt(enc3) + base64Key_.charAt(enc4);
    }

    return output;
  },

  decode: function(input) {
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var output = '', i = 0;
    
    input = input.replace(re_decode64_,'');
    while (i < input.length) {
      enc1 = base64Key_.indexOf(input.charAt(i++));
      enc2 = base64Key_.indexOf(input.charAt(i++));
      enc3 = base64Key_.indexOf(input.charAt(i++));
      enc4 = base64Key_.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);
      if (enc3 != 64)
        output = output + String.fromCharCode(chr2);
      if (enc4 != 64)
        output = output + String.fromCharCode(chr3);
    }
    
    output = Base64._utf8_decode(output);
    return output;
  },

  _utf8_encode: function(string) {
    // string = string.replace(/\r\n/g,'\n');  // not replace win32 \r\n
    
    var utftext = '';
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128)
        utftext += String.fromCharCode(c);
      else if(c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  },

  _utf8_decode: function(utftext) {
    var c,c2,c3, i = 0, string = '';
    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
};

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

var TYPE_OF_MIME = {
  "3gp" : "video/3gpp",
  "a" : "application/octet-stream",
  "ai" : "application/postscript",
  "aif" : "audio/x-aiff",
  "aiff" : "audio/x-aiff",
  "asc" : "application/pgp-signature",
  "asf" : "video/x-ms-asf",
  "asm" : "text/x-asm",
  "asx" : "video/x-ms-asf",
  "atom" : "application/atom+xml",
  "au" : "audio/basic",
  "avi" : "video/x-msvideo",
  "bat" : "application/x-msdownload",
  "bin" : "application/octet-stream",
  "bmp" : "image/bmp",
  "bz2" : "application/x-bzip2",
  "c" : "text/x-c",
  "cab" : "application/vnd.ms-cab-compressed",
  "cc" : "text/x-c",
  "chm" : "application/vnd.ms-htmlhelp",
  "class" : "application/octet-stream",
  "com" : "application/x-msdownload",
  "conf" : "text/plain",
  "cpp" : "text/x-c",
  "crt" : "application/x-x509-ca-cert",
  "css" : "text/css",
  "csv" : "text/csv",
  "cxx" : "text/x-c",
  "deb" : "application/x-debian-package",
  "der" : "application/x-x509-ca-cert",
  "diff" : "text/x-diff",
  "djv" : "image/vnd.djvu",
  "djvu" : "image/vnd.djvu",
  "dll" : "application/x-msdownload",
  "dmg" : "application/octet-stream",
  "doc" : "application/msword",
  "dot" : "application/msword",
  "dtd" : "application/xml-dtd",
  "dvi" : "application/x-dvi",
  "ear" : "application/java-archive",
  "eml" : "message/rfc822",
  "eps" : "application/postscript",
  "exe" : "application/octet-stream",
  "f" : "text/x-fortran",
  "f77" : "text/x-fortran",
  "f90" : "text/x-fortran",
  "flv" : "video/x-flv",
  "for" : "text/x-fortran",
  "gem" : "application/octet-stream",
  "gemspec" : "text/x-script.ruby",
  "gif" : "image/gif",
  "gz" : "application/x-gzip",
  "h" : "text/x-c",
  "hh" : "text/x-c",
  "htm" : "text/html",
  "html" : "text/html",
  "ico" : "image/x-icon",
  "ics" : "text/calendar",
  "ifb" : "text/calendar",
  "iso" : "application/octet-stream",
  "jar" : "application/java-archive",
  "java" : "text/x-java-source",
  "jnlp" : "application/x-java-jnlp-file",
  "jpeg" : "image/jpeg",
  "jpg" : "image/jpeg",
  "js" : "application/javascript",
  "json" : "application/json",
  "log" : "text/plain",
  "m3u" : "audio/x-mpegurl",
  "m4v" : "video/mp4",
  "man" : "text/troff",
  "mathml" : "application/mathml+xml",
  "mbox" : "application/mbox",
  "mdoc" : "text/troff",
  "me" : "text/troff",
  "mid" : "audio/midi",
  "midi" : "audio/midi",
  "mime" : "message/rfc822",
  "mml" : "application/mathml+xml",
  "mng" : "video/x-mng",
  "mov" : "video/quicktime",
  "mp3" : "audio/mpeg",
  "mp4" : "video/mp4",
  "mp4v" : "video/mp4",
  "mpeg" : "video/mpeg",
  "mpg" : "video/mpeg",
  "ms" : "text/troff",
  "msi" : "application/x-msdownload",
  "odp" : "application/vnd.oasis.opendocument.presentation",
  "ods" : "application/vnd.oasis.opendocument.spreadsheet",
  "odt" : "application/vnd.oasis.opendocument.text",
  "ogg" : "application/ogg",
  "p" : "text/x-pascal",
  "pas" : "text/x-pascal",
  "pbm" : "image/x-portable-bitmap",
  "pdf" : "application/pdf",
  "pem" : "application/x-x509-ca-cert",
  "pgm" : "image/x-portable-graymap",
  "pgp" : "application/pgp-encrypted",
  "pkg" : "application/octet-stream",
  "pl" : "text/x-script.perl",
  "pm" : "text/x-script.perl-module",
  "png" : "image/png",
  "pnm" : "image/x-portable-anymap",
  "ppm" : "image/x-portable-pixmap",
  "pps" : "application/vnd.ms-powerpoint",
  "ppt" : "application/vnd.ms-powerpoint",
  "ps" : "application/postscript",
  "psd" : "image/vnd.adobe.photoshop",
  "py" : "text/x-script.python",
  "qt" : "video/quicktime",
  "ra" : "audio/x-pn-realaudio",
  "rake" : "text/x-script.ruby",
  "ram" : "audio/x-pn-realaudio",
  "rar" : "application/x-rar-compressed",
  "rb" : "text/x-script.ruby",
  "rdf" : "application/rdf+xml",
  "roff" : "text/troff",
  "rpm" : "application/x-redhat-package-manager",
  "rss" : "application/rss+xml",
  "rtf" : "application/rtf",
  "ru" : "text/x-script.ruby",
  "s" : "text/x-asm",
  "sgm" : "text/sgml",
  "sgml" : "text/sgml",
  "sh" : "application/x-sh",
  "sig" : "application/pgp-signature",
  "snd" : "audio/basic",
  "so" : "application/octet-stream",
  "svg" : "image/svg+xml",
  "svgz" : "image/svg+xml",
  "swf" : "application/x-shockwave-flash",
  "t" : "text/troff",
  "tar" : "application/x-tar",
  "tbz" : "application/x-bzip-compressed-tar",
  "tcl" : "application/x-tcl",
  "tex" : "application/x-tex",
  "texi" : "application/x-texinfo",
  "texinfo" : "application/x-texinfo",
  "text" : "text/plain",
  "tif" : "image/tiff",
  "tiff" : "image/tiff",
  "torrent" : "application/x-bittorrent",
  "tr" : "text/troff",
  "txt" : "text/plain",
  "vcf" : "text/x-vcard",
  "vcs" : "text/x-vcalendar",
  "vrml" : "model/vrml",
  "war" : "application/java-archive",
  "wav" : "audio/x-wav",
  "wma" : "audio/x-ms-wma",
  "wmv" : "video/x-ms-wmv",
  "wmx" : "video/x-ms-wmx",
  "wrl" : "model/vrml",
  "wsdl" : "application/wsdl+xml",
  "xbm" : "image/x-xbitmap",
  "xhtml" : "application/xhtml+xml",
  "xls" : "application/vnd.ms-excel",
  "xml" : "text/xml",
  "xpm" : "image/x-xpixmap",
  "xsl" : "application/xml",
  "xslt" : "application/xslt+xml",
  "yaml" : "text/yaml",
  "yml" : "text/yaml",
  "zip" : "application/zip"
};

var config = main.config = {};
config.APP_DIR  = path.dirname(__dirname);
config.USER_DIR = path.dirname(config.APP_DIR);
config.USER_PATH = path.join(config.USER_DIR,'/');
config.STATIC_DIR = path.join(config.APP_DIR,'public/static');
config.FILES_DIR  = path.join(config.STATIC_DIR,'files');

(function() {
  var cfgFile = path.join(config.FILES_DIR,'rewgt/config/config.json');
  if (fs.existsSync(cfgFile)) {
    try {
      var d = JSON.parse(fs.readFileSync(cfgFile,'utf-8'));
      if (typeof d == 'object')
        Object.assign(config,d);
    }
    catch(e) {
      console.log('warning: load rewgt/config/config.json failed');
    }
  }
})();

var utils = main.utils = main.utils || {};
utils.Base64 = Base64;

utils.scanCategory = function(sCatePrjPath) { // sCatePrjPath muse lead by '/'
  var sCate = '', b = sCatePrjPath.split('/$$'), iLen = b.length;
  for (var i=0; i < iLen; i++) {
    var item = b[i];
    if (i == 0) {
      if (item)
        return ['',sCatePrjPath.slice(1)];
      // else, wait continue
    }
    else {
      var iPos = item.indexOf('/');
      if (iPos == -1)
        sCate += '$$' + item + '/';  // wait continue
      else {
        sCate += '$$' + item.slice(0,iPos+1);
        
        i += 1;
        var sLeft = i >= iLen?'':'/$$' + b.slice(i).join('/$$');
        return [sCate,item.slice(iPos+1) + sLeft];
      }
    }
  }
  return null;
};

var pluginServices = main.pluginServices = main.pluginServices || {};

// onload() will be called for every online-update
//------------------------------------------------
M.onload = function(app) {

var is_in_develop_ = app.get('env') === 'development';

var rootRouter = main.routers[0][1];

rootRouter.regist('GET',['/','/index.html'], function(req,res,next) {
  var sFile = path.join(config.FILES_DIR,'rewgt/homepage.html');
  if (!fs.existsSync(sFile)) {
    res.status(404).send('can not find file: homepage.html');
    return;
  }
  
  res.set('Content-Type','text/html').send(fs.readFileSync(sFile));
});

main.returnStaticFile = function(sFile,res) {  // sFile must exists
  var stat = fs.lstatSync(sFile);
  if (stat.isFile() && !stat.isSymbolicLink()) {
    var ext = path.extname(sFile);
    ext = ext? ext.slice(1).toLowerCase(): 'unknown';
    var content = null, contentType = TYPE_OF_MIME[ext] || 'application/octet-stream';
    try {
      content = fs.readFileSync(sFile);  // readFileSync() return Buffer
    }
    catch(e) { console.log('read file (' + sFile + ') failed.'); }
    
    if (content !== null) {
      var fNow = new Date(), fTill = new Date(fNow.valueOf()+(is_in_develop_?60000:600000));
      res.set('Date',fNow.toUTCString()).set('Expires',fTill.toUTCString())
         .set('Content-Type',contentType).send(content);
      return true;
    }
  }
  return false;
};

function handleService(req,res,b,rmvVerSeg) {
  var sTail = b[1], iPos2 = sTail.indexOf('/');
  if (iPos2 > 0) {
    var sProjSeg = sTail.slice(0,iPos2);
    if (rmvVerSeg) {
      var iPos3 = sTail.indexOf('/',iPos2+1);
      if (iPos3 > 0) {
        if (sTail[iPos3+1] == '$') {
          var sTailSeg = sTail.slice(iPos3+1), iPos4 = sTailSeg.indexOf('/');
          var sService = iPos4 > 0? sTailSeg.slice(0,iPos4): sTailSeg;  // $xxx
          
          var bInfo = pluginServices[sService];
          if (bInfo) {  // [callback,sVer,sVendor]
            bInfo[0](req,res,b[0] + sProjSeg,sTailSeg);
            return '';  // has process
          }
        }
        return b[0] + sProjSeg + sTail.slice(iPos3);
      }
    }
    else {
      if (sTail[iPos2+1] == '$') {
        var sTailSeg = sTail.slice(iPos2+1), iPos4 = sTailSeg.indexOf('/');
        var sService = iPos4 > 0? sTailSeg.slice(0,iPos4): sTailSeg;  // $xxx
        
        var bInfo = pluginServices[sService];
        if (bInfo) {  // [callback,sVer,sVendor]
          bInfo[0](req,res,b[0] + sProjSeg,sTailSeg);
          return '';  // has process
        }
      }
      return b[0] + b[1];
    }
  }
  return null;  // failed
}

rootRouter.regist('POST','/:project/*', function(req,res,next) {  // only support service
  var sProj = req.params.project, sPath = req.params[0] || '';
  
  if (sProj == 'app') {
    var iPos = sPath.indexOf('/');
    if (iPos > 0) {
      sPath = sPath.slice(iPos);    // ignore user segment: /app/user/cate_proj/version/...
      var b = utils.scanCategory(sPath);  // sPath: /cate_proj/ver/file
      if (b) {
        var sPath2 = handleService(req,res,b,true);
        if (sPath2 !== null) {  // available format
          if (!sPath2) return;  // '' means success handle service
        }
      }
    }
  }
  else {
    if ((sProj[0] == '$' && sProj[1] == '$') || sPath[0] == '$') {
      var b = utils.scanCategory('/'+sProj+'/'+sPath);  // sPath: /cate_proj/file
      if (b) {
        var sPath2 = handleService(req,res,b,false);
        if (sPath2 !== null) { // available format
          if (!sPath2) return; // '' means success handle service
        }
      }
    }
  }
  
  res.status(400).send('Bad request');
});

function handleGitRequest(sMethod,sPath,req,res) {
  var bPath = sPath.split('/'), sOwner = bPath.shift(), sRepo = bPath.shift(), sCmdType = bPath.shift();
  if (bPath.length > 0 && !bPath[bPath.length-1]) bPath.pop();  // remove tail '/'
  var sLeftPath = bPath.join('/');
  
  if (sMethod == 'GET') {
    if (sCmdType === 'contents') {
      var sFile = path.join(config.USER_DIR,sRepo,sLeftPath); // sLeftPath maybe ''
      var isExist = fs.existsSync(sFile), safeInRoot = sFile.indexOf(config.USER_PATH) == 0;
      if (isExist && safeInRoot) {
        var st = fs.lstatSync(sFile);
        if (st.isDirectory()) {
          var bRet = [];
          fs.readdirSync(sFile).forEach( function(item) {
            if (item[0] == '.') return;
            
            var sPath2 = path.join(sFile,item), st2 = fs.lstatSync(sPath2);
            if (st2.isDirectory()) {
              bRet.push( { type:'dir', size:0, name:item,
                path:path.join(sLeftPath,item),  // no sha,url,*_url,_links
              });
            }
            else {
              bRet.push( { type:'file', size:st2.size, name:item,
                path:path.join(sLeftPath,item),  // no sha,url,*_url,_links
                ctime: st2.ctime.toISOString(),  // new added
                mtime: st2.mtime.toISOString(),  // new added
              });
            }
          });
          res.json(bRet);
        }
        else {
          var sFileName = bPath.length > 0? bPath[bPath.length-1]: '';
          var sContent = fs.readFileSync(sFile,'utf-8');
          // var shaSum = crypto.createHash('sha1');
          // shaSum.update('blob ' + sContent.length + '\0');
          // shaSum.update(sContent);
          // var sSha = shaSum.digest('hex'),
          
          res.json( { type:'file', size:st.size, name:sFileName,
            path: sLeftPath,  // no encoding,url,*_url,_links
            content: Base64.encode(sContent),
          });
        }
        return;
      }
      else if (!isExist && safeInRoot) {
        var sUpPath, iTmp = sFile.lastIndexOf('/');
        if (iTmp > 0 && fs.existsSync(sUpPath=sFile.slice(0,iTmp))) {
          var st = fs.lstatSync(sUpPath);
          if (st.isDirectory()) {  // maybe meet new created folder
            res.json([]);
            return;
          }
        }
      }
      
      res.status(404).send('can not find file: /' + sRepo + '/' + sLeftPath);
      return;
    }
  }
  else if (sMethod == 'PUT') {
    if (sCmdType === 'contents') {
      if (sRepo && sLeftPath) {
        var dBody = req.body;
        var sRepoPath = path.join(config.USER_DIR,sRepo);
        var sFile = path.join(sRepoPath,sLeftPath);
        if ( fs.existsSync(sRepoPath) && typeof dBody == 'object' && 
             typeof dBody.content == 'string' && sFile.indexOf(sRepoPath+'/') == 0) {
          var srcBuff = new Buffer(dBody.content,'base64');
          var bSeg = sLeftPath.split('/'), sFileName = bSeg.pop();
          if (bSeg.length) recursiveMkDir(sRepoPath,bSeg.join('/'));
          
          fs.writeFileSync(sFile,srcBuff);
          
          // var shaSum = crypto.createHash('sha1');
          // shaSum.update('blob ' + srcBuff.length + '\0');
          // shaSum.update(srcBuff);
          // var sSha = shaSum.digest('hex');
          
          var st = fs.lstatSync(sFile);
          var dRet = { content:{ name:sFileName, path:sLeftPath,
            type:'file', size:srcBuff.length,  // no url,*_url,_links
            ctime:st.ctime.toISOString(), mtime:st.mtime.toISOString(),
          }};
          res.json(dRet);
          return;
        }
      }
    }
  }
  else if (sMethod == 'DELETE') {
    if (sCmdType === 'contents') {
      
      if (sRepo && sLeftPath) {
        var sFile = path.join(config.USER_DIR,sRepo,sLeftPath);
        if (fs.existsSync(sFile) && sFile.indexOf(path.join(config.USER_DIR,sRepo,'/')) == 0)
          fs.unlinkSync(sFile);
        
        res.json({content:null});
        return;
      }
    }
  }
  
  res.status(400).send('Bad request');
}

rootRouter.regist('PUT','/:project/*', function(req,res,next) {  // only support service
  var sProj = req.params.project, sPath = req.params[0] || '';
  
  if (sProj == 'repos') {    // github like API
    handleGitRequest('PUT',sPath,req,res)
    return;
  }
  
  res.status(400).send('Bad request');
});

rootRouter.regist('DELETE','/:project/*', function(req,res,next) {  // only support service
  var sProj = req.params.project, sPath = req.params[0] || '';
  
  if (sProj == 'repos') {    // github like API
    handleGitRequest('DELETE',sPath,req,res)
    return;
  }
  
  res.status(400).send('Bad request');
});

rootRouter.regist('GET','/:project/*', function(req,res,next) {
  var sProj = req.params.project, sPath = req.params[0] || '', sFile = '';
  
  if (is_in_develop_ && sProj == 'develop') { // app.get('/develop/...') is override
    next();
    return;
  }
  
  if (sProj == 'repos') {    // github like API
    handleGitRequest('GET',sPath,req,res)
    return;
  }
  
  var savedSeg = '';
  if (sProj == 'app') {
    var iPos = sPath.indexOf('/');
    if (iPos > 0) {          // /app/files/proj/...
      if (sPath.slice(0,iPos) == 'files') { // take as static file for 'GET' method
        var b = sPath.split('/');
        if (b[2] == 'web') { // ['files',proj,'web',...]
          b.splice(2,1);     // remove 'web'
          sFile = path.join(config.STATIC_DIR,b.join('/'));
        }
      }
      else {
        savedSeg = sPath.slice(0,iPos);     // record for log error
        sPath = sPath.slice(iPos); // ignore user segment: /app/user/cate_proj/version/...
        var b = utils.scanCategory(sPath);  // sPath: /cate_proj/ver/file
        if (b) {
          var sPath2 = handleService(req,res,b,true);
          if (sPath2 !== null) {   // available format
            if (!sPath2) return;   // '' means success handle service
            var sDir = path.join(config.STATIC_DIR,b[0] || b[1].split('/').shift());
            if (fs.existsSync(sDir))
              sFile = path.join(config.STATIC_DIR,sPath2);
            else sFile = path.join(config.USER_DIR,sPath2);
          }
        }
      }
    }
  }
  else {
    if ((sProj[0] == '$' && sProj[1] == '$') || sPath[0] == '$') {
      var b = utils.scanCategory('/'+sProj+'/'+sPath);  // sPath: /cate_proj/file
      if (b) {
        var sPath2 = handleService(req,res,b,false);
        if (sPath2 !== null) { // available format
          if (!sPath2) return; // '' means success handle service
          var sDir = path.join(config.STATIC_DIR,b[0] || b[1].split('/').shift());
          if (fs.existsSync(sDir))
            sFile = path.join(config.STATIC_DIR,sPath2);
          else sFile = path.join(config.USER_DIR,sPath2)
        }
      }
    }
    else {
      var sDir = path.join(config.STATIC_DIR,sProj);
      if (fs.existsSync(sDir))
        sFile = path.join(sDir,sPath || '/');
      else {
        sDir = path.join(config.USER_DIR,sProj)
        if (fs.existsSync(sDir))
          sFile = path.join(sDir,sPath || '/');
      }
    }
  }
  
  if (sFile) {
    if (sFile.slice(-1) == '/')
      sFile += 'index.html';
    if (fs.existsSync(sFile) && sFile.indexOf(config.USER_PATH) == 0 && main.returnStaticFile(sFile,res))
      return;
  }
  res.status(404).send('can not find file: ' + path.join('/',sProj,savedSeg,sPath));
});

};  // end of M.onload()
