var path = require('path'),
    fs = require('fs'),
    express = require('express');

var app = express();

// setup configure: strict routing, view engine
//---------------------------------------------
app.set('strict routing', true);   // let '/users' not same to '/users/'
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// install middleware
//-------------------
var isDevEnv = app.get('env') === 'development';

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var main = require('./plugins/main');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (isDevEnv) app.use(logger('dev'));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended:true,limit:'50mb'})); // true means use qs library, "user[email]=foo&user[password]=bar" is supported
app.use(cookieParser());

app.use(express.static(path.join(__dirname,'public'),{
  etag: true,
  lastModified: true,
  maxAge: isDevEnv?'1m':'10m',  // 1 minute when in develop, otherwise 10 miniutes
  setHeaders: function(res, path, stat) {
    var fNow = new Date(), fTill = new Date(fNow.valueOf()+(isDevEnv?60000:600000));
    res.set('Date', fNow.toUTCString());
    res.set('Expires',fTill.toUTCString());
  },
}));

// setup source-module, router, error process
//-------------------------------------------
main.routers.forEach( function(item) {
  app.use(item[0],item[1]);  // item: [sPath,router]
});

var routerBuff = main['router.buff'] = [];
var routerDict = main['router.dict'] = {};

express.Router.regist = function(sMethod,sPath,fn) {
  sMethod = sMethod.toLowerCase();
  
  var iId = routerDict[sMethod + ':' + sPath];
  if (iId)
    routerBuff[iId-1] = fn;     // replace old when it exists
  else {
    iId = routerBuff.push(fn);
    routerDict[sMethod + ':' + sPath] = iId;
    
    iId -= 1;
    var middleFn = function() { // router.get(sPath,fn)
      return routerBuff[iId].apply(this,arguments);
    };
    express.Router[sMethod].apply(this,[sPath,middleFn]);
  }
}

// for development online update trunk.js
if (isDevEnv) {
  app.get('/develop/listsrc', function(req,res,next) {
    res.json(main.sources);
  });
  
  app.get('/develop/getsrc', function(req,res,next) {
    var sName = req.query.name + '';
    var srcFile = path.join(__dirname,'plugins',sName);
    if (fs.existsSync(srcFile)) {
      try {
        var sSrc = fs.readFileSync(srcFile,'utf8');
        res.json({message:'OK', src:sSrc});
        return;
      } catch(e) { }
    }
    res.status(500).json({'message':'read module (' + sName + ') failed'});
  });
  
  app.get('/develop/renew', function(req,res,next) {
    var sName = req.query.name;
    if (sName) {
      var srcFile = path.join(__dirname,'plugins',sName);
      if (!fs.existsSync(srcFile)) {
        res.send('can not find source moudle (' + sName + ')');
        return;
      }
      
      try {
        var sModPath = './plugins/' + sName;
        delete require.cache[require.resolve(sModPath)];
        var mod = require(sModPath);
        if (mod.onload) mod.onload(app);
        res.send('module (' + sName + ') renewed at ' + (new Date()).toLocaleString());
      }
      catch(err) {
        res.send(err.message + '\n' + err.stack);
      }
    }
    else res.send('invalid command: /develop/renew?name=module');
  });
  
  app.put('/develop/putsrc', function(req,res,next) {
    var sSrc = req.body.src, sName = req.body.name+'', isApply = parseInt(req.body.apply || '0');
    var srcFile = path.join(__dirname,'plugins',sName);
    if (!fs.existsSync(srcFile)) {
      res.status(500).json({message:'source moudle (' + sName + ') inexistent'});
      return;
    }
    
    if (sSrc && typeof sSrc == 'string') {
      try {
        fs.writeFileSync(srcFile,sSrc);
        if (isApply) {
          var sModPath = './plugins/' + sName;
          delete require.cache[require.resolve(sModPath)];
          var mod = require(sModPath);
          if (mod.onload) mod.onload(app);
        }
        res.json({message:'OK'});
      }
      catch(err) {
        res.status(500).json({message:err.message, detail:err.stack});
      }
    }
    else res.status(500).json({message:'Invalid source code'});
  });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// for development error handler, will print stacktrace
if (isDevEnv) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// start plugin framework
//-----------------------
setTimeout( function() {
  main.sources.forEach( function(item) {
    var mod = require('./plugins/' + item);
    if (mod.onload)
      mod.onload(app);
  });
},0);

module.exports = app;
