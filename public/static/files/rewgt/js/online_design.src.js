// online_design.js

( function() {

var ONLINE_DESIGN_VER    = '0.0.2';

var TOP_PANEL_HEIGHT     = 116;  // in pixel
var RIGHT_PANEL_WIDTH    = 220;
var LEFT_PANEL_WIDTH     = 40;
var FLOAT_BUTTON_WIDTH   = 22;
var THUMBNAIL_PAGE_WIDTH = 136;  // width:128 + margin-left:4 + margin-right:4

var HALF_OF_CENTER_X = 450;
var HALF_OF_CENTER_Y = 350;

var CURR_USR_PATH = '';

var mainFrameOffsetX = 0;
var mainFrameOffsetY = 0;
var mainFrameWidth   = 0;   // 0 means auto

var rootNode    = null;
var leftPanel   = null;
var topPanel    = null;
var rightPanel  = null;
var rulerLeft   = null;
var rulerTop    = null;
var rulerRight  = null;

var topPageTool = null;
var topPageDiv  = null;
var topPageMask = null;
var topPageList = null;

var rightPageList = null;
var rightPageDiv  = null;
var righPanelMask = null;  // only use for resize design area

var haloFrame = null;
var haloFrameRect = {left:0,top:0,width:0,height:0};
var haloFrameBlue = null;
var haloFrameBlueRect = {left:0,top:0,width:0,height:0};
var floatButtons   = null;
var selectInfoBtn  = null;
var selectInfoName = null;
var selectInfoSpan = null;

var haloFrameMult  = null;

var mainMenuArea = null;
var modalMaskTop = null;
var modalMaskLeft = null;
var modalMaskRight = null;
var modalMaskMiddle = null;

var currSelectedWdgt    = null;
var currSelectedIndex   = 0;
var haloCanResizeWidth  = false;
var haloCanResizeHeight = false;

var currEditHtmlPage    = '';  // index.html or other
var currEditorConfig    = {};
var currRootPageType    = '';
var currRootPageKeyid   = '';

var clipTextArea  = null;
var clipTextState = 0;    // 0:unknown, 1:streaming, 2:stream-ed
var clipTextPaths = null;
var clipTextSelectId = 0;

// common APIs
//------------
function htmlEncode(s,hasQuote) {
  var s = s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if (hasQuote) s = s.replace(/"/g,'&quot;');  // "
  return s;
}

function location__(href) {
  var location = document.createElement('a');
  location.href = href;
  if (location.host == '')
    location.href = location.href;
  return location;
}

function getUrlParam(s) {
  var dRet = {}, b = s.split('&');
  b.forEach( function(item) {
    if (!item) return;
    var b2 = item.split('='), sName = b2[0].trim();
    if (sName)
      dRet[sName] = (b2[1] || '').trim();
  });
  return dRet;
}

function getAsynRequest(sUrl,callback) {  // callback must passed
  var xmlHttp = null;
  if (window.XMLHttpRequest)      // Firefox, Opera, IE7, etc
    xmlHttp = new XMLHttpRequest();
  else if (window.ActiveXObject)  // IE6, IE5
    xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
  
  if (xmlHttp) {
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) { // 4 is "loaded"
        if (xmlHttp.status == 200)   // success save
          callback(null,xmlHttp.responseText);
        else callback(new Error('XMLHttpRequest failed'));
        xmlHttp = null;
      }
    };
    xmlHttp.open('GET',sUrl,true);
    xmlHttp.send(null);
  }
}

function postAsynRequest(sUrl,data,callback) {  // callback must passed, only support JSON post
  var xmlHttp = null;
  if (window.XMLHttpRequest)      // Firefox, Opera, IE7, etc
    xmlHttp = new XMLHttpRequest();
  else if (window.ActiveXObject)  // IE6, IE5
    xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
  
  if (xmlHttp) {
    var sJson = JSON.stringify(data);
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) { // 4 is "loaded"
        if (xmlHttp.status == 200)   // success save
          callback(null,xmlHttp.responseText);
        else callback(new Error('XMLHttpRequest failed'));
        xmlHttp = null;
      }
    };
    xmlHttp.open('POST',sUrl,true);
    xmlHttp.setRequestHeader('Content-Type','application/json; charset=utf-8');
    xmlHttp.send(sJson);
  }
}

function transferHasType(transfer,sType) { // transfer.types.contains() for firefox, but not for chrome
  if (!transfer.types) return false;
  var i, iLen = transfer.types.length;
  for (i=0; i < iLen; i += 1) {
    if (transfer.types[i] == sType) return true;
  }
  return false;
}

function eventNoPropagation(event) {
  event.stopPropagation();
}

function eventNoPropagation2(event) {
  event.stopPropagation();
  event.preventDefault();
}

function nowInModal() {
  return modalMaskLeft && modalMaskLeft.style.display != 'none';
}

// operators for backup, redo, undo
//---------------------------------
var operatorId = 0;
var operatorStack = [];    // [[id,sTask],...] // if this stack not empty, means current not in idle

var supportBackup = !!window.localStorage;
var backupIdFrom_ = (new Date()).valueOf() - 1000; // ignore undo when backupId small than this, keep history backup for special recover
var backupTaskId_ = 0;     // 0 means current no delay-backup task, otherwise exists pending task
var backupLastUndoId_ = 0; // 0 means last operation is not undo

var dTemplateTools_ = {};  // {toolId:['mono/all',bTool,withOrigin],vendorProj:false} // tool.baseUrl has added

var creator = null;
var switchPageList_ = null;
var getKeyFromNode_ = function(node) { return '' };

function getKeyFromNode2_(node) {
  var s;
  if (node && (s=getKeyFromNode_(node))) {
    var s2 = node.getAttribute('data-rewgt-owner');
    return s2? s2 + '.' + s: s;
  }
  return '';
}

function segmentOfToolId(sOptid) {
  var b = sOptid.split('/');
  if (b.length <= 2) return null;
  
  var item, sVendor = b.shift(), sPrjPath = '';
  while (item=b.shift()) {
    if (item[0] == '$' && item[1] == '$')
      sPrjPath += '/' + item;
    else {
      sPrjPath += '/' + item;
      break;
    }
  }
  
  var sWdgtName = b.join('/');
  if (!sWdgtName) return null;
  return [sVendor,sPrjPath,sWdgtName];
}

function checkToolConfig(optid,bRetInfo) {
  var b = Array.isArray(optid)? optid: segmentOfToolId(optid+'');
  if (!b) return;
  
  var sVendor = b[0], sPrjPath = sVendor + b[1];
  if (dTemplateTools_.hasOwnProperty(sPrjPath)) return;
  
  var sUrl, sWdgtFull = sPrjPath + '/' + b[2];
  if (creator.isGithub)
    sUrl = b[1] + '/TOOL.json';
  else sUrl = '/app/' + sPrjPath + '/web/TOOL.json';
  getAsynRequest(sUrl, function(err,sJson) {
    if (err) {
      console.log('error: read file failed (' + sUrl + ')');
    }
    else {
      try {
        var cfg = JSON.parse(sJson);
        
        dTemplateTools_[sPrjPath] = false;
        var dLib = {}, bCfgItem = [];
        Object.keys(cfg).forEach( function(item) {
          var value = cfg[item];
          if (!value || !Array.isArray(value.tools)) return;
          
          if (value.hasOwnProperty('baseUrl')) {  // is lib item
            value.tools.forEach( function(tool) {
              tool.baseUrl = value.baseUrl;
            });
            dLib[item] = value;
          }
          else {  // is widget item
            value.name = item;
            bCfgItem.push(value);
          }
        });
        
        bCfgItem.forEach( function(value) {
          var sOpt = value.opt || 'mono/all', bTool = [], withOrigin = false;
          value.tools.forEach( function(sPath) {
            if (typeof sPath != 'string') return;
            if (sPath == '*') {
              withOrigin = true;
              return;
            }
            var bTmp = sPath.split('/'), sName = bTmp.pop(), sPath2 = bTmp.join('/');
            var libItem = sName && dLib[sPath2];
            if (libItem && Array.isArray(libItem.tools)) {
              var tool = libItem.tools.find( function(a) { return a.name === sName } );
              if (tool) bTool.push(tool);
            }
          });
          dTemplateTools_[value.name] = [sOpt,bTool,withOrigin];
          
          if (sWdgtFull == value.name && bRetInfo) {
            var bGroup = sOpt.split('/');
            bRetInfo[0] = bGroup[0];
            bRetInfo[1] = bGroup[1] || 'all';
          }
        });
      }
      catch(e) {
        console.log(e);
        rootNode.instantShow('error: parse JSON failed (' + sUrl + ').');
      }
    }
  });
}

function popOperator(id) {
  for (var i = operatorStack.length-1; i >= 0; i -= 1) {
    if (operatorStack[i][0] === id) {
      operatorStack.splice(i,1);
      break;
    }
  }
}

function getDesignState() {
  var selectedWdgt = '';
  if (currSelectedWdgt && currSelectedWdgt.parentNode) {
    var b = getWidgetPath(currSelectedWdgt);
    if (b) selectedWdgt = b[0];  // selected widget's path
  }
  
  var dState = {
    viewportX: mainFrameOffsetX,
    viewportY: mainFrameOffsetY,
    viewportWd: mainFrameWidth,
    topPanelHi: rootNode.frameInfo.topHi,
    rightPanelWd: rootNode.frameInfo.rightWd,
    
    rootKeyid: currRootPageKeyid,
    showPages: topPageList.style.display != 'none',
    selected: selectedWdgt,
  };
  return dState;
}

function listBackup() {
  if (!supportBackup) return [];
  try {
    var s = localStorage.getItem('rewgt/design-bakIndex') || '[]';
    return JSON.parse(s);
  }
  catch(e) { return []; }
}

function resetBackup() {  // only do one time when startup, called only when supportBackup is true
  var item, bIndex = listBackup(), bRmv = [];
  while (item = bIndex[1]) {
    bRmv.push(item[0]);
    bIndex.splice(1,1);   // keep bIndex[0], remove all others
  }
  
  if (bRmv.length) {
    try {
      bRmv.forEach( function(item) {
        localStorage.removeItem('rewgt/design-bak_'+item);
      });
      localStorage.setItem('rewgt/design-bakIndex',JSON.stringify(bIndex));
    }
    catch(e) { }
  }
}

function writeBackupItem(backupId,sValue) { // called only when supportBackup is true
  var iNewLen = sValue.length, iLimit = Math.min(64,Math.max(3,parseInt(currEditorConfig.cacheSize) || 5));
  iLimit -= 1;
  var limitBytes = iLimit * 0x100000;  // iLimit default is 4 (4M)
  if (iNewLen > limitBytes) {
    rootNode.instantShow('error: write backup failed (document size should less than ' + iLimit + 'M).');
    return;
  }
  
  var bIndex = listBackup(), iPos = -1;
  if (backupLastUndoId_) {
    iPos = bIndex.findIndex( function(item){return item[0] == backupLastUndoId_;} );
    if (iPos >= 0 && iPos < bIndex.length - 1)
      iPos += 1;
    else iPos = -1;
  }
  
  var iTotal = 0;
  bIndex.forEach( function(item,idx) {
    if (iPos < 0 || idx < iPos)
      iTotal += item[1];
    // else, iPos >= 0 && idx >= iPos, items after last undo will be removed
  });
  iTotal += iNewLen;
  
  var bRmv = [];
  while (iTotal > limitBytes && bIndex.length) { // > 4M
    var item = bIndex.shift();
    bRmv.push(item[0]);
    iTotal -= item[1];
  }
  iPos -= bRmv.length;  // adjust iPos, if iPos < 0, still < 0
  
  try {
    if (iPos >= 0) {
      var item = bIndex[iPos];
      while (item) {
        bRmv.push(item[0]);
        bIndex.splice(iPos,1);
        item = bIndex[iPos];
      }
    }
    bIndex.push([backupId,iNewLen]);
    
    bRmv.forEach( function(item) {
      localStorage.removeItem('rewgt/design-bak_'+item);
    });
    
    localStorage.setItem('rewgt/design-bak_'+backupId,sValue);
    localStorage.setItem('rewgt/design-bakIndex',JSON.stringify(bIndex));
    backupLastUndoId_ = 0;
  }
  catch(e) {
    rootNode.instantShow('error: save backup to local storage failed.');
    console.log("write local storage failed, it's size should large than 5M.");
  }
}

function readBackupItem(backupId) {  // called only when supportBackup is true
  try {
    return localStorage.getItem('rewgt/design-bak_' + backupId); // return null when backupId inexistent
  }
  catch(e) { return null; }
}

var firstBackupDone_ = false;
function checkFirstBackup() {
  if (firstBackupDone_) return;
  
  if (rootNode.dumpTree) {   // no need check operatorStack
    var bTree = [];
    rootNode.dumpTree(bTree);
    if (bTree.length == 1) {
      firstBackupDone_ = true;
      
      var backupId = (new Date()).valueOf() - 1000; // -1 second to distinguish continued one
      var sBundle = JSON.stringify({id:backupId,state:getDesignState(),doc:bTree[0]});
      writeBackupItem(backupId,sBundle);
    }
  }
}

function pendingBackup(iDelayTm) {   // pendingBackup(0) for no delay, default delay 3 seconds
  if (!supportBackup || !rootNode.dumpTree) return;
  if (backupTaskId_) {
    clearTimeout(backupTaskId_);
    backupTaskId_ = 0;
  }
  
  var tryNum = 0;
  if (typeof iDelayTm != 'number') iDelayTm = 3000;
  delayProcess();
  
  function delayProcess() {
    backupTaskId_ = setTimeout( function() {
      backupTaskId_ = 0;
      tryNum += 1;
      
      if (operatorStack.length) {
        if (tryNum >= 4) {
          var sOp = operatorStack[0][1];
          rootNode.instantShow('hint: can not save backup when system not in idle' + (sOp?' (still in '+sOp+')':'') + '.');
        }
        else {
          iDelayTm = 1000;
          delayProcess();   // try again
        }
        return;
      }
      
      // start backup
      var bTree = [];
      rootNode.dumpTree(bTree);
      if (bTree.length == 1) {
        var backupId = (new Date()).valueOf();
        var sBundle = JSON.stringify({id:backupId,state:getDesignState(),doc:bTree[0]});
        writeBackupItem(backupId,sBundle);
      }
    },iDelayTm);
  }
}

function canUndoRedo(sTask) {
  if (!supportBackup) return false;
  if (operatorStack.length) {
    var sOp = operatorStack[0][1];
    rootNode.instantShow('warning: task (' + sTask + ') ignored when system not in idle' + (sOp?' (still in '+sOp+').':'.'));
    return false;
  }
  
  if (backupTaskId_) {  // last pending task not finished yet
    rootNode.instantShow('warning: task (' + sTask + ') ignored when pending backup not finished.');
    return false;
  }
  return true;
}

function undoBackup() {
  if (!canUndoRedo('undo')) return;
  
  var iPos = -1, bIndex = listBackup();
  if (backupLastUndoId_) {
    iPos = bIndex.findIndex( function(item){return item[0] == backupLastUndoId_;} );
    if (iPos >= 0) iPos -= 1;  // shift to previous
  }
  else iPos = bIndex.length - 2; // content of last one is not changed, so, get previous of that
  
  var targBakId = iPos >= 0? bIndex[iPos][0]: 0;
  if (!targBakId || targBakId < backupIdFrom_)
    rootNode.instantShow("warning: nothing to undo.");  // not reset backupLastUndoId_, maybe next perform redo
  else {  // iPos >= 0
    var sValue = readBackupItem(targBakId);
    if (!sValue) {
      rootNode.instantShow('warning: load backup item from local storage failed.');
      return;
    }
    
    restoreFromBackup(sValue);
    backupLastUndoId_ = targBakId;
  }
}

function redoBackup() {
  if (!canUndoRedo('redo')) return;
  
  var iPos = -1, bIndex = listBackup();
  if (backupLastUndoId_) {
    iPos = bIndex.findIndex( function(item){return item[0] == backupLastUndoId_;} );
    if (iPos >= 0 && iPos+1 < bIndex.length)
      iPos += 1;     // shift to next one
    else iPos = -1;  // nothing
  }
  
  if (iPos < 0) {
    // backupLastUndoId_ = 0;  // not reset backupLastUndoId_, maybe next perform undo
    rootNode.instantShow("warning: nothing to redo.");
  }
  else {  // iPos >= 0
    var item = bIndex[iPos], targBakId = item[0];
    var sValue = readBackupItem(targBakId);
    if (!sValue) {
      rootNode.instantShow('warning: load backup item from local storage failed.');
      return;
    }
    
    restoreFromBackup(sValue);
    backupLastUndoId_ = targBakId;
  }
}

function restoreFromBackup(sValue) {
  if (!rootNode.loadTree) return;
  
  var dInfo = JSON.parse(sValue); // {id,state,doc}
  var dState = dInfo.state, bTree = dInfo.doc;
  
  currSelectedWdgt = null;  // let timer refresh-task do nothing
  
  // step 1: re-render rootNode by docTree
  rootNode.loadTree(rootNode,bTree, function() {
    if (rootNode.topmostNode())
      nextStep();
    else alert('Restore backup version failed!');
  });
  
  // step 2: set viewport
  function nextStep() {
    resetHaloDisplay();
    
    mainFrameOffsetX = dState.viewportX || 0;
    mainFrameOffsetY = dState.viewportY || 0;
    mainFrameWidth = dState.viewportWd || 0;
    rootNode.frameInfo.topHi = dState.topPanelHi || 0;
    rootNode.frameInfo.rightWd = dState.rightPanelWd || 0;
    
    rootNode.style.left = mainFrameOffsetX + 'px';
    rootNode.style.top = mainFrameOffsetY + 'px';
    
    leftPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH - 14) + 'px ' + (rootNode.frameInfo.topHi + mainFrameOffsetY) + 'px';
    topPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH + mainFrameOffsetX) + 'px ' + (TOP_PANEL_HEIGHT - 28) + 'px';
    topPanel.style.display = rootNode.frameInfo.topHi? 'block': 'none';
    rightPanel.style.display = rootNode.frameInfo.rightWd? 'block': 'none';
    rulerRight.style.display = (mainFrameOffsetX == 0 && mainFrameOffsetY == 0)? 'block': 'none';
    onDocResize();
    
    // step 3: restore page-show and selected widget
    if (dState.showPages) {
      topPageTool.style.visibility = 'visible';
      topPageList.style.display= 'block';
    }
    else {
      topPageList.style.display = 'none';
      topPageTool.style.visibility = 'hidden';
    }
    
    topPageList.innerHTML  = '';    // wait to update
    topPageList.style.left = '0px';
    if (dState.rootKeyid)
      showRootPage(dState.rootKeyid,false,trySelectWidget);
    else {
      topPanel.listChildren('');
      trySelectWidget();
    }
  }
  
  // step 4: select widget
  function trySelectWidget() {
    var sPath = dState.selected;
    if (!sPath) {
      topPanel.listChildren('');
      return;
    }
    
    if (!rootNode.getWidgetNode) return;
    rootNode.getWidgetNode(sPath,'', function(node) {
      setSelectByNode(node,false,false);
    });
  }
}

function afterModifyDoc(iDelay,wdgtPath) {
  if (currRootPageType == 'ScenePage')
    updateSceneThumb(currRootPageKeyid);
  if (wdgtPath) {
    setTimeout( function() {
      renewSchemaEditor(wdgtPath);
    },100);
  }
  pendingBackup(iDelay);
}

// list scene pages
//-----------------
function cloneThumbNode_(owner,node) {
  var newNode = node.cloneNode(true);
  newNode.style.display = 'block';
  newNode.style.position = 'static';
  newNode.style.width = '900px';
  newNode.style.height = '700px';
  newNode.style.transform = 'scale(0.142)'; // 900 * 0.142 = 127.8, 700 * 0.142 = 99.4
  newNode.style.transformOrigin = '0 0';
  newNode.style.zIndex = '3006';
  owner.appendChild(newNode);
  
  var targCanvas, sourCanvas = node.querySelectorAll('canvas'), iLen = sourCanvas.length;
  if (iLen && iLen == (targCanvas=newNode.querySelectorAll('canvas')).length) {
    setTimeout( function() {
      for (var i=0,sour,targ; sour=sourCanvas[i]; i++) {
        targ = targCanvas[i];
        if (targ.width && targ.height) {
          var ctx = targ.getContext('2d');
          ctx.drawImage(sour,0,0);
        }
      }
    },600);
  }
}

function listScenePages(bInfo,renew) {
  // step 1: check pages in same order or not
  var changed = false;
  if (!renew) {
    for (var i=0,item; item=bInfo[i]; i++) {
      var sKey = item[0] + '', oldNode = topPageList.children[i];
      if (!oldNode || oldNode.getAttribute('keyid') !== sKey) {
        changed = true;
        break;
      }
    }
    if (!changed && bInfo.length != topPageList.children.length)
      changed = true;
  }
  else changed = true;
  
  // step 2: update thumbnails
  if (changed) {
    topPageList.innerHTML = '';
    var pgDivWd = topPageDiv.clientWidth || (window.innerWidth-LEFT_PANEL_WIDTH-80); // topPageDiv.clientWidth maybe 0 when topPageDiv not in show
    var perPage = Math.floor(pgDivWd / THUMBNAIL_PAGE_WIDTH);
    topPageList.style.width = Math.max((bInfo.length + perPage - 1) * THUMBNAIL_PAGE_WIDTH,20) + 'px';
    bInfo.forEach( function(item) {
      var keyid = item[0], sKey = keyid + '', node = item[1], sName = node.getAttribute('name');
      var divNode = document.createElement('div');
      divNode.setAttribute('style','width:128px; height:100px; background:#fff; margin:2px 4px; float:left; overflow:hidden; outline:red dotted 0px');
      divNode.setAttribute('keyid',sKey);
      if (sName) divNode.setAttribute('name',sName);
      topPageList.appendChild(divNode);
      cloneThumbNode_(divNode,node);
    });
  }
  
  for (var i=0,node; node = topPageList.children[i]; i++) {
    var isSelect = node.getAttribute('keyid') == currRootPageKeyid;
    // if (isSelect) currRootPageIndex = i;  // no need record
    node.style.outlineWidth = (isSelect?'1px':'0px');
  }
}

function showRootPage(sName,selectPanel,callback) {
  if (!rootNode.showRootPage) {
    if (callback) callback();
    return;
  }
  
  rootNode.showRootPage(sName, function(sNodeType) {
    topPanel.listChildren('');
    
    currRootPageType = sNodeType;
    currRootPageKeyid = currRootPageType? sName: '';
    
    var sCurrPage = sNodeType == 'ScenePage'? sName: '';
    for (var i=0,node; node = topPageList.children[i]; i++) {
      var isSelect = node.getAttribute('keyid') == sCurrPage;
      // if (isSelect) currRootPageIndex = i;
      node.style.outlineWidth = (isSelect? '1px': '0px');
    }
    
    if (selectPanel && (sNodeType == 'Panel' || sNodeType == 'Template')) {
      rootNode.getWidgetNode(rootNode.frameInfo.rootName + '.' + sName,'', function(node) {
        setSelectByNode(node,false,false);
      });
    }
    
    if (sCurrPage) {
      rootNode.getWidgetNode(rootNode.frameInfo.rootName + '.' + sName,'', function(node) {
        if (node) {
          setTimeout( function() {
            var evt = document.createEvent('Event');
            evt.initEvent('slideenter',true,true);
            evt.pageKey = sName;
            node.dispatchEvent(evt);
          },0);
        }
      });
    }
    
    if (callback) callback();
  });
}

function updateSceneThumb(sKey) {
  if (!sKey) return;
  
  var b = null, bExt = [];
  if (rootNode.listChildren)
    b = rootNode.listChildren('');
  if (b) bExt = b[4];
  
  var pageNode = null;
  for (var i=0,item; item=bExt[i]; i+=1) {
    if (item[0] == sKey) {
      pageNode = item[1];
      break;
    }
  }
  if (!pageNode) return;
  
  for (var i=0,node; node=topPageList.children[i]; i++) {
    if (node.getAttribute('keyid') == sKey) {  // find current scene page
      sName = pageNode.getAttribute('name');
      if (sName)
        node.setAttribute('name',sName);
      else node.removeAttribute('name');
      
      node.innerHTML = '';
      cloneThumbNode_(node,pageNode);
      break;
    }
  }
}

// window resize, move viewport, select widget
//--------------------------------------------
function resetHalfWdHi() {
  var hideTopRight = rootNode.frameInfo.topHi == 0;
  HALF_OF_CENTER_X = Math.floor((mainFrameWidth? mainFrameWidth: window.innerWidth - LEFT_PANEL_WIDTH - (hideTopRight?0:RIGHT_PANEL_WIDTH)) * 0.5);
  HALF_OF_CENTER_Y = Math.floor((window.innerHeight - (hideTopRight?0:TOP_PANEL_HEIGHT) - mainFrameOffsetY) * 0.5);
}

function keepRulerPosition() {
  var hideTopRight = rootNode.frameInfo.topHi == 0;
  rulerLeft.style.top = ((hideTopRight?0:TOP_PANEL_HEIGHT) + (HALF_OF_CENTER_Y - 10) + mainFrameOffsetY) + 'px';
  rulerTop.style.left = (LEFT_PANEL_WIDTH + (HALF_OF_CENTER_X - 10) + mainFrameOffsetX) + 'px';
  if (!mainFrameWidth)
    rulerRight.style.left = (window.innerWidth - RIGHT_PANEL_WIDTH - 20) + 'px';
  else rulerRight.style.left = (LEFT_PANEL_WIDTH + mainFrameWidth - 20 + mainFrameOffsetX) + 'px';
}

function defaultPluginGetSet(wdgtPath,noExpr) {
  var typeInfo = null, dSchema = null, option = null;
  
  return [ function(comp) {
    var b = comp.props && rootNode.widgetSchema(comp,false,noExpr);
    if (!b || b.length != 2) return [null,wdgtPath,null];
    
    typeInfo = b[0]; dSchema = b[1];
    option = dSchema.wdgtOption;
    delete dSchema.wdgtOption;
    
    return [getSchemaValue(dSchema.properties || {}),wdgtPath,option];
  }, function(comp,outValue,beClose) {
    var trySave = false, savedWdgt = currSelectedWdgt;
    if (dSchema && option && typeInfo && outValue[0]) {  // outValue[0]: changed
      var value = outValue[1], bRmv = outValue[2];
      if (rootNode.saveWdgtProp && typeof value == 'object' && Array.isArray(bRmv)) {
        trySave = true;
        currSelectedWdgt = null; // current selected maybe renewed, avoid time-refresh lead to unselect
        bRmv.forEach( function(item) { value[item] = undefined; } );
        rootNode.saveWdgtProp(comp,typeInfo,option,value,callback);
        return;
      }
    }
    return callback(false,null);
    
    function callback(succ,retNode) {
      var selectPath = wdgtPath;
      if (trySave) currSelectedWdgt = savedWdgt;
      if (succ) {
        if (retNode) {
          if (retNode.classList.contains('rewgt-scene')) {
            var sName = getKeyFromNode2_(retNode);
            unselectWidget();
            if (sName) {
              setTimeout( function() {
                showRootPage(sName,false, function() {
                  setSelectByNode(retNode,false,false);
                });
              },0);
            }
          }
          else {
            var b = getWidgetPath(retNode), currPath = b?b[0]:'';
            if (currPath && currPath == wdgtPath) // if keyid renamed, auto unselect
              setSelectByNode(retNode,false,false);
            else selectPath = '';
          }
        }
        afterModifyDoc(300,selectPath);
      }
    }
  }];
  
  function getSchemaValue(d) {
    var b = Object.keys(d), bOrder = [], dRet = {};
    b.forEach( function(item) {
      var value, v = d[item];
      if (v.type == 'object') {
        if ('default' in v)
          value = v.default;
        else if ('properties' in v) {
          value = {};
          var dSub = v.properties, bSub = Object.keys(dSub);
          bSub.forEach( function(item2) {
            value[item2] = dSub[item2].default;  // max describe 2 levels, no need go deep
          });
        }
        else return;  // unknown format
      }
      else value = v.default;
      bOrder.push([v.propertyOrder || 0,item,value]);
    });
    bOrder.sort( function(a,b) { return a[0] - b[0]; } );
    
    bOrder.forEach( function(item) {
      dRet[item[1]] = item[2];
    });
    return dRet;
  }
}

function hideAllFloatBtn(hasUpLevel) {
  var btns = floatButtons.querySelectorAll('img'), upLevel = null;
  for (var i=0,item; item = btns[i]; i++) {
    if (item.getAttribute('extend'))
      floatButtons.removeChild(item);
    else {
      item.style.display = 'none';
      if (hasUpLevel && item.getAttribute('name') == 'uplevel')
        upLevel = item;
    }
  }
  
  if (upLevel) {
    floatButtons.style.width = FLOAT_BUTTON_WIDTH + 'px';  // only show one button
    floatButtons.style.visibility = 'visible';
    upLevel.style.display = 'inline';
  }
  else {
    floatButtons.style.width = '0px';
    floatButtons.style.visibility = 'hidden';
  }
}

function setFloatBtnShow(dBtn,bTool,noExpr,isSceneWdgt) { // dBtn:{move:1} // move,copy,linker,styles,edit_txt,uplevel,up,down
  var iNum = 0, btns = floatButtons.querySelectorAll('img'), bShow = [], bHide = [];
  for (var i=0,item; item = btns[i]; i++) {
    if (item.getAttribute('extend'))
      floatButtons.removeChild(item);
    else {
      var sName = item.getAttribute('name');
      if (sName && dBtn[sName])
        bShow.push(item);
      else bHide.push(item);
    }
  }
  
  var bExtend = [];
  if (bTool) {
    bTool.forEach( function(dTool) {
      if (!dTool.clickable) return;
      if (dTool.onlyScene && !isSceneWdgt) return;
      
      var sIconUrl, sIcon = dTool.icon, sBaseUrl = dTool.baseUrl || '';
      if (sIcon) {
        if (sIcon[0] == '/' || (sIcon.indexOf('http') == 0 && (sIcon[4] == ':' || sIcon.slice(4,6) == 's:')))
          sIconUrl = sIcon;
        else {
          if (!sBaseUrl || sBaseUrl.slice(-1) == '/')
            sIconUrl = sBaseUrl + sIcon;
          else sIconUrl = sBaseUrl + '/' + sIcon;
        }
      }
      else sIconUrl = creator.appBase() + '/res/tools.png';
      
      var btn = document.createElement('img');
      btn.setAttribute('extend','true');
      btn.setAttribute('style','display:none; width:16px; height:16px; border:1px solid #f0f0f0; margin:2px;');
      btn.setAttribute('src',sIconUrl);
      if (dTool.title) btn.setAttribute('title',dTool.title);
      // btn.setAttribute('name',dTool.name);  // not set name, avoid conflict to builtin buttons
      btn.setAttribute('draggable','false');
      floatButtons.appendChild(btn);
      
      bExtend.push(btn);
      btn.onload = function(event) {
        event.target.style.display = 'inline';
      };
      btn.onclick = function(event) {
        if (nowInModal()) return;
        event.stopPropagation();  // avoid trigger owner's onclick
        
        if (!currSelectedWdgt || !currSelectedWdgt.parentNode) return;
        if (!rootNode.popDesigner) return;
        
        var b = getWidgetPath(currSelectedWdgt);
        if (b) {
          var wdgtPath = b[0], dTool_ = Object.assign({},dTool);
          if (!dTool_.get || !dTool_.set) {
            var bFn = defaultPluginGetSet(wdgtPath,noExpr);
            dTool_.get = bFn[0]; dTool_.set = bFn[1];
          }
          // else, dTool_.get/set is prepared by T.XXX
          rootNode.popDesigner(wdgtPath,dTool_.name,dTool_,sBaseUrl);
        }
      };
    });
  }
  
  bHide.forEach( function(item) {
    item.style.display = 'none';
  });
  floatButtons.style.width = (FLOAT_BUTTON_WIDTH * (bShow.length + bExtend.length) + 2) + 'px';
  bShow.forEach( function(item) {
    item.style.display = 'inline';
  });
}

function onDocResize(event) {
  // step 1: caculate right panel width
  var iWidth, iTotalWd = window.innerWidth, iTotalHi = window.innerHeight;
  if (iTotalWd < LEFT_PANEL_WIDTH + 80 + RIGHT_PANEL_WIDTH) return;
  if (!mainFrameWidth)
    iWidth = RIGHT_PANEL_WIDTH;
  else iWidth = Math.max(RIGHT_PANEL_WIDTH,iTotalWd - (LEFT_PANEL_WIDTH + mainFrameWidth + mainFrameOffsetX));
  
  resetHalfWdHi();
  
  // step 2: refresh react container frame
  rootNode.frameInfo.rightWd = (rootNode.frameInfo.topHi == 0? 0: iWidth);
  rootNode.frameInfo.bottomHi = mainFrameOffsetY;  // enlarge design area when mainFrameOffsetY < 0
  if (rootNode.refreshFrame) rootNode.refreshFrame();
  
  // step 3: resize middle area of top panel
  var thirdTd = topPanel.querySelectorAll('td')[2];
  if (thirdTd) thirdTd.style.width = iWidth + 'px';
  
  // step 4: resize right panel
  rightPanel.style.left = (iTotalWd - iWidth) + 'px';
  rightPanel.style.width = iWidth + 'px';
  rightPageDiv.style.height = (iTotalHi - 64) + 'px';
  
  // step 5: resize top pages-bar
  var iMiddle = iTotalWd - LEFT_PANEL_WIDTH - iWidth;
  topPageTool.style.width = iMiddle + 'px';
  topPageDiv.style.width  = (iMiddle - 80) + 'px';
  topPageMask.style.width = (iMiddle - 80) + 'px';
  
  // step 6: adjust position: rulerLeft, rulerTop, rulerRight
  keepRulerPosition();
  
  // step 7: keep size of middle modal mask
  modalMaskMiddle.style.width = (modalMaskMiddle.isFull? iTotalWd-LEFT_PANEL_WIDTH: iTotalWd-LEFT_PANEL_WIDTH-rootNode.frameInfo.rightWd) + 'px';
}

var haloFrameDelay_   = 0;
var haloFrameLastTm_  = 0;
var haloFrameDelay2_  = 0;
var haloFrameLastTm2_ = 0;

function renewSelectedFrame(currWdgt,bPath) { // all selection change should call this function
  var noTopLine = false, noTopLine2 = false, isSceneWdgt = false;
  if (!currWdgt) {
    if (currSelectedWdgt) {
      haloFrameBlue.style.display = 'none';
      haloFrame.style.display = 'none';
      currSelectedWdgt = null;
      selectInfoName.innerHTML = '';
      wdgtSelectChange(null);
    }
  }
  else {
    var r,r2, hiSpace,hiSpace2;
    try {
      r = currWdgt.getBoundingClientRect();
    }
    catch(e) { r = null; }
    if (!r) return;
    
    hiSpace = Math.min(0,r.top - rootNode.frameInfo.topHi); // 0 or negative value
    if (hiSpace < 0) {  // r.top is readonly, can not use: r.top = TOP_PANEL_HEIGHT
      noTopLine = true;
      r = {left:r.left, top:rootNode.frameInfo.topHi, width:r.width, height:r.height + hiSpace};
    }
    
    var hasTempNode = false;
    if (haloTempNodes_.length) {
      var tempNode = haloTempNodes_[haloTempNodes_.length-1][2];
      try {
        r2 = tempNode.getBoundingClientRect();
        hasTempNode = true;
      }
      catch(e) { }
      
      if (hasTempNode) {
        hiSpace2 = Math.min(0,r2.top - rootNode.frameInfo.topHi);
        if (hiSpace2 < 0) {
          noTopLine2 = true;
          r2 = {left:r2.left, top:rootNode.frameInfo.topHi, width:r2.width, height:r2.height + hiSpace2};
        }
      }
    }
    
    var changed2 = false;
    if (!hasTempNode) {
      haloFrameBlue.style.display = 'none';
      haloFrameBlueRect = {left:0, top:0, width:0, height:0};
    }
    else changed2 = haloFrameBlueRect.left != r2.left || haloFrameBlueRect.top != r2.top || haloFrameBlueRect.width != r2.width || haloFrameBlueRect.height != r2.height;
    
    var tm = (new Date()).valueOf();
    if ((hasTempNode && currSelectedWdgt !== currWdgt) || changed2) {
      if (haloFrameDelay2_) {
        clearTimeout(haloFrameDelay2_);
        haloFrameDelay2_ = 0;
      }
      
      haloFrameBlueRect = r2;
      if (currSelectedWdgt !== currWdgt)
        haloFrameLastTm2_ = 0;
      if (tm - haloFrameLastTm2_ > 2000)
        setHaloFrame2();
      else {
        haloFrameBlue.style.display = 'none';
        haloFrameDelay2_ = setTimeout(setHaloFrame2,800); // delay show for better look feel
      }
      haloFrameLastTm2_ = tm;
    }
    
    var shiftWdgt = false;
    var changed  = haloFrameRect.left != r.left || haloFrameRect.top != r.top || haloFrameRect.width != r.width || haloFrameRect.height != r.height;
    if (currSelectedWdgt !== currWdgt || changed) {
      if (haloFrameDelay_) {
        clearTimeout(haloFrameDelay_);
        haloFrameDelay_ = 0;
      }
      
      haloFrameRect = r;
      if (currSelectedWdgt !== currWdgt) {
        haloFrameLastTm_ = 0;
        currSelectedWdgt = currWdgt;
        currSelectedIndex += 1; 
        shiftWdgt = true;
      }
      
      if (bPath) {
        isSceneWdgt = (bPath.length == 3 && bPath[1][0] == 'ScenePage');
        haloFrame.isSceneWdgt = isSceneWdgt;
      }
      else isSceneWdgt = haloFrame.isSceneWdgt; // should come from timer
      
      if (tm - haloFrameLastTm_ > 2000)
        setHaloFrame();
      else {
        haloFrame.style.display = 'none';
        haloFrameDelay_ = setTimeout(setHaloFrame,800); // delay show for better look when scroll
      }
      haloFrameLastTm_ = tm;
      
      if (shiftWdgt) wdgtSelectChange(bPath);
    }
    if (!shiftWdgt && bPath) {  // if bPath, come from timer
      setTimeout( function() {
        clipTextArea.select();  // re-select same node
      },0);
    }
  }
  
  function setHaloFrame() {
    haloFrame.inScene = isSceneWdgt;
    if (noTopLine)
      haloFrame.style.borderColor = isSceneWdgt? 'transparent blue blue blue': 'transparent red red red';
    else haloFrame.style.borderColor = isSceneWdgt? 'blue': 'red';
    haloFrame.style.left = haloFrameRect.left + 'px';
    haloFrame.style.top = haloFrameRect.top + 'px';
    haloFrame.style.width = Math.max(0,haloFrameRect.width-2) + 'px';
    haloFrame.style.height = Math.max(0,haloFrameRect.height-2) + 'px';
    haloFrame.style.display = 'block';
  }
  
  function setHaloFrame2() {
    if (noTopLine2)
      haloFrameBlue.style.borderColor = 'transparent blue blue blue';
    else haloFrameBlue.style.borderColor = 'blue';
    haloFrameBlue.style.left = haloFrameBlueRect.left + 'px';
    haloFrameBlue.style.top = haloFrameBlueRect.top + 'px';
    haloFrameBlue.style.width = Math.max(0,haloFrameBlueRect.width-2) + 'px';
    haloFrameBlue.style.height = Math.max(0,haloFrameBlueRect.height-2) + 'px';
    haloFrameBlue.style.display = 'block';
  }
}

var haloSceneCurr_ = [];  // last selected widget in ScenePage, clean if unselect or shift to none-ScenePage
var haloTempNodes_ = [];  // template stack, last one should cover with blue frame
var haloLinkNodes_ = [];  // nodes under linker should be readonly

function renewSchemaEditor(sCheckPath) {
  if (!currSelectedWdgt || !currSelectedWdgt.parentNode || !rootNode.widgetSchema) return;
  
  var b = getWidgetPath(currSelectedWdgt);
  if (!b) return;
  var sPath = b[0], bPath = b[2], editFlag = targCanEditFlag(bPath);
  if (sCheckPath && sPath != sCheckPath) return; // ignore if path not same
  
  if (editFlag < 2) {
    var noExpr = (editFlag == 0? targCanEditFlag(bPath,true) > 0: true);
    b = rootNode.widgetSchema(sPath,true,noExpr);
    if (b) rightPageDiv.setPropEditor(b[0],b[1],b[2],b[3]); // b is [cmdId,dSchema,dOpt,attrs,canEditHtmlTxt]
  }
}

function targCanEditFlag(bPath,onlyBottom) { // return 0 for all, 1 under some, 2 under none
  var iRet = 0, i = bPath.length - 2;
  if (onlyBottom) i += 1;
  
  while (i >= 0) {
    var item = bPath[i];
    i -= 1;
    
    if (item[3]) return 2;  // is linker, as readonly
    
    var sType = item[0];
    if (sType == 'Template' || sType == 'ScenePage') {
      while (i >= 0) {
        var item2 = bPath[i];
        i -= 1;
        if (item2[3]) {     // is linker
          iRet = 2;         // none: readonly
          break;
        }
      }
      return iRet;
    }
    else {
      var sFlag, bInfo = item[2];
      if (bInfo && (sFlag = bInfo[1])) {
        if (sFlag == 'some')
          iRet = 1;  // if previous exists readonly, will be overwrite
        else if (sFlag == 'none')
          return 2;  // readonly
        // else, sFlag == 'all'
      }
    }
    
    if (onlyBottom) break;
  }
  
  return iRet;
}

function joinOriginTool_(bTools,sWdgtPath) {
  var opt = rootNode.getGroupOpt(sWdgtPath);
  if (opt && opt.tools) {
    bTools = bTools.slice(0);
    opt.tools.forEach( function(tool) {
      tool = Object.assign({},tool);
      tool.baseUrl = opt.baseUrl;
      bTools.push(tool);
    });
  }
  return bTools;
}

function htmlEditable_(node) {
  if (node.children.length > 0 && node.getAttribute('data-html.opt') !== 'edit')
    return false;
  return true;
}

function wdgtSelectChange(bPath) {
  function resetOldTemp() {
    var canHide = !!rootNode.hideTemplate;
    while (item = haloTempNodes_.pop()) {  // [sTempType,sPath,node]
      if (canHide) rootNode.hideTemplate(item[1],true);  // true: ignore root page
    }
  }
  
  if (rootNode.setSceneCurrent) {
    var bChanging = [], reIndex = false;
    if (haloSceneCurr_.length) {
      if (!bPath || bPath.length <= 2 || bPath[1][0] != 'ScenePage') {
        bChanging.push([haloSceneCurr_[0],'']);    // unselect old
        haloSceneCurr_ = [];
        reIndex = true;
      }
      else {  // bPath.length > 2 && current_is_ScenePage
        if (haloSceneCurr_[0] != bPath[1][1]) {
          reIndex = true;
          bChanging.push([haloSceneCurr_[0],'']);  // unselect old
        }
        var newScene = bPath[1][1], newWdgt = bPath[2][1];
        if (haloSceneCurr_[0] != newScene || haloSceneCurr_[1] != newWdgt)
          reIndex = true;
        haloSceneCurr_ = [newScene,newWdgt];
        bChanging.push(haloSceneCurr_);      // select new
      }
    }
    else {
      if (bPath && bPath.length > 2 && bPath[1][0] == 'ScenePage') {
        haloSceneCurr_ = [bPath[1][1],bPath[2][1]];
        reIndex = true;
        bChanging.push(haloSceneCurr_); // select new
      }
    }
    
    if (bChanging.length)
      rootNode.setSceneCurrent(bChanging);
    if (reIndex) {  // need refresh thumbnail
      setTimeout( function() {
        if (currRootPageType == 'ScenePage')
          updateSceneThumb(currRootPageKeyid);
      },300);
    }
  }
  
  if (!currSelectedWdgt) { // unselected
    resetOldTemp();
    haloLinkNodes_ = [];
    
    rightPageDiv.setPropEditor(0,null,null); // clear property editor
    
    haloCanResizeWidth  = false;
    haloCanResizeHeight = false;
    return;
  }
  // else, just selected, bPath is detail-info  // if !bPath, maybe refreshed from timer
  
  if (bPath) {
    resetOldTemp();
    haloLinkNodes_ = [];
    
    var isSceneWdgt = (bPath.length == 3 && bPath[1][0] == 'ScenePage');
    var canShowTemp = !!rootNode.showTemplate, iMax = bPath.length-1;
    var sWdgtPath = '', lastIsLnk = false, lastIsTmp = false;
    bPath.forEach( function(item,idx) {
      if (sWdgtPath) sWdgtPath += '.';
      sWdgtPath += item[1];
      
      var sType = item[0], bInfo = item[2], bLnk = item[3];
      if (bLnk) {
        haloLinkNodes_.push(bLnk);
        if (idx == iMax) lastIsLnk = true;
      }
      if (sType == 'Template' && bInfo) {
        haloTempNodes_.push(bInfo);
        if (canShowTemp) rootNode.showTemplate(bInfo[1],true); // true: ignore root page
        if (idx == iMax) lastIsTmp = true;
      }
    });
    
    makeWdgtStream(sWdgtPath);
    
    var bTools = null;
    var editFlag = targCanEditFlag(bPath); // 0:all, 1:some, 2: none
    
    var iWaitTm = 0, withOrigin = false, noExpr = false;
    var sOptid = currSelectedWdgt.getAttribute('data-group.optid'); // optid is come from option.name
    if (sOptid) {
      var b = dTemplateTools_[sOptid];
      if (b) {
        if ((b[0] || 'mono/all').split('/').pop() != 'all')
          noExpr = true;
        bTools = b[1];
        withOrigin = b[2];
      }
      else iWaitTm = 500;
    }
    else {
      if (editFlag >= 2) iWaitTm = 500;
    }
    
    setTimeout( function() {
      var noExprOk = false;
      if (iWaitTm && sOptid) {  // try again, maybe get info from TOOL.json
        var b = dTemplateTools_[sOptid];
        if (b) {
          if ((b[0] || 'mono/all').split('/').pop() != 'all') {
            noExpr = true;
            noExprOk = true;
          }
          bTools = b[1]; // b[0] is 'mono/all'
          withOrigin = b[2];
        }
      }
      
      if (iWaitTm && editFlag >= 2)
        editFlag = targCanEditFlag(bPath);  // recheck, maybe TOOL.json has read
      if (editFlag >= 2) {   // under 'none'
        hideAllFloatBtn(true);
        rightPageDiv.setPropEditor(0,null,null); // clear prop editor
      }
      else {
        var canEditTxt = false;
        if (sWdgtPath && rootNode.widgetSchema) {
          if (!noExprOk)
            noExpr = (editFlag == 0? targCanEditFlag(bPath,true) > 0: true);
          var b = rootNode.widgetSchema(sWdgtPath,true,noExpr);
          if (b) {  // b is [cmdId,dSchema,dOpt,attrs,canEditHtmlTxt]
            canEditTxt = b[4] && htmlEditable_(currSelectedWdgt);
            rightPageDiv.setPropEditor(b[0],b[1],b[2],b[3]);
          }
        }
        
        var sTagType = bPath.length >= 2? bPath[1][0]: '';
        var dBtnShow = {copy:1};
        if (editFlag != 1) dBtnShow.move = 1;  // not under 'some'
        if (lastIsLnk) { dBtnShow.linker = 1; dBtnShow.styles = 1; }
        if (canEditTxt) dBtnShow.edit_txt = 1;
        if (bPath.length > 2 || (bPath.length == 2 && (sTagType == 'Panel' || sTagType == 'ScenePage')))
          dBtnShow.uplevel = 1;
        if (isSceneWdgt) {
          dBtnShow.copy_lnk = 1;
          dBtnShow.up = 1;
          dBtnShow.down = 1;
        }
        
        if (sWdgtPath && rootNode.getGroupOpt) {
          if (withOrigin && bTools)
            bTools = joinOriginTool_(bTools,sWdgtPath);
          else if (!bTools) {
            var opt = rootNode.getGroupOpt(sWdgtPath), bTool_ = (opt && opt.tools) || [];
            bTools = [];
            bTool_.forEach( function(tool) {
              tool = Object.assign({},tool);
              tool.baseUrl = opt.baseUrl;
              bTools.push(tool);
            });
            noExpr = opt && opt.editable != 'all';
          }
        }
        setFloatBtnShow(dBtnShow,bTools,noExpr,isSceneWdgt);
      }
    },iWaitTm);
  }
  // else, !bPath, come from timer, refresh selected frame, not reset haloTempNodes_/haloLinkNodes_
  
  haloCanResizeWidth  = !!currSelectedWdgt.style.width;
  haloCanResizeHeight = !!currSelectedWdgt.style.height;
}

var haloBtnWaitHide_ = 0;
var showFloatBtnId_  = 0;
var haloResizeType_  = 0;  // 0:not in resizing, 1:resize X, 2:resize Y, 3:resize XY
var absoWdgtInMove_  = false;
var haloJustResized_ = false;

function isUnderLinker(bPath) {
  for (var i=0,item; item=bPath[i]; i++) {
    var bLnk = item[3];
    if (bLnk && i < bPath.length-1)  // not last one
      return true;
  }
  return false;
}

function getWidgetPath(targ,bNodeList) {
  var bdNode = rootNode.children[0];
  if (!bdNode) return null;       // widget '.body' not exist
  
  var bPath = [], bAdjust = [], succ = false, currWdgt = null, sWdgtPath = '';
  while (targ) {
    if (targ === bdNode) {
      succ = true;
      if (bNodeList) bNodeList.unshift(targ);
      bPath.unshift(['Panel',rootNode.frameInfo.rootName,['mono','all']]);
      sWdgtPath = rootNode.frameInfo.rootName + sWdgtPath;
      bAdjust.forEach( function(item) {
        item[1] = rootNode.frameInfo.rootName + item[1];
      });
      break;
    }
    
    var sKeyid = getKeyFromNode2_(targ);
    if (sKeyid) {
      var b = [], isInline = false;
      if (targ.classList.contains('rewgt-panel'))
        b.push('Panel');
      else if (targ.classList.contains('rewgt-unit'))
        b.push('Unit');
      else if (targ.classList.contains('rewgt-inline')) {
        b.push('Span');
        isInline = true;
      }
      
      if (b.length) {    // b[0]: Panel,Unit,Span,Template,ScenePage
        if (!currWdgt) currWdgt = targ;
        
        var sLnkAttr = isInline? 'data-span.path': 'data-unit.path';
        if (!targ.hasAttribute(sLnkAttr)) sLnkAttr = '';
        
        b.push(sKeyid);  // b[1]: sKeyid
        
        // b[2] is node-info
        if (targ.hasAttribute('data-temp.type')) {
          var sTemp = targ.getAttribute('data-temp.type');
          var bTemp = [sTemp,'',targ];
          bAdjust.push(bTemp);
          b.push(bTemp);      // b[2]
          b[0] = 'Template';  // take as mono/all
        }
        else if (targ.classList.contains('rewgt-scene')) {
          var bTemp = [targ.getAttribute('name') || '','',targ];
          bAdjust.push(bTemp);
          b.push(bTemp);       // b[2]
          b[0] = 'ScenePage';  // take as mono/all
        }
        else {
          var sGroup = targ.getAttribute('data-group.opt') || '', bGroup = sGroup.split('/');
          var bOptInfo = ['mono','none'], sOptid = targ.getAttribute('data-group.optid');
          if (sOptid) {
            var bTemp = dTemplateTools_[sOptid];
            if (bTemp) {
              sGroup = bTemp[0] + '';
              bGroup = sGroup.split('/');
              bOptInfo[0] = bGroup[0] || 'mono';
              bOptInfo[1] = bGroup[1] || 'all';
            }
            else checkToolConfig(sOptid,bOptInfo); // set later, current default is 'mono/none'
          }
          else {
            bOptInfo[0] = bGroup[0] || 'mono';
            bOptInfo[1] = bGroup[1] || 'all';
          }
          b.push(bOptInfo);  // b[2]
        }
        
        if (sLnkAttr) {
          var sLink = targ.getAttribute(sLnkAttr); // can be ''
          var bLink = [sLink,'',targ];
          bAdjust.push(bLink);
          b.push(bLink);  // b[3] is link-info
        }
        
        if (bNodeList) bNodeList.unshift(targ);
        bPath.unshift(b);
        sWdgtPath = '.' + sKeyid + sWdgtPath;
        bAdjust.forEach( function(item) {
          item[1] = '.' + sKeyid + item[1];
        });
      }
    }
    targ = targ.parentNode;
  }
  
  if (succ && currWdgt)
    return [sWdgtPath,currWdgt,bPath]; // bPath:[[iType,sKeyid,bLinkInfo,bTempInfo],...]
  else return null;
}

function showDelayHideBtn() {
  if (floatButtons.style.width == '0px') return;
  
  showFloatBtnId_ += 1;
  var nowId = showFloatBtnId_;
  floatButtons.style.visibility = 'visible';
  
  haloBtnWaitHide_ = setTimeout( function() {
    if (nowId == showFloatBtnId_) {
      floatButtons.style.visibility = 'hidden';
      haloBtnWaitHide_ = 0;
    }
  },4000);
}

function setSelectByNode(node,noTopAbso,showBtn) {
  if (!node) return null;
  
  var b = getWidgetPath(node);
  if (b && b.length >= 2) {
    if (noTopAbso && b.length == 2 && b[1][0] != 'Panel') // no top absolute widget
      return b;  // ignore selecting ScenePage, Template
    
    var sWdgtPath = b[0], currWdgt = b[1], bPath = b[2];
    renewSelectedFrame(currWdgt,bPath);
    topPanel.setWidgetInfo(bPath);
    topPanel.listChildren(sWdgtPath);
    if (showBtn) showDelayHideBtn();
  }
  return b;
}

function unselectWidget() {
  haloFrameMult.style.display = 'none';
  
  renewSelectedFrame(null,null);
  topPanel.setWidgetInfo(null);
  topPanel.listChildren('');
  
  clipTextState = 0;  // unknown state
  clipTextArea.value = '';
}

function resetHaloDisplay() {  // is called when restored from backup
  currSelectedWdgt = null;
  currRootPageType = '';
  currRootPageKeyid = '';
  
  haloSceneCurr_ = [];
  haloTempNodes_ = [];
  haloLinkNodes_ = [];
  
  absoWdgtInMove_  = false;
  haloResizeType_  = 0;
  haloJustResized_ = false;
  justMultiSelect_ = false;
  justMultiMoved_  = false;
  justSelectMoved_ = false;
  haloCanResizeWidth  = false;
  haloCanResizeHeight = false;
  
  clipTextPaths = null;
  clipTextSelectId = 0;
  haloFrameMult.style.display = 'none';
  
  haloFrameBlue.style.display = 'none';
  haloFrame.style.display = 'none';
  
  rootNode.style.zIndex = '3000';
  modalMaskTop.style.display = 'none';
  modalMaskLeft.style.display = 'none';
  modalMaskRight.style.display = 'none';
  
  selectInfoName.innerHTML = '';  
  selectInfoSpan.innerHTML = '';
  selectInfoSpan.isSceneWdgt = false;
}

// selected widget's resize or move
//---------------------------------
var absoWdgtCanMove_  = false;  // absoWdgtInMove_
var absoWdgtMoveId_   = 0;
var absoWdgtMovingX_  = 0;
var absoWdgtMovingY_  = 0;
var absoWdgtMovePath_ = '';
var absoWdgtHasMoved_ = false;

var haloResizePosX_   = 0;
var haloResizePosY_   = 0;

var multiCanSelect_   = false;
var justMultiSelect_  = false;
var multiSelectFromX_ = 0;
var multiSelectFromY_ = 0;

var multiWdgtCanMove_ = false;
var justMultiMoved_   = false;
var justSelectMoved_  = false;
var multiWdgtInMove_  = false;
var multiInMoveId_    = 0;
var multiMovingFromX_ = 0;
var multiMovingFromY_ = 0;

function makeWdgtStream(wdgtPath) { // path: [pageKey, wdgtKey,...] or wdgtPath
  var isMulti = Array.isArray(wdgtPath);
  if (isMulti)
    clipTextPaths = null; // reset first since next process maybe failed
  // else, single select will not overwrite clipTextPaths
  if (!rootNode.dumpWidget) return;
  
  setTimeout( function() {
    clipTextState = 1;       // wait for streaming
    rootNode.dumpWidget(wdgtPath, function(succ,text) {
      if (succ) {
        clipTextSelectId = currSelectedIndex;
        clipTextPaths = wdgtPath;
        // clipTextType  = isMulti? 2: 1;  // not use yet
        
        clipTextState = 2;   // stream successful       
        clipTextArea.value = text;
        clipTextArea.select();
      }
    });
  },0); // process in next tick, let mouse event response first
}

function docOnMouseDown(event) {
  absoWdgtInMove_ = false;
  haloResizeType_ = 0;
  if (nowInModal()) return;
  
  var currTarg_ = event.target;
  if (currTarg_.nodeName == 'IMG') {
    currTarg_ = currTarg_.parentNode;
    if (currTarg_.nodeName == 'DIV' && currTarg_.getAttribute('name') === 'float-btn')
      return;  // ignore any click from float button 
  }
  
  var x = event.clientX, y = event.clientY;
  if (!inDesignArea(x,y)) return;
  
  var sCursor = document.body.style.cursor;
  if (currSelectedWdgt && sCursor) {
    if (sCursor == 'ew-resize')         // resize width
      haloResizeType_ = 1;
    else if (sCursor == 'ns-resize')    // resize height
      haloResizeType_ = 2;
    else if (sCursor == 'nwse-resize')  // resize width & height
      haloResizeType_ = 3;
  }
  
  multiCanSelect_  = false;
  multiWdgtCanMove_ = false; multiWdgtInMove_ = false;
  absoWdgtCanMove_ = false; absoWdgtInMove_ = false;
  if (haloResizeType_) {
    haloResizePosX_ = x;
    haloResizePosY_ = y;
  }
  else {
    if (!event.shiftKey && currRootPageType == 'ScenePage') {
      var inOneSelect = false, isGround = false;
      if ( !currSelectedWdgt || currSelectedWdgt.classList.contains('rewgt-scene') ||
           (currSelectedWdgt.getAttribute('data-is.ground') && (isGround=true)) ) {
        if (isGround)
          multiCanSelect_ = true;
        else if (haloFrameMult.style.display == 'block' && haloFrameMult.children.length > 1) {
          // still in history multi-selection
          if (inMultiArea(x,y)) {
            multiWdgtCanMove_ = true; multiWdgtMoved_ = false;
            multiMovingFromX_ = x; multiMovingFromY_ = y;
          }
          else multiCanSelect_ = true;
        }
        else multiCanSelect_ = true;
        
        if (multiCanSelect_) {
          multiSelectFromX_ = x;
          multiSelectFromY_ = y;
          while (haloFrameMult.children.length > 1) {
            haloFrameMult.removeChild(haloFrameMult.children[1]);
          }
        }
        document.body.style.cursor = 'default';
      }
      else {
        var r = currSelectedWdgt.getBoundingClientRect();
        if (x >= r.left && x < r.left + r.width && y >= r.top && y < r.top + r.height) {
          inOneSelect = true;
          absoWdgtCanMove_ = true; absoWdgtHasMoved_ = false;
          absoWdgtMovingX_ = x; absoWdgtMovingY_ = y;
        }
        else {
          multiCanSelect_ = true;
          multiSelectFromX_ = x;
          multiSelectFromY_ = y;
          while (haloFrameMult.children.length > 1) {
            haloFrameMult.removeChild(haloFrameMult.children[1]);
          }
          document.body.style.cursor = 'default';
        }
      }
      
      if (!inOneSelect)
        event.preventDefault();
      // else, in one-selected-area, not call preventDefault(), let widget clickable
    }
  }
  
  // default not call preventDefault(), let widget's clickable
  
  function inMultiArea(x,y) {
    for (var i=1,child; child = haloFrameMult.children[i]; i += 1) {
      var r = child.getBoundingClientRect();
      if (x >= r.left && x < r.left + r.width && y >= r.top && y < r.top + r.height)
        return true;
    }
    return false;
  }
  
  function inDesignArea(x,y) {
    if (x > LEFT_PANEL_WIDTH) {   // not use mainFrameOffsetX, mainFrameOffsetY
      if (rootNode && rootNode.frameInfo.topHi == 0)
        return true;
      else if (y > TOP_PANEL_HEIGHT)
        return true;
    }
    return false;
  }
}

function multiMoveSceneObj(pageKey,detaX,detaY) {
  var bList = [pageKey];
  for (var i=1,child; child = haloFrameMult.children[i]; i += 1) {
    var sKey = child.getAttribute('keyid');
    if (sKey) bList.push(sKey);
  }
  if (bList.length <= 1 || !rootNode.moveSceneWdgt) return;
  
  checkFirstBackup();
  bList = rootNode.moveSceneWdgt(bList,detaX,detaY);
  for (var i=1,child; child = haloFrameMult.children[i]; i += 1) {
    var sKey = child.getAttribute('keyid');
    if (sKey && bList.indexOf(sKey) >= 0) {
      if (detaX) child.style.left = (parseFloat(child.style.left) + detaX) + 'px';
      if (detaY) child.style.top = (parseFloat(child.style.top) + detaY) + 'px';
    }
  }
  afterModifyDoc(3000,'');
}

function docOnMouseMove(event) {
  if (nowInModal()) return;
  if (rootNode.splitterMouseDn && rootNode.splitterMouseDn()) return;
  
  var sBodyCursor = 'default', x = event.clientX, y = event.clientY;
  if (multiCanSelect_) {
    if (rootNode.selectMultWdgt) {
      while (haloFrameMult.children.length > 1) {
        haloFrameMult.removeChild(haloFrameMult.children[1]); // remove old, except first one
      }
      
      var topLeftX = Math.min(x,multiSelectFromX_), topLeftY = Math.min(y,multiSelectFromY_);
      var btmRghtX = Math.max(x,multiSelectFromX_), btmRghtY = Math.max(y,multiSelectFromY_);
      var firstNode = haloFrameMult.children[0];
      if (!firstNode) { // firstNode is selecting indicator
        firstNode = document.createElement('div');
        firstNode.setAttribute('style','position:absolute; border:1px dotted red; left:0px; top:0px; width:0px; height:0px;');
        haloFrameMult.appendChild(firstNode);
      }
      else firstNode.style.display = 'block';
      firstNode.style.left = topLeftX + 'px';
      firstNode.style.top  = topLeftY + 'px';
      firstNode.style.width  = Math.max(0,btmRghtX-topLeftX-2) + 'px'; // left,right border use 1px
      firstNode.style.height = Math.max(0,btmRghtY-topLeftY-2) + 'px'; // top,bottom border use 1px
      
      var b = rootNode.selectMultWdgt(currRootPageKeyid,multiSelectFromX_,multiSelectFromY_,x,y);
      b.forEach( function(item) {
        var sKey = item[0], iX = item[1], iY = item[2], iWd = item[3], iHi = item[4];
        var div = document.createElement('div');
        div.setAttribute('keyid',sKey);
        div.setAttribute('style','position:absolute; border:1px dotted red; left:' + iX + 'px; top:' + iY + 'px; width:' + Math.max(0,iWd-2) + 'px; height:' + Math.max(0,iHi-2) + 'px;');
        haloFrameMult.appendChild(div);
      });
      haloFrameMult.style.display = 'block';
      currSelectedIndex += 1;
    }
    return;
  }
  
  if (multiWdgtCanMove_) {
    if (!multiWdgtInMove_) {
      if (Math.abs(x - multiMovingFromX_) >= 4 || Math.abs(y - multiMovingFromY_) >= 4) {
        multiWdgtCanMove_ = false;
        multiWdgtInMove_ = true;
        multiInMoveId_ = operatorId = operatorId + 1;
        operatorStack.push([multiInMoveId_,'moving widget']);
      }
    }
  }
  if (multiWdgtInMove_) {
    var detaX = x - multiMovingFromX_, detaY = y - multiMovingFromY_;
    if (detaX != 0 || detaY != 0) {
      if (!multiWdgtMoved_) {
        multiWdgtMoved_ = true;
        checkFirstBackup();
      }
      
      multiMovingFromX_ = x; multiMovingFromY_ = y;
      multiMoveSceneObj(currRootPageKeyid,detaX,detaY)
    }
    return;
  }
  
  // following process single resize and moving
  
  if (!currSelectedWdgt || !currSelectedWdgt.parentNode) {
    document.body.style.cursor = sBodyCursor;
    return;
  }
  
  var r = currSelectedWdgt.getBoundingClientRect();
  var hiSpace = Math.min(0,r.top - rootNode.frameInfo.topHi); // 0 or negative value
  if (hiSpace < 0)
    r = {left:r.left, top:rootNode.frameInfo.topHi, width:r.width, height:r.height + hiSpace};
  
  if (x >= r.left && x < r.left + r.width && y >= r.top && y < r.top + r.height) {
    // show halo buttons
    if (haloBtnWaitHide_) {
      clearTimeout(haloBtnWaitHide_);
      haloBtnWaitHide_ = 0;
    }
    if (!absoWdgtInMove_ && haloFrameMult.style.display == 'none')
      showDelayHideBtn();
    
    // trigger resizing cursor
    if (x >= r.left + r.width - 6) {
      if (y >= r.top + r.height - 6) {
        if (haloCanResizeWidth) {
          if (haloCanResizeHeight)
            sBodyCursor = 'nwse-resize';
          else sBodyCursor = 'ew-resize';
        }
        else if (haloCanResizeHeight)
          sBodyCursor = 'ns-resize';
      }
      else {
        if (haloCanResizeWidth)
          sBodyCursor = 'ew-resize';
      }
    }
    else {
      if (y >= (r.top + r.height - 6) && haloCanResizeHeight)
        sBodyCursor = 'ns-resize';
    }
    
    if ( haloFrame.inScene && !absoWdgtInMove_ && absoWdgtCanMove_ && 
         sBodyCursor == 'default' && haloFrame.style.display != 'none' ) {
      if (rootNode.splitterMouseDn && !rootNode.splitterMouseDn()) { // not in Splitter resizing
        if (Math.abs(x - absoWdgtMovingX_) >= 4 || Math.abs(y - absoWdgtMovingY_) >= 4) {
          var b = getWidgetPath(currSelectedWdgt);
          if (b) {
            floatButtons.style.visibility = 'hidden';
            absoWdgtMovePath_ = b[0]; absoWdgtHasMoved_ = false;
            absoWdgtInMove_ = true; absoWdgtCanMove_ = false;
            absoWdgtMoveId_ = operatorId = operatorId + 1;
            operatorStack.push([absoWdgtMoveId_,'moving widget']);
          }
        }
      }
    }
  }
  
  if (absoWdgtInMove_) {
    haloResizeType_ = 0;
    document.body.style.cursor = 'default';
    var detaX = x - absoWdgtMovingX_, detaY = y - absoWdgtMovingY_;
    if (detaX || detaY) {
      absoWdgtMovingX_ = x; absoWdgtMovingY_ = y;
      if (!absoWdgtHasMoved_) {
        absoWdgtHasMoved_ = true;
        checkFirstBackup();
      }
      
      rootNode.moveSceneWdgt(absoWdgtMovePath_,detaX,detaY);
      if (detaX)  // can not use haloFrame.offsetLeft, maybe display is 'none'
        haloFrame.style.left = (parseInt(haloFrame.style.left) + detaX) + 'px';
      if (detaY)
        haloFrame.style.top = (parseInt(haloFrame.style.top) + detaY) + 'px';
    }
  }
  else document.body.style.cursor = sBodyCursor;
}

function docOnMouseUp(event) {
  if (nowInModal()) return;
  
  if (rootNode.splitterMouseDn && rootNode.splitterMouseDn()) {
    justMultiSelect_ = false;
    multiCanSelect_  = false;
    
    if (haloFrameMult) {
      haloFrameMult.style.display = 'none';
      if (haloFrameMult.children.length)
        haloFrameMult.children[0].style.display = 'none'; // hide selecting frame
    }
    floatButtons.style.visibility = 'hidden';  // hidden float buttons
    
    multiWdgtCanMove_ = false;
    multiWdgtInMove_  = false;
    justMultiMoved_   = false;
    multiWdgtMoved_   = false;
    
    absoWdgtCanMove_  = false;
    justSelectMoved_  = false;
    absoWdgtInMove_   = false;
    absoWdgtHasMoved_ = false;
    
    haloResizeType_ = 0;
  
    var iLen = operatorStack.length;
    if (iLen) operatorStack.splice(0,iLen); // clear
    return;
  }
  
  justMultiSelect_ = false;
  if (!haloFrameMult)
    ;
  else if (haloFrameMult.children.length <= 1)
    haloFrameMult.style.display = 'none';
  else {
    if (multiCanSelect_) {
      justMultiSelect_ = true;
      setTimeout( function() {
        justMultiSelect_ = false;
      },1000);
      
      if (currRootPageType == 'ScenePage' && currRootPageKeyid) {
        var bMultPath = [currRootPageKeyid];
        for (var i=1,child; child = haloFrameMult.children[i]; i += 1) {
          var sKey = child.getAttribute('keyid');
          if (sKey) bMultPath.push(sKey);
        }
        if (bMultPath.length > 1) {
          if (bMultPath.length == 2 && rootNode.getWidgetNode) { // only select one
            var tarPath = rootNode.frameInfo.rootName + '.' + currRootPageKeyid + '.' + bMultPath[1];
            setTimeout( function() {
              rootNode.getWidgetNode(tarPath,'', function(node) {
                if (!node) return;
                haloFrameMult.style.display = 'none';  // hide mult-selection
                setSelectByNode(node,false,false);
              });
            },300);
          }
          else {
            renewSelectedFrame(null,null);
            makeWdgtStream(bMultPath);
          }
        }
      }
    }
    haloFrameMult.children[0].style.display = 'none'; // first child for selecting-frame
    floatButtons.style.visibility = 'hidden';  // hidden float buttons
  }
  multiCanSelect_ = false;
  
  multiWdgtCanMove_ = false;
  justMultiMoved_ = false;
  if (multiWdgtInMove_) {
    multiWdgtInMove_  = false;
    popOperator(multiInMoveId_);
    
    if (multiWdgtMoved_) {
      justMultiMoved_ = true;
      setTimeout( function() {
        justMultiMoved_ = false;
      },1000);
      
      multiWdgtMoved_ = false;
      afterModifyDoc(3000,'');
    }
  }
  
  absoWdgtCanMove_ = false;
  justSelectMoved_ = false;
  if (absoWdgtInMove_) {
    absoWdgtInMove_ = false;
    popOperator(absoWdgtMoveId_);
    
    if (absoWdgtHasMoved_ && absoWdgtMovePath_) {
      justSelectMoved_ = true;
      setTimeout( function() {
        justSelectMoved_ = false;
      },1000);
      
      absoWdgtHasMoved_ = false;
      afterModifyDoc(3000,absoWdgtMovePath_);
    }
  }
  else {
    if (currSelectedWdgt && haloResizeType_) {
      haloJustResized_ = true;
      setTimeout( function() {
        haloJustResized_ = false;  // let rootNode.onclick ignore selection
      },1000);
      
      var x = event.clientX - haloResizePosX_, y = event.clientY - haloResizePosY_, changed = false;
      if ((haloResizeType_ == 1 || haloResizeType_ == 3) && x != 0)
        changed = true;
      if ((haloResizeType_ == 2 || haloResizeType_ == 3) && y != 0)
        changed = true;
      
      if (changed && rootNode.resizeWidget) {
        var b = getWidgetPath(currSelectedWdgt);
        if (b && !isUnderLinker(b[2])) {
          var srcPath = b[0];
          checkFirstBackup();
          rootNode.resizeWidget(srcPath,haloResizeType_,x,y, function(changed) {
            if (changed)
              afterModifyDoc(3000,srcPath);
          });
        }
      }
    }
  }
  haloResizeType_ = 0;
  
  setTimeout( function() {
    var iLen = operatorStack.length;
    if (iLen) operatorStack.splice(0,iLen); // clear
  },0);
}

// window.onload processing
//-------------------------
function initCreator() {
  var draggingId_ = 0;
  var draggingNode_ = null;
  
  var haloFrame2 = null, haloFrame2Ins = null, instantDiv = null;
  
  CURR_USR_PATH = document.location.href.split('?')[0];
  if (CURR_USR_PATH.slice(-1) != '/')
    CURR_USR_PATH = CURR_USR_PATH.slice(0,CURR_USR_PATH.lastIndexOf("/")+1);
  
  // step 1: config frame position
  //------------------------------
  currEditHtmlPage = getUrlParam(window.location.search.slice(1)).page || 'index.html';
  rootNode = document.getElementById('react-container');
  if (!rootNode) return;
  if (rootNode.frameInfo) {  // react already render container node
    Object.assign(rootNode.frameInfo, {topHi:TOP_PANEL_HEIGHT,
      rightWd:RIGHT_PANEL_WIDTH, bottomHi:0, leftWd:LEFT_PANEL_WIDTH,
    });
    setTimeout( function() {
      if (rootNode.refreshFrame) rootNode.refreshFrame();
    },1000);
  }
  else {
    rootNode.frameInfo = { topHi:TOP_PANEL_HEIGHT, rightWd:RIGHT_PANEL_WIDTH,
      bottomHi:0, leftWd:LEFT_PANEL_WIDTH, rootName:'.body',
    };
  }
  rootNode.classList.add('noselect-txt'); // avoid selecting in double click, drag & drop
  var sDsnAttr = rootNode.getAttribute('__design__');
  if (!sDsnAttr || sDsnAttr == '0') return;
  
  rootNode.version = function() {
    return ONLINE_DESIGN_VER;
  };
  
  rootNode.instantShow = function(sMsg) {
    if (!sMsg || !instantDiv) return;
    console.log('[MSG]',sMsg);
    
    while (instantDiv.children.length >= 5) {
      var node = instantDiv.children[0];
      instantDiv.removeChild(node);
    }
    
    var wd = window.innerWidth, hi = window.innerHeight, iX = 0;
    if (wd > 800) {
      iX = wd * 0.2;
      wd = wd * 0.6;
    }
    else if (wd > 400) {
      iX = wd * 0.1;
      wd = wd * 0.8;
    }
    // else, iX = 0, wd = wd;
    instantDiv.style.left = iX + 'px';
    instantDiv.style.width = wd + 'px';
    
    var para = document.createElement('p');
    para.setAttribute('style','width:' + (wd - 14) + 'px; margin:2px; padding:6px; border:1px solid #ccc; background-color:#ffe; line-height:1.4; font-size:14px; color:#222; text-align:center; overflow:hidden; border-radius:3px; transition: all 0.4s ease-out; -o-transition: all 0.4s ease-out; -moz-transition: all 0.4s ease-out; -webkit-transition: all 0.4s ease-out; -ms-transition: all 0.4s ease-out;');
    para.innerHTML = htmlEncode(sMsg);
    instantDiv.appendChild(para);
    instantDiv.style.display = 'block';
    
    setTimeout( function() {
      if (para && para.parentNode) {  // paragraph still available
        para.style.borderWidth = '0px';
        para.style.margin  = '0px';
        para.style.padding = '0px';
        para.style.height  = '0px';
      }
    },10000);  // hide it after 10 seconds
  };
  
  resetHalfWdHi();
  
  window.onbeforeunload = function() {
    // return null;
    return 'This is single page application, do you want shift to another page?';
  };
  
  // step 2: create leftPanel/topPanel/rightPanel
  //------------------------------
  topPanel = document.createElement('div');
  topPanel.setAttribute('style','position:absolute; left:0px; top:0px; width:100%; height:' + TOP_PANEL_HEIGHT + 'px; background:#e8e8e8 url(' + creator.appBase() + '/res/ruler_top.png) no-repeat fixed ' + (LEFT_PANEL_WIDTH + mainFrameOffsetX) + 'px ' + (TOP_PANEL_HEIGHT - 28) + 'px; z-index:3006;');
  document.body.appendChild(topPanel);
  leftPanel = document.createElement('div');
  leftPanel.setAttribute('style','position:absolute; left:0px; top:0px; width:' + LEFT_PANEL_WIDTH + 'px; height:100%; background:#e8e8e8 url(' + creator.appBase() + '/res/ruler_left.png) no-repeat fixed ' + (LEFT_PANEL_WIDTH - 14) + 'px ' + (TOP_PANEL_HEIGHT + mainFrameOffsetY) + 'px; z-index:3020;');
  rightPanel = document.createElement('div');
  rightPanel.setAttribute('style','position:absolute; right:0px; top:0px; width:' + RIGHT_PANEL_WIDTH + 'px; height:100%; background-color:#e8e8e8; z-index:3020; overflow:hidden;');
  document.body.appendChild(rightPanel);
  
  // step 3: add left tool buttons
  //------------------------------
  var topTool = document.createElement('div');
  topTool.setAttribute('style','position:relative; left:3px; top:3px; line-height:1.2; width:100%; height:' + TOP_PANEL_HEIGHT + 'px;');
  leftPanel.appendChild(topTool);
  var b = [['Main menu',creator.appBase()+'/res/menu.png','menu'],['Show pages/widgets',creator.appBase()+'/res/grid.png','thumb']];
  b.forEach( function(item) {
    var sTitle = item[0], sUrl = item[1], sName = item[2];
    var btn = document.createElement('img');
    btn.setAttribute('style','width:22px; height:22px; border:1px solid #e8e8e8;');
    btn.setAttribute('src',sUrl);
    btn.setAttribute('title',sTitle);
    btn.setAttribute('name',sName);
    topTool.appendChild(btn);
  });
  leftPanel.addEventListener('mouseover', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'IMG')
      targ.style.borderColor = '#f8f8f8 #aaa #aaa #f8f8f8';
  },false);
  leftPanel.addEventListener('mouseout', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'IMG')
      targ.style.borderColor = '#e8e8e8';
  },false);
  
  var leftTool = document.createElement('div');
  leftTool.setAttribute('style','position:relative; left:3px; top:0px; line-height:1.2; width:100%;');
  leftPanel.appendChild(leftTool);
  var b = [['Switch viewport',creator.appBase()+'/res/switch.png','switch'],
    ['Align center',creator.appBase()+'/res/align.png','align'], ['','',''],
    ['Remove widget',creator.appBase()+'/res/delete.png','delete'],
    ['Undo',creator.appBase()+'/res/undo.png','undo'],
    ['Redo',creator.appBase()+'/res/redo.png','redo'], ['','',''],
    ['Save',creator.appBase()+'/res/save.png','save'],
    ['Open or create page',creator.appBase()+'/res/open.png','open'],
    ['Config',creator.appBase()+'/res/config.png','config'],
  ];
  b.forEach( function(item) {
    var sTitle = item[0], sUrl = item[1], sName = item[2];
    if (!sUrl) {
      var space = document.createElement('div');
      space.setAttribute('style','width:100%; height:20px;');
      leftTool.appendChild(space);
    }
    else {
      var sStyle = 'width:22px; height:22px; border:1px solid #e8e8e8;';
      if (creator.useHtmlProxy && (sName == 'open' || sName == 'config'))
        sStyle += 'display:none';
      
      var btn = document.createElement('img');
      btn.setAttribute('style',sStyle);
      btn.setAttribute('src',sUrl);
      btn.setAttribute('title',sTitle);
      btn.setAttribute('name',sName);
      leftTool.appendChild(btn);
    }
  });
  
  rulerLeft = document.createElement('div');
  var iPosY = TOP_PANEL_HEIGHT + (HALF_OF_CENTER_Y - 10) + mainFrameOffsetY;
  rulerLeft.setAttribute('style','position:absolute; left:' + (LEFT_PANEL_WIDTH - 10) + 'px; top:' + iPosY + 'px; width:9px; height:18px; border:1px solid #aaa; background-color:rgba(192,192,192,0.7); cursor:ns-resize;');
  rulerLeft.setAttribute('title','Drag to move y-axis');
  leftPanel.appendChild(rulerLeft);
  var rulerLeftY = 0, rulerLeftCanDrag = false, rulerLeftDraged = false, rulerLeftOpId = 0;
  rulerLeft.addEventListener('click',eventNoPropagation,false);
  rulerLeft.addEventListener('mousedown', function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    rulerLeftCanDrag = true;
    rulerLeftDraged = false;
    rulerLeftY = event.clientY;
  },false);
  document.addEventListener('mousemove', function(event) {
    var iY = event.clientY;
    if (iY <= 20 || iY >= (window.innerHeight-20)) return;
    
    if (!rulerLeftDraged && rulerLeftCanDrag) {
      if (Math.abs(iY - rulerLeftY) >= 4) {
        rulerLeftOpId = operatorId = operatorId + 1;
        operatorStack.push([rulerLeftOpId,'moving viewport']);
        unselectWidget();
        rulerLeftDraged = true;
        rulerLeftCanDrag = false;
      }
    }
    
    if (rulerLeftDraged) {
      event.stopPropagation();
      event.preventDefault();
      
      var detaY = iY - rulerLeftY;
      if (detaY != 0) {
        rulerLeftY = iY;
        mainFrameOffsetY += detaY;
        rootNode.style.top = mainFrameOffsetY + 'px';
        rulerLeft.style.top = (TOP_PANEL_HEIGHT + (HALF_OF_CENTER_Y - 10) + mainFrameOffsetY) + 'px'; // HALF_OF_CENTER_Y not change when moving
        leftPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH - 14) + 'px ' + ((rootNode.frameInfo.topHi == 0?0:TOP_PANEL_HEIGHT) + mainFrameOffsetY) + 'px';
      }
    }
  },false);
  document.addEventListener('mouseup', function(event) {
    rulerLeftCanDrag = false;
    if (rulerLeftDraged) {
      popOperator(rulerLeftOpId);
      rulerLeftDraged = false;
      event.stopPropagation();
      event.preventDefault();
      
      mainFrameOffsetY += event.clientY - rulerLeftY;
      resetHalfWdHi();  // HALF_OF_CENTER_Y changed
      rootNode.style.top = mainFrameOffsetY + 'px';
      rulerLeft.style.top = (TOP_PANEL_HEIGHT + (HALF_OF_CENTER_Y - 10) + mainFrameOffsetY) + 'px';
      leftPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH - 14) + 'px ' + ((rootNode.frameInfo.topHi == 0?0:TOP_PANEL_HEIGHT) + mainFrameOffsetY) + 'px';
      
      rootNode.frameInfo.bottomHi = mainFrameOffsetY;  // enlarge or reduce design area
      if (rootNode.refreshFrame) rootNode.refreshFrame();
    }
  },false);
  
  // step 4: add top tool buttons
  //------------------------------
  function copyWidget_(srcPath,tarPath,isChild,rmvSrc,iX,iY,callback) {
    if (!rootNode.copyWidget) return;
    
    var oldNode = currSelectedWdgt, nodeChanged = false;
    if (oldNode && oldNode.parentNode) {
      currSelectedWdgt = null;   // avoid refresh lead to unselected
      nodeChanged = true;
    }
    
    checkFirstBackup();
    rootNode.copyWidget(srcPath,tarPath,isChild,rmvSrc,iX,iY, function(succ,retNode) {
      if (succ) {
        var newSelect = '';
        if (retNode) {
          if (retNode.classList.contains('rewgt-scene')) {
            var sName = getKeyFromNode2_(retNode);
            unselectWidget();
            if (sName) {
              setTimeout( function() {
                showRootPage(sName,false, function() {
                  var b = getWidgetPath(retNode);
                  if (b) newSelect = b[0];
                  setSelectByNode(retNode,false,false);
                });
              },0);
            }
          }
          else if (retNode.parentNode.parentNode === rootNode && retNode.style.position == 'absolute')
            unselectWidget();    // can refresh page thumbnail, restore last absolute showing
          else {
            if (nodeChanged) {
              var b = getWidgetPath(retNode);
              if (b) newSelect = b[0];
              setSelectByNode(retNode,false,false);
            }
          }
        }
        afterModifyDoc(600,newSelect);  // delay 0.6 second
      }
      else {
        if (nodeChanged)
          currSelectedWdgt = oldNode;   // restore
      }
      if (callback) callback(succ);
    });
  }
  
  topPanel.innerHTML = '<table style="width:100%; height:100%; border-collapse:collapse; margin:0px; padding:0px; border:0px solid gray; table-layout:auto; overflow:hidden">' +
    '<tr><td style="width:' + LEFT_PANEL_WIDTH + 'px"></td><td style="vertical-align:top"></td><td style="width:' + RIGHT_PANEL_WIDTH + 'px"></td></tr></table>';
  var secondTd = topPanel.querySelectorAll('td')[1];
  var childInfo = document.createElement('div');
  childInfo.setAttribute('style','width:100%; height:60px; margin:3px 0px 2px 0px; line-height:1.2; background-color:#f4f4f4; overflow-y:auto; border-radius:3px;');
  secondTd.appendChild(childInfo);
  var selectInfo = document.createElement('div');
  selectInfo.setAttribute('style','width:100%; height:28px; overflow:hidden; font-size:15px; line-height:18px;');
  secondTd.appendChild(selectInfo);
  var ruleInfo = document.createElement('div');
  ruleInfo.setAttribute('style','width:100%; height:20px;');
  ruleInfo.setAttribute('title','Click to unselect widget');
  secondTd.appendChild(ruleInfo);
  selectInfoBtn = document.createElement('img');
  selectInfoBtn.setAttribute('draggable','true');
  selectInfoBtn.setAttribute('style','display:none; width:16px; height:16px; border:1px solid #e8e8e8; margin:0px 6px 0px 0px;');
  selectInfoBtn.setAttribute('src',creator.appBase()+'/res/empty.png');
  selectInfo.appendChild(selectInfoBtn);
  selectInfoName = document.createElement('span');
  selectInfoName.setAttribute('style','padding:2px 8px 2px 0px; color:#444;');
  selectInfo.appendChild(selectInfoName);  
  selectInfoSpan = document.createElement('span');
  selectInfoSpan.setAttribute('style','padding:2px 10px 2px 0px; color:#444;');
  selectInfo.appendChild(selectInfoSpan);
  var selectInfoChild = document.createElement('img');
  selectInfoChild.setAttribute('style','display:none; position:relative; top:-1px; width:16px; height:16px;');
  selectInfoChild.setAttribute('src',creator.appBase()+'/res/insert.png');
  selectInfo.appendChild(selectInfoChild);
  topPageTool = document.createElement('div');
  var iWd = window.innerWidth-LEFT_PANEL_WIDTH-RIGHT_PANEL_WIDTH;
  topPageTool.setAttribute('style','visibility:hidden; position:absolute; left:' + LEFT_PANEL_WIDTH + 'px; top:0px; width:' + iWd + 'px; height:' + (TOP_PANEL_HEIGHT-10) + 'px; background-color:#e8e8e8; overflow:hidden;');
  topPanel.appendChild(topPageTool);
  topPageTool.innerHTML = '<div name="prev_page" title="previous page" style="position:absolute; left:1px; top:2px; width:20px; height:102px; background:#ccc"></div>' +
    '<div name="prev_item" title="previous item" style="position:absolute; left:21px; top:2px; width:20px; height:102px; background:#ddd"></div>' +
    '<div name="page_div" style="position:absolute; left:40px; top:0px; width:' + (iWd-80) + 'px; height:104px; z-index:3006; overflow:hidden"><div name="page_list" style="display:none; position:relative; left:0px, top:0px; width:20px; height:100%; overflow:hidden"></div></div>' + 
    '<div name="page_mask" style="position:absolute; left:40px; top:0px; width:' + (iWd-80) + 'px; height:104px; z-index:3006; overflow:hidden"></div>' + 
    '<div name="page_tip" style="display:none; position:absolute; z-index:3040; background-color:#ffd; border:1px solid #ddd; font-size:12px; color:#222; line-height:1; padding:4px; box-shadow:0 3px 3px rgba(0,0,0,0.2)"></div>' +
    '<div name="next_item" title="next item" style="position:absolute; right:20px; top:2px; width:20px; height:102px; background:#ddd"></div>' +
    '<div name="next_page" title="next page" style="position:absolute; right:0px; top:2px; width:20px; height:102px; background:#ccc"></div>';
  topPageDiv  = topPageTool.querySelector('div[name="page_div"]');
  topPageMask = topPageTool.querySelector('div[name="page_mask"]');
  topPageList = topPageTool.querySelector('div[name="page_list"]');
  var topPageTip = topPageTool.querySelector('div[name="page_tip"]');
  
  function pageNavMouseOver(event) {
    var targ = event.target;
    if (targ.nodeName == 'DIV') targ.style.opacity = '0.7';
  }
  function pageNavMouseOut(event) {
    var targ = event.target;
    if (targ.nodeName == 'DIV') targ.style.opacity = '1';
  }
  function pageNavClick(event) {
    event.stopPropagation();
    
    var perPage = Math.floor(topPageDiv.clientWidth / THUMBNAIL_PAGE_WIDTH);
    if (perPage <= 0) return;  // width too small, ignore shift thumbnail
    
    var iX = Math.max(0,0 - topPageList.offsetLeft);
    var iStartPage = Math.floor(iX / THUMBNAIL_PAGE_WIDTH);
    var iPageNum = topPageList.children.length;
    
    var sName = event.target.getAttribute('name');
    if (sName == 'prev_page') {
      if (iStartPage >= perPage)
        topPageList.style.left = (0 - iX + perPage * THUMBNAIL_PAGE_WIDTH) + 'px';
      else if (iStartPage > 0)
        topPageList.style.left = '0px';
    }
    else if (sName == 'next_page') {
      if (iPageNum > iStartPage + perPage)
        topPageList.style.left = (0 - iX - perPage * THUMBNAIL_PAGE_WIDTH) + 'px';
    }
    else if (sName == 'prev_item') {
      if (iStartPage > 0)
        topPageList.style.left = (0 - THUMBNAIL_PAGE_WIDTH * (iStartPage - 1)) + 'px';
    }
    else if (sName == 'next_item') {
      if (iStartPage + 1 < iPageNum)
        topPageList.style.left = (0 - THUMBNAIL_PAGE_WIDTH * (iStartPage + 1)) + 'px';
    }
  }
  topPageMask.addEventListener('mousedown',eventNoPropagation2,false);
  topPageMask.addEventListener('dragstart',eventNoPropagation2,false);
  topPageMask.addEventListener('dragend',eventNoPropagation2,false);
  topPageMask.addEventListener('dragover', function(event) {
    if (!draggingNode_) return;
    if (draggingNode_.parentNode === floatButtons) {
      var sName = draggingNode_.getAttribute('name');
      if (sName == 'copy' || sName == 'move')
        event.preventDefault();  // can drop
    }
  },false);
  topPageMask.addEventListener('drop', function(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!draggingNode_) return;
    
    var sPath = event.dataTransfer.getData('text/plain');
    if (sPath && rootNode.getWidgetNode) {
      var sName = draggingNode_.getAttribute('name');
      if (sName == 'copy' || sName == 'move') {
        var iStartPage = Math.floor(Math.max(0,0 - topPageList.offsetLeft) / THUMBNAIL_PAGE_WIDTH);
        var r = topPageMask.getBoundingClientRect();
        var iX = Math.max(0,event.clientX - r.left);
        var iPage = iStartPage + Math.floor(iX / THUMBNAIL_PAGE_WIDTH);
        var pgNode = topPageList.children[iPage], pgNode2 = null, targKey2 = '';
        var targKey = pgNode? pgNode.getAttribute('keyid') || '': '';
        if (iPage > 0) {
          pgNode2 = topPageList.children[iPage-1];
          if (pgNode2)
            targKey2 = pgNode2.getAttribute('keyid') || '';
        }
        
        rootNode.getWidgetNode(sPath,'', function(node) {
          if (!node || !node.classList.contains('rewgt-scene')) return;
          var b = getWidgetPath(node);
          if (b) {
            var srcPath=b[0], bTmp = srcPath.split('.'), sourKey = bTmp.pop();
            if (sName == 'move' && (sourKey == targKey || sourKey == targKey2))
              return; // move to same position, just ignore
            
            var isChild = true, tarPath = rootNode.frameInfo.rootName;
            if (targKey) {
              isChild = false;
              bTmp.push(targKey);
              tarPath = bTmp.join('.');
            }
            copyWidget_(srcPath,tarPath,isChild,sName == 'move',0,0);
          }
        });
      }
    }
  },false);
  
  var pageTipShown = 0, pageTipDbClick = false;
  topPageMask.addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    mainMenuArea.hideMenu();
    
    var iStartPage = Math.floor(Math.max(0,0 - topPageList.offsetLeft) / THUMBNAIL_PAGE_WIDTH);
    var r = topPageMask.getBoundingClientRect();
    var iX = Math.max(0,event.clientX - r.left), iY = event.clientY;
    var iPage = iStartPage + Math.floor(iX / THUMBNAIL_PAGE_WIDTH);
    var node = topPageList.children[iPage];
    
    if (node) {
      var sHint = node.getAttribute('keyid') || '', sName = node.getAttribute('name');
      sHint = sName? sHint+': '+sName: sHint;
      
      if (sHint) {
        if (pageTipShown) {
          clearTimeout(pageTipShown);
          pageTipShown = 0;
          topPageTip.style.display = 'none';
        }
        
        setTimeout( function() {
          if (pageTipDbClick) return;
          
          topPageTip.style.left = (iX + 40 + 2) + 'px';
          topPageTip.style.top = Math.min(TOP_PANEL_HEIGHT-36,iY + 20) + 'px';
          topPageTip.innerHTML = htmlEncode(sHint);
          topPageTip.style.display = 'block';
          
          pageTipShown = setTimeout( function() {
            topPageTip.style.display = 'none';
            pageTipShown = 0;
          },3000);
        },500);  // avoid show it when double click
      }
    }
  },false);
  topPageMask.addEventListener('dblclick', function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    pageTipDbClick = true;
    setTimeout( function() {
      pageTipDbClick = false;
    },1000);
    
    var iStartPage = Math.floor(Math.max(0,0 - topPageList.offsetLeft) / THUMBNAIL_PAGE_WIDTH);
    var r = topPageMask.getBoundingClientRect(), iX = Math.max(0,event.clientX - r.left);
    var iPage = iStartPage + Math.floor(iX / THUMBNAIL_PAGE_WIDTH);
    var node = topPageList.children[iPage];
    
    if (node) {
      var sKey = node.getAttribute('keyid');
      if (sKey) {
        unselectWidget();
        setTimeout( function() {
          showRootPage(sKey,false);
          
          if (node.querySelector('canvas')) {
            setTimeout( function() {
              updateSceneThumb(sKey);
            },600); // try wait animate finished
          }
        },0);
      }
    }
  },false);
  for (var i=0,child; child=topPageTool.children[i]; i++) {
    if ((child.getAttribute('name') || '').indexOf('page_') == 0) continue; // ignore page_div, page_mask
    
    child.addEventListener('mouseover',pageNavMouseOver,false);
    child.addEventListener('mouseout',pageNavMouseOut,false);
    child.addEventListener('click',pageNavClick,false);
  }
  
  function createWidget(isSceneWdgt,sWdgtPath,dOpt,byShift,iX,iY) {
    if (!rootNode.createWidget) return;
    var option = dOpt.option;
    
    if (typeof option != 'object') {
      if (option === undefined && dOpt.dragUrl) { // {dragType,dragUrl,option}
        var sUrl = dOpt.dragUrl + '.json';
        getAsynRequest(sUrl, function(err,sJson) {
          if (err) {
            rootNode.instantShow('error: read JSON failed (' + sUrl + ').');
            console.log(err);
          }
          else {
            try {
              option = JSON.parse(sJson);
            }
            catch(e) {
              console.log(e);
              rootNode.instantShow('error: parse JSON failed (' + sUrl + ').');
            }
            if (option && option.name)
              nextStep();
          }
        });
      }
      // else, unknown error, ignore
    }
    else {
      if (option.name)
        nextStep();
    }
    
    function nextStep() {
      var bWdgt = option.widget, toolId = option.name || '';
      if (!Array.isArray(bWdgt)) return;
      if (toolId[0] == '/') toolId = toolId.slice(1);
      var bInfo = segmentOfToolId(toolId);
      if (bInfo)        // toolId: vendor/project/widgetName
        checkToolConfig(bInfo,null);
      else toolId = ''; // avoid set props['data-group.optid']
      
      checkFirstBackup();
      if (isSceneWdgt) bWdgt = option.scene || bWdgt; // option.scene or option.widget
      rootNode.createWidget(bWdgt,toolId,sWdgtPath,byShift,iX,iY, function(succ,node) {
        if (succ) {
          if (node && node.classList.contains('rewgt-scene')) {
            unselectWidget(); // unselect to refresh page thumbnail
            if (topPageTool.style.visibility != 'visible') // thumbnail list not in show
              rootNode.instantShow('create ScenePage successful.');
          }
          else if (node && node.parentNode.parentNode === rootNode && node.getAttribute('data-temp.type')) {
            unselectWidget(); // can not select new TempPanel widget directly
          }
          else setSelectByNode(node,true,false);
          afterModifyDoc(300,'');
        }
      });
    }
  }
  
  selectInfoBtn.addEventListener('mouseover', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'IMG') targ.style.borderColor = '#f8f8f8 #aaa #aaa #f8f8f8';
  },false);
  selectInfoBtn.addEventListener('mouseout', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'IMG') targ.style.borderColor = '#e8e8e8';
  },false);
  selectInfoBtn.addEventListener('click',eventNoPropagation,false);
  selectInfoBtn.addEventListener('dblclick', function(event) {
    event.stopPropagation();
    selectInfoBtn.style.display = 'none';
  },false);
  selectInfoBtn.addEventListener('dragstart', function(event) {
    var sPath = selectInfoBtn.getAttribute('title');
    if (sPath) {
      draggingId_ = operatorId = operatorId + 1;
      operatorStack.push([draggingId_,'dragging widget']);
      draggingNode_ = selectInfoBtn;  // selectInfoBtn.isSceneWdgt has set
      event.dataTransfer.setData('text/plain',sPath);
    }
  },false);
  selectInfoBtn.addEventListener('dragend', function(event) {
    if (draggingNode_) popOperator(draggingId_);
    draggingNode_ = null;
    haloFrame2.selectedInfo  = null;
    haloFrame2.style.display = 'none';
  },false);
  selectInfoName.addEventListener('click',eventNoPropagation,false);
  selectInfoSpan.addEventListener('click', function(event) {
    event.stopPropagation();  // avoid unselect widget
    var targ = event.target;
    if (targ.nodeName == 'SPAN') {
      var sRelPath = targ.getAttribute('title'), sPath = targ.getAttribute('path');
      if (sRelPath && sPath && rootNode.getWidgetNode) {
        rootNode.getWidgetNode(sRelPath,sPath, function(node) {
          setSelectByNode(node,false,false);
        });
      }
    }
  },false);
  selectInfoName.addEventListener('mousedown',eventNoPropagation,false);
  selectInfoName.addEventListener('mousemove',eventNoPropagation,false);
  selectInfoName.addEventListener('mouseup',eventNoPropagation,false);
  selectInfoSpan.addEventListener('mousedown',eventNoPropagation,false);
  selectInfoSpan.addEventListener('mousemove',eventNoPropagation,false);
  selectInfoSpan.addEventListener('mouseup',eventNoPropagation,false);
  var selectAddChild_ = 0;
  selectInfo.addEventListener('dragover', function(event) {
    if (selectAddChild_)
      clearTimeout(selectAddChild_);
    
    var isLinker = draggingNode_ && draggingNode_.getAttribute('name') == 'linker';
    selectAddChild_ = setTimeout( function() {
      selectInfoSpan.style.backgroundColor = '';
      selectInfoChild.style.display = 'none';
      selectAddChild_ = 0;
    },1000);
    selectInfoSpan.style.backgroundColor = '#f8f8f8';
    selectInfoChild.style.display = isLinker?'none':'inline';
  },false);
  function selectInfoDgOver(event) {
    if (transferHasType(event.dataTransfer,'application/json'))
      event.preventDefault();
    else {
      if (!draggingNode_) return;
      if (draggingNode_ === selectInfoBtn || draggingNode_.parentNode === floatButtons) {
        event.preventDefault();  // can drop
      }
    }
  }
  function selectInfoDgDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    
    var tarPath = selectInfoSpan.textContent;
    if (!tarPath) return;
    var byShift = !!event.shiftKey || event.target === selectInfoChild;
    var iX = 20 - mainFrameOffsetX - HALF_OF_CENTER_X, iY = 20 - mainFrameOffsetY - HALF_OF_CENTER_Y;
    
    if (transferHasType(event.dataTransfer,'application/json')) {  // pass text by 'text/plain'
      var dOpt = null, sJson = event.dataTransfer.getData('application/json') || '{}';
      try {
        dOpt = JSON.parse(sJson);
      }
      catch(e) { console.log(e); }
      if (!dOpt || (dOpt.dragType != 'template' && dOpt.dragType != 'image')) return;
      
      var isSceneWdgt = false;
      if (currRootPageType == 'ScenePage' && currRootPageKeyid) {
        var bPath_ = tarPath.split('.');
        if (bPath_.length == 3 || (!byShift && bPath_.length == 4))
          isSceneWdgt = true;  // result widget is: .body.scene.XX
      }
      
      if (dOpt.dragType == 'image') {
        var sUrl = dOpt.dragUrl, wd = dOpt.clientWidth, hi = dOpt.clientHeight;
        if (!sUrl) return;
        if (sUrl.indexOf(CURR_USR_PATH) == 0 && sUrl.length > CURR_USR_PATH.length)
          sUrl = sUrl.slice(CURR_USR_PATH.length);  // use relative path
        
        var dProp = {src:sUrl}, bWidget = ['Img',dProp,3];
        if (wd && hi)
          dProp.style = {width:wd+'px',height:hi+'px'};
        if (isSceneWdgt)
          bWidget = [['P',{klass:'default-large-small hidden-visible-auto','data-group.optid':'rewgt/shadow-slide/steps'},2],bWidget];
        
        createWidget(isSceneWdgt,tarPath,{option:{name:'Img',widget:bWidget}},byShift,iX,iY);
      }
      else {
        createWidget(isSceneWdgt,tarPath,dOpt,byShift,iX,iY);
        selectInfoBtn.style.display = 'none';
      }
      return;
    }
    
    if (!draggingNode_) return;
    
    var srcPath = event.dataTransfer.getData('text/plain');
    var sName = draggingNode_.getAttribute('name');
    if (!srcPath || !tarPath || !sName) return;
    
    if (sName == 'linker' && rootNode.bindLinker) {
      checkFirstBackup();
      rootNode.bindLinker(srcPath,tarPath, function(succ) {
        if (succ) {
          selectInfoBtn.style.display = 'none';
          afterModifyDoc(300,''); // delay 0.3 second, let dragend finished first
        }
      });
    }
    else if (sName == 'copy' || sName == 'move') {
      copyWidget_(srcPath,tarPath,byShift,sName == 'move',iX,iY, function(succ) {
        if (succ) selectInfoBtn.style.display = 'none';
      });
    }
  }
  selectInfoSpan.addEventListener('dragover',selectInfoDgOver,false);
  selectInfoSpan.addEventListener('drop',selectInfoDgDrop,false);
  selectInfoChild.addEventListener('dragover',selectInfoDgOver,false);
  selectInfoChild.addEventListener('drop',selectInfoDgDrop,false);
  
  topPanel.setWidgetInfo = function(bPath) {
    var sHtml = '';
    if (bPath) {
      bPath.forEach( function(item,idx) {  // item:[sType,sKeyid,bInfo,bLinkInfo]
        var sType = item[0], sSeg = item[1], bInfo = item[2], bLnk = item[3];
        if (idx > 0) sSeg = '.' + sSeg;
        
        if (sType == 'Template' && bInfo)  // Template must not be a Linker
          sHtml += '<span style="color:blue">' + htmlEncode(sSeg) + '</span>'
        else if (bLnk) {
          var sRelPath = bLnk[0], sFrom = bLnk[1];
          if (sRelPath && sFrom)
            sHtml += '<span title="' + htmlEncode(sRelPath,true) + '" path="' + htmlEncode(sFrom,true) + '" style="color:blue; text-decoration:underline">' + htmlEncode(sSeg) + '</span>'
          else sHtml += htmlEncode(sSeg);
        }
        else sHtml += htmlEncode(sSeg);
      });
    }
    selectInfoSpan.innerHTML = sHtml;
    selectInfoSpan.isSceneWdgt = (bPath && bPath.length == 3 && bPath[1][0] == 'ScenePage');
  };
  
  var firstShowPages_ = true;
  topPanel.listChildren = function(sPath) {
    var s = '', b = ['','#c00',-1,[],[]];
    if (rootNode.listChildren)
      b = rootNode.listChildren(sPath);  // if sPath is '', list root items
    
    var sWdgtName = b[0], sColor = b[1], iActive = b[2], items = b[3], bExt = b[4];
    items.forEach( function(item,idx) {
      if (idx == iActive)
        s += '<button style="color:' + sColor + '">';
      else s += '<button>';
      s += htmlEncode(item) + '</button>';  // item should no '"', '<', '>'  
    });
    childInfo.innerHTML = s;  // s maybe ''
    
    if (!sPath)
      sWdgtName = '';
    else sWdgtName = sWdgtName.replace(/</g,'').replace(/>/g,''); // <my.Widget> --> my.Widget
    selectInfoName.setAttribute('wdgt_name',sWdgtName);
    selectInfoName.innerHTML = sWdgtName? '<b>' + htmlEncode(sWdgtName) + '</b>:': '';
    
    if (!sPath && !firstShowPages_) listScenePages(bExt,false);
  };
  
  childInfo.addEventListener('click', function(event) {
    var targ = event.target;
    if (targ.nodeName != 'BUTTON') return;
    
    event.stopPropagation();
    mainMenuArea.hideMenu();
    
    var sName = targ.textContent;
    if (!sName) return;
    
    if (!currSelectedWdgt) {
      showRootPage(sName,true);
      return;
    }
    
    if (!rootNode.getWidgetNode) return;
    var b = getWidgetPath(currSelectedWdgt);
    if (b) {
      var sPath = b[0], bPath = b[2];
      rootNode.getWidgetNode(sName,sPath, function(node,isRef) {
        if (!node) return;
        if (isRef) {
          var isSceneWdgt = (bPath.length == 2 && bPath[1][0] == 'ScenePage');
          
          selectInfoBtn.setAttribute('src',creator.appBase()+'/res/linker.png');
          selectInfoBtn.setAttribute('name','linker');
          selectInfoBtn.setAttribute('title',sPath + '.' + sName);
          selectInfoBtn.isSceneWdgt = isSceneWdgt;
          selectInfoBtn.style.display = 'inline';
        }
        else setSelectByNode(node,false,true);
      });
    }
  },false);
  
  rulerTop = document.createElement('div');
  var iPosX = LEFT_PANEL_WIDTH + (HALF_OF_CENTER_X - 10) + mainFrameOffsetX;
  rulerTop.setAttribute('style','position:absolute; left:' + iPosX + 'px; top:' + (TOP_PANEL_HEIGHT - 10) + 'px; width:18px; height:9px; border:1px solid #aaa; background-color:rgba(192,192,192,0.7); cursor:ew-resize;');
  rulerTop.setAttribute('title','Drag to move x-axis');
  topPanel.appendChild(rulerTop);
  var rulerTopX = 0, rulerTopCanDrag = false, rulerTopDraged = false, rulerTopOpId = 0;
  rulerTop.addEventListener('click',eventNoPropagation,false);
  rulerTop.addEventListener('mousedown', function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    rulerTopCanDrag = true;
    rulerTopDraged = false;
    rulerTopX = event.clientX;
  },false);
  document.addEventListener('mousemove', function(event) {
    var iX = event.clientX;
    if (iX <= (LEFT_PANEL_WIDTH+20) || iX >= (window.innerWidth-RIGHT_PANEL_WIDTH-30)) return;
    
    if (!rulerTopDraged && rulerTopCanDrag) {
      if (Math.abs(iX - rulerTopX) >= 4) {
        rulerTopOpId = operatorId = operatorId + 1;
        operatorStack.push([rulerTopOpId,'moving viewport']);
        unselectWidget();
        rulerTopDraged = true;
        rulerTopCanDrag = false;
      }
    }
    
    if (rulerTopDraged) {
      event.stopPropagation();
      event.preventDefault();
      
      var detaX = iX - rulerTopX;
      if (detaX != 0) {
        rulerTopX = iX;
        mainFrameOffsetX += detaX;
        rootNode.style.left = mainFrameOffsetX + 'px';
        topPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH + mainFrameOffsetX) + 'px ' + (TOP_PANEL_HEIGHT - 28) + 'px';
        keepRulerPosition();
      }
    }
  },false);
  document.addEventListener('mouseup', function(event) {
    rulerTopCanDrag = false;
    if (rulerTopDraged) {
      popOperator(rulerTopOpId);
      rulerTopDraged = false;
      event.stopPropagation();
      event.preventDefault();
      
      var iX = event.clientX;
      if (iX <= (LEFT_PANEL_WIDTH+20) || iX >= (window.innerWidth-RIGHT_PANEL_WIDTH-30)) return;
      var detaX = iX - rulerTopX;
      if (detaX != 0) {
        mainFrameOffsetX += detaX;
        rootNode.style.left = mainFrameOffsetX + 'px';
        topPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH + mainFrameOffsetX) + 'px ' + (TOP_PANEL_HEIGHT - 28) + 'px';
        keepRulerPosition();
      }
      rulerRight.style.display = mainFrameOffsetX == 0? 'block': 'none';
    }
  },false);
  rulerRight = document.createElement('div');
  var sPosX = ( mainFrameWidth?
    'left:' + (LEFT_PANEL_WIDTH + mainFrameWidth - 20 + mainFrameOffsetX) + 'px':
    'left:' + (window.innerWidth - RIGHT_PANEL_WIDTH - 20) + 'px');
  rulerRight.setAttribute('style','position:absolute; ' + sPosX + '; top:' + (TOP_PANEL_HEIGHT - 10) + 'px; width:18px; height:9px; border:1px solid #aaa; background-color:rgba(192,192,255,0.7); cursor:ew-resize;');
  rulerRight.setAttribute('title','Drag to resize width');
  topPanel.appendChild(rulerRight);
  var rulerRightX = 0, rulerRightCanDrag = false, rulerRightDraged = false, rulerRightOpId = 0;
  rulerRight.addEventListener('click',eventNoPropagation,false);
  rulerRight.addEventListener('mousedown', function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    righPanelMask.style.display = 'block';  // cover iframe, so mousemove event can be captured
    rulerRightCanDrag = true;
    rulerRightDraged = false;
    rulerRightX = event.clientX;
  },false);
  document.addEventListener('mousemove', function(event) {
    var iX = event.clientX;
    if (iX <= (LEFT_PANEL_WIDTH+200) || iX >= (window.innerWidth-RIGHT_PANEL_WIDTH-20)) return;
    
    if (!rulerRightDraged && rulerRightCanDrag) {
      if (Math.abs(iX - rulerRightX) >= 4) {
        rulerRightOpId = operatorId = operatorId + 1;
        operatorStack.push([rulerRightOpId,'resizing viewport']);
        unselectWidget();
        rulerRightDraged = true;
        rulerRightCanDrag = false;
      }
    }
    
    if (rulerRightDraged) {
      event.stopPropagation();
      event.preventDefault();
      
      var detaX = iX - rulerRightX;
      if (detaX != 0) {
        if (!mainFrameWidth) mainFrameWidth = window.innerWidth - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH;
        rulerRightX = iX;
        mainFrameWidth += detaX;
        onDocResize();
      }
    }
  },false);
  document.addEventListener('mouseup', function(event) {
    rulerRightCanDrag = false;
    righPanelMask.style.display = 'none';
    if (rulerRightDraged) {
      popOperator(rulerRightOpId);
      rulerRightDraged = false;
      event.stopPropagation();
      event.preventDefault();
      
      var iX = event.clientX;
      if (iX <= (LEFT_PANEL_WIDTH+200) || iX >= (window.innerWidth-RIGHT_PANEL_WIDTH-20)) return;
      var detaX = iX - rulerRightX;
      if (detaX != 0) {
        if (!mainFrameWidth) mainFrameWidth = window.innerWidth - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH;
        mainFrameWidth += detaX;
        onDocResize();
      }
    }
  },false);
  
  window.addEventListener('resize',onDocResize,false);
  
  // step 5: add pages in right panel
  //---------------------------------
  rightPageList = document.createElement('div');
  rightPageList.setAttribute('style','position:relative; left:2%; top:0px; width:96%; height:60px; margin:4px 0px 0px 0px; line-height:1.1; font-size:13px; font-weight:300; background-color:#f4f4f4; overflow-y:auto; border-radius:3px;');
  rightPanel.appendChild(rightPageList);
  rightPageDiv = document.createElement('div');
  rightPageDiv.setAttribute('style','width:100%; height:' + Math.max(20,window.innerHeight-64) + 'px;');
  rightPanel.appendChild(rightPageDiv);
  righPanelMask = document.createElement('div');
  righPanelMask.setAttribute('style','display:none; position:absolute; left:0px; top:0px; width:100%; height:100%; z-index:3020;');
  rightPanel.appendChild(righPanelMask);
  
  rightPageList.addEventListener('click', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'BUTTON') {
      event.stopPropagation();
      if (!targ.style.color)
        rightPageDiv.showPage(targ.getAttribute('name'));
    }
  },false);
  rightPageDiv.addPage = function(name,url,desc) {
    for (var i=0,page; page=rightPageDiv.children[i]; i++) {
      if (page.getAttribute('name') == name) return;  // same page already exist, ignore
    }
    
    var pageBtn = document.createElement('button');
    pageBtn.setAttribute('name',name);
    pageBtn.textContent = desc || name;
    rightPageList.appendChild(pageBtn);
    
    var pageDiv = document.createElement('div');
    pageDiv.setAttribute('name',name);
    pageDiv.setAttribute('style','display:none; width:100%; height:100%;');
    rightPageDiv.appendChild(pageDiv);
    var frame = document.createElement('iframe');
    frame.setAttribute('frameborder','no');
    frame.setAttribute('border','0');
    frame.setAttribute('style','border:0px solid #ccc; width:100%; height:100%;');
    pageDiv.appendChild(frame);
    frame.setAttribute('src',url);
  };
  rightPageDiv.showPage = function(name) {
    for (var i=0,page; page=rightPageDiv.children[i]; i++) {
      page.style.display = page.getAttribute('name') == name? 'block': 'none';
    }
    for (var i=0,btn; btn=rightPageList.children[i]; i++) {
      btn.style.color = btn.getAttribute('name') == name? '#c00': '';
    }
  };
  rightPageDiv.rmvPage = function(name) {
    var sWaitShow = '';
    for (var i=0,page; page=rightPageDiv.children[i]; i++) {
      if (page.getAttribute('name') == name) {
        if (page.style.display != 'none') {
          if (i < rightPageDiv.children.length-1)
            sWaitShow = rightPageDiv.children[i+1].getAttribute('name');
          else if (i > 0) sWaitShow = rightPageDiv.children[i-1].getAttribute('name');
        }
        rightPageDiv.removeChild(page);
        
        for (var i2=0,btn; btn=rightPageList.children[i2]; i2++) {
          if (btn.getAttribute('name') == name) {
            rightPageList.removeChild(btn);
            break;
          }
        }
        break;
      }
    }
    if (sWaitShow) rightPageDiv.showPage(sWaitShow);
  };
  rightPageDiv.setPropEditor = function(cmdId,schema,opt,attrs) {
    var propFrame = rightPageDiv.querySelector('div[name="property"] > iframe');
    if (!propFrame || !propFrame.contentWindow) return;
    var dCmd = (cmdId && schema && opt? {method:'init',param:[cmdId,schema,opt,attrs]}: {method:'clear',param:[]});
    var s = '[PROJECT_NAME]' + JSON.stringify(dCmd);
    propFrame.contentWindow.postMessage(s,'*');
  };
  rightPageDiv.showPropEditor = function(showIt) {
    var propFrame = rightPageDiv.querySelector('div[name="property"] > iframe');
    if (!propFrame || !propFrame.contentWindow) return;
    var dCmd = {method:'setVisible',param:[!!showIt]};
    var s = '[PROJECT_NAME]' + JSON.stringify(dCmd);
    propFrame.contentWindow.postMessage(s,'*');
  };
  
  var bPage = [], noPropPg = false, noResPg = false, b = document.querySelectorAll('meta');
  for (var i=0,item; item=b[i]; i+=1) {
    if (item.getAttribute('property') == 'pinp:template') {
      var sPage = item.getAttribute('page'), sTxt = item.getAttribute('content');
      if (sPage == 'property') {
        if (!sTxt) noPropPg = true;
      }
      else if (sPage == 'resource') {
        if (!sTxt) noResPg = true;
      }
      else if (sPage && sTxt)
        bPage.push([sPage,decodeURI(sTxt)]);
    }
  }
  
  var appBasePath = location__('./').pathname;
  if (appBasePath[0] != '/') appBasePath = '/' + appBasePath; // avoid bug of IE10
  var listResUrl = creator.appBase()+'/list_resource.html?base=' + encodeURIComponent(appBasePath);
  var sFirstPg = '';
  if (!noPropPg) {
    sFirstPg = 'property';
    rightPageDiv.addPage('property',creator.appBase()+'/prop_page.html');
  }
  
  var sRepoInfo = '';
  if (creator.useHtmlProxy) {
    if (creator.repoName)
      sRepoInfo += '&repo=' + encodeURIComponent(creator.repoName);
    if (creator.accessToken)
      sRepoInfo += '&token=' + encodeURIComponent(creator.accessToken);
    if (creator.accessUser)
      sRepoInfo += '&user=' + encodeURIComponent(creator.accessUser);
    if (creator.accessSite)
      sRepoInfo += '&site=' + encodeURIComponent(creator.accessSite);
  }
  if (!noResPg) {
    if (!sFirstPg) sFirstPg = 'resource';
    var listResUrl2 = listResUrl + '&home=1';
    if (creator.resourceBase) listResUrl2 += '&url=' + encodeURIComponent(creator.resourceBase);
    if (creator.useHtmlProxy)
      listResUrl2 += '&upload=1' + sRepoInfo;
    rightPageDiv.addPage('resource',listResUrl2);
  }
  bPage.forEach( function(item) {
    if (!sFirstPg) sFirstPg = item[0];
    var listResUrl2 = listResUrl + '&url=' + encodeURIComponent(item[1]+'') + sRepoInfo;
    rightPageDiv.addPage(item[0]+'',listResUrl2);
  });
  
  getAsynRequest('$utils?cmd=get_config', function(err,sJson) {
    if (!err) {
      try {
        var d = JSON.parse(sJson);
        if (typeof d == 'object') {
          currEditorConfig = d;
          var bPage = d.resourcePages || [];
          bPage.forEach( function(item) {
            if (!sFirstPg) sFirstPg = item[0];
            rightPageDiv.addPage(item[0]+'',listResUrl + '&url=' + encodeURIComponent(item[1]+'') + sRepoInfo);
          });
          
          if (rightPageDiv.children.length >= (d.lotResource || 14)) { // too many pages, enlarge list area
            rightPageList.style.height = '96px';
            rightPageDiv.style.height = Math.max(20,window.innerHeight - 100) + 'px';
          }
        }
      }
      catch(e) {}
    }
    if (sFirstPg)
      rightPageDiv.showPage(sFirstPg);
  });
  
  window.addEventListener('message', function(msg) {
    try {
      if (typeof msg == 'object' && msg.data) {
        msg = msg.data;
        msg = JSON.parse(msg.slice(14)); // remove prefix '[PROJECT_NAME]'
      }
      else msg = null;
    }
    catch(e) {
      msg = null;
      console.log(e);
    }
    
    if (typeof msg == 'object') {
      if (msg.method == 'warning') {
        rootNode.instantShow(msg.param[0] + '');
      }
      else if (msg.method == 'onDialogLoad') {
        var frame = modalMaskMiddle.querySelector('iframe');
        if (!frame || frame.messengerOK) return;
        
        frame.messengerOK = true;
        if (frame.initDialog) frame.initDialog();
      }
      else if (msg.method == 'onDialogExit') {
        var closeIt = msg.param[0], saveIt = msg.param[1];
        if (closeIt) {
          modalMaskMiddle.innerHTML = '';
          rootNode.setDialogModal(false);
          rootNode.setDesignModal(false);
        }
        if (saveIt) {
          checkFirstBackup();
          if (rootNode.saveDesigner)
            rootNode.saveDesigner(closeIt,msg.param[2],msg.param[3]);
        }
      }
      else if (msg.method == 'saveProp') { // param:[cmdId,value]
        try {
          if (rootNode.updateWdgtProp) {
            var oldNode = currSelectedWdgt, nodeChanged = false;
            if (oldNode && oldNode.parentNode) {
              currSelectedWdgt = null;   // avoid refresh lead to unselected
              nodeChanged = true;
            }
            
            var schemaId = msg.param[0], dProp = msg.param[1], bRmv = msg.param[2] || [];
            bRmv.forEach( function(sKey) {
              dProp[sKey] = undefined;   // waiting to remove 
            });
            
            checkFirstBackup();
            rootNode.updateWdgtProp(schemaId,dProp, function(succ,newNode) {
              if (succ) {
                if (newNode && newNode.classList.contains('rewgt-scene')) {
                  var sName = getKeyFromNode2_(newNode);
                  unselectWidget();
                  if (sName) {
                    setTimeout( function() {
                      showRootPage(sName,false, function() {
                        setSelectByNode(newNode,false,false);
                      });
                    },0);
                  }
                }
                else {
                  if (nodeChanged && newNode)
                    setSelectByNode(newNode,false,false);
                }
                afterModifyDoc(300,'');  // no renew prop-editor, because modification come from editor
              }
              else {
                if (nodeChanged)
                  currSelectedWdgt = oldNode;  // restore
              }
            });
          }
        }
        catch(e) { console.log(e); }
      }
      else if (msg.method == 'dragEnd') {
        var sType = msg.param[0];
        if (sType == 'template' || sType == 'image') {
          haloFrame2.selectedInfo  = null;
          haloFrame2.style.display = 'none';
        }
      }
      else if (msg.method == 'saveConfigData') {
        var closeIt = msg.param[0], saveIt = msg.param[1], cfgData = msg.param[2];
        if (closeIt) {
          modalMaskMiddle.innerHTML = '';
          rootNode.setDialogModal(false);
          rootNode.setDesignModal(false);
        }
        if (saveIt && typeof cfgData == 'object') {
          postAsynRequest('$utils?cmd=save_config',cfgData, function(err,sInfo) {
            if (err) {
              rootNode.instantShow('error: save configure failed' + (sInfo?' ('+sInfo+').':'.'));
              console.log(err);
            }
            else rootNode.instantShow('save configure successful.');
          });
        }
      }
      else if (msg.method == 'closeDialog') {
        modalMaskMiddle.innerHTML = '';
        rootNode.setDialogModal(false);
        rootNode.setDesignModal(false);
      }
      // else, ignore
    }
  },false);
  
  // step 6.1: add halo frame and buttons
  //-----------------------------------
  haloFrameBlue = document.createElement('div');
  haloFrameBlue.setAttribute('style','display:none; position:absolute; z-index:3010; pointer-events:none; border:1px dashed blue;');
  document.body.appendChild(haloFrameBlue);
  instantDiv = document.createElement('div');
  instantDiv.setAttribute('style','display:none; position:absolute; left:0px; top:0px; z-index:6000;');
  document.body.appendChild(instantDiv);
  
  haloFrame = document.createElement('div');
  haloFrame.setAttribute('style','display:none; position:absolute; z-index:3020; pointer-events:none; border:1px dotted red;'); // 3010 --> 3020
  document.body.appendChild(haloFrame);
  document.body.appendChild(leftPanel);  // leftPanel cover haloFrame
  
  var b = [ ['Drag to move, double click to relay',creator.appBase()+'/res/move.png','move',true],    // draggable = true
    ['Drag to insert, double click to relay',creator.appBase()+'/res/copy.png','copy',true],
    ['Drag to link, double click to relay',creator.appBase()+'/res/linker.png','linker',true],
    ['Modify child styles',creator.appBase()+'/res/styles.png','styles',false],
    ['Edit text content',creator.appBase()+'/res/edit_txt.png','edit_txt',false],
    ['Select uplevel',creator.appBase()+'/res/goup.png','uplevel',false],
    ['Copy as linker',creator.appBase()+'/res/copy2.png','copy_lnk',false],
    ['Pop to top',creator.appBase()+'/res/up.png','up',false],
    ['Push to bottom',creator.appBase()+'/res/down.png','down',false],
  ];
  floatButtons = document.createElement('div');
  floatButtons.setAttribute('name','float-btn');
  floatButtons.setAttribute('style','position:absolute; visibility:hidden; padding:0 2px; line-height:15px; left:0px; top:-26px; width:' + (b.length * FLOAT_BUTTON_WIDTH + 2) + 'px; height:22px; border:1px solid #ddd; background-color:#f0f0f0; overflow:hidden; pointer-events:auto;');
  haloFrame.appendChild(floatButtons);
  b.forEach( function(item) {
    var sTitle = item[0], sUrl = item[1], sName = item[2], draggable = item[3];
    var btn = document.createElement('img');
    btn.setAttribute('style','width:16px; height:16px; border:1px solid #f0f0f0; margin:2px;');
    btn.setAttribute('src',sUrl);
    btn.setAttribute('title',sTitle);
    btn.setAttribute('name',sName);
    btn.setAttribute('draggable',draggable?'true':'false');
    floatButtons.appendChild(btn);
  });
  floatButtons.addEventListener('mousedown', function(event) {
    event.stopPropagation();
    if (event.target.getAttribute('draggable') != 'true')
      event.preventDefault();  // avoid select
  },false);
  floatButtons.addEventListener('mouseup', function(event) {
    event.stopPropagation();   // avoid affect body.onmouseXX onclick
  },false);
  floatButtons.addEventListener('mouseover', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'IMG')
      targ.style.borderColor = '#fff #aaa #aaa #fff';
  },false);
  floatButtons.addEventListener('mouseout', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'IMG')
      targ.style.borderColor = '#f0f0f0';
  },false);
  
  function selectUpLevel() {
    if (!currSelectedWdgt) return;
    var ownerNode = currSelectedWdgt.parentNode;
    if (!ownerNode) return;
    
    if (currSelectedWdgt.classList.contains('rewgt-scene')) {
      if (rootNode.resetRootShow) {
        rootNode.resetRootShow( function() {
          currRootPageType = '';
          currRootPageKeyid = '';
          unselectWidget();
        });
      }
      else unselectWidget();
      return;
    }
    
    if (!setSelectByNode(ownerNode,false,false)) {
      if (currSelectedWdgt.classList.contains('rewgt-panel')) {
        if (currSelectedWdgt.style.position != 'absolute')
          unselectWidget();
      }
    }
  }
  floatButtons.addEventListener('click', function(event) {
    if (nowInModal()) return;
    event.stopPropagation();
    
    var targ = event.target, sWdgtName = '', sWdgtPath = '', wdgtOption = null;
    if (targ.nodeName != 'IMG') return;
    var sName = targ.getAttribute('name');
    
    if ((sName == 'up' || sName == 'down') && rootNode.setWdgtZIndex) {
      var sceneNode = null;
      if (currSelectedWdgt && currSelectedWdgt.parentNode) {   // still available
        var b = getWidgetPath(currSelectedWdgt);
        if (b) {
          var bPath = b[2];
          if (bPath.length == 3 && bPath[1][0] == 'ScenePage') { // in ScenePage
            sWdgtPath = b[0];
            sceneNode = bPath[1][2][2];
          }
        }
      }
      if (!sceneNode) return;
      
      var items = [], iMax = 0, iMin = 0, maxNode = null, minNode = null, maxNum = 0, minNum = 0;
      for (var i=0,child; child=sceneNode.children[i]; i++) {
        var iLevel = parseInt(child.style.zIndex) || 0;
        if (iLevel >= 1000) iLevel -= 2000;
        if (i == 0) {
          iMax = iLevel; maxNode = child;
          iMin = iLevel; minNode = child;
        }
        else {
          if (iLevel >= iMax) { iMax = iLevel; maxNode = child; if (iLevel > iMax) maxNum = 0; maxNum += 1; }
          if (iLevel <= iMin) { iMin = iLevel; minNode = child; if (iLevel < iMin) minNum = 0; minNum += 1; }
        }
        items.push([iLevel,child]);
      }
      if (items.length == 0) return;
      
      // selected widget is directly under ScenePage, no need check under linker or not
      if (sName == 'up') {
        if (currSelectedWdgt === maxNode && maxNum == 1) return; // current already in top, and only one
        checkFirstBackup();
        rootNode.setWdgtZIndex(sWdgtPath,Math.min(999,iMax+1),upDownCallback);
      }
      else { // down
        if (currSelectedWdgt === minNode && minNum == 1) return; // current already in bottom, and only one
        checkFirstBackup();
        rootNode.setWdgtZIndex(sWdgtPath,Math.max(-999,iMin-1),upDownCallback);
      }
    }
    else if (sName == 'uplevel')
      selectUpLevel();
    else if (sName == 'styles' && rootNode.popDesigner) {
      if (currSelectedWdgt && currSelectedWdgt.parentNode) {
        var b = getWidgetPath(currSelectedWdgt);
        if (b) {
          sWdgtPath = b[0];
          sWdgtName = selectInfoName.getAttribute('wdgt_name');
          var dTool = { name:'default', title:'styles editor',
            url: creator.appBase()+'/edit_styles.html',
            halfScreen:false, clickable:true,
            width: 0.8, height: 0.8,
            get: getStyles, set: setStyles,
          };
          rootNode.popDesigner(sWdgtPath,'default',dTool,''); // baseUrl is ''
        }
      }
    }
    else if (sName == 'edit_txt' && rootNode.popDesigner) {
      if (currSelectedWdgt && currSelectedWdgt.parentNode && htmlEditable_(currSelectedWdgt)) {
        var b = getWidgetPath(currSelectedWdgt);
        if (b) {
          sWdgtPath = b[0];
          sWdgtName = selectInfoName.getAttribute('wdgt_name');
          var dTool = { name:'default', title:'text editor',
            url: creator.appBase()+'/edit_content.html',
            halfScreen:true, clickable:true,
            width: 0.8, height: 0.8,
            get: getTextContent, set: setTextContent,
          };
          rootNode.popDesigner(currSelectedWdgt,'default',dTool,''); // baseUrl is ''
        }
      }
    }
    else if (sName == 'copy_lnk') {
      if (currSelectedWdgt && currSelectedWdgt.parentNode) {
        var b = getWidgetPath(currSelectedWdgt);
        if (b) {
          clipTextState = 2;
          clipTextArea.value = '<div $="' + b[0] + '"></div>';
          clipTextArea.select();
          document.execCommand('copy');
          
          setTimeout( function() {
            floatButtons.style.visibility = 'hidden';
          },0);
        }
      }
    }
    
    function upDownCallback(succ) {
      if (succ)
        afterModifyDoc(1000,sWdgtPath);  // pending 1 second
    }
    
    function getStyles(comp) {
      var b = comp.props && rootNode.widgetSchema(comp,false,true);
      if (!b || b.length != 2) return [null,'',''];
      
      wdgtOption = b[1].wdgtOption || null;
      return [(wdgtOption && wdgtOption.linkStyles) || null,sWdgtPath,sWdgtName];
    }
    
    function setStyles(comp,outValue,beClose) {
      var trySave = false, savedWdgt = currSelectedWdgt;
      var changed = outValue[0], dNewStyles = outValue[1];
      if (changed && wdgtOption && typeof dNewStyles == 'object' && rootNode.saveCompStyles) {
        trySave = true;
        currSelectedWdgt = null; // current selected maybe renewed, avoid time-refresh lead to unselect
        rootNode.saveCompStyles(comp,wdgtOption,dNewStyles,callback);
      }
      else callback(false,null);
      
      function callback(succ,retNode) {
        var selectPath = sWdgtPath;
        if (trySave) currSelectedWdgt = savedWdgt;
        if (succ) {
          if (retNode) {
            var b = getWidgetPath(retNode), currPath = b?b[0]:'';
            if (currPath && currPath == sWdgtPath)   // if keyid renamed, auto unselect
              setSelectByNode(retNode,false,false);
            else selectPath = '';
          }
          afterModifyDoc(300,selectPath);
        }
      }
    }
    
    function getTextContent(node) {
      return [node.textContent,sWdgtPath,sWdgtName];
    }
    
    function setTextContent(node,outValue,beClose) {
      var trySave = false, savedWdgt = currSelectedWdgt;
      var changed = outValue[0], sNewTxt = outValue[1];
      if (changed && typeof sNewTxt == 'string' && rootNode.saveNodeContent) {
        trySave = true;
        currSelectedWdgt = null; // current selected maybe renewed, avoid time-refresh lead to unselect
        rootNode.saveNodeContent(sWdgtPath,sNewTxt,callback);
      }
      else callback(false,null);
      
      function callback(succ,retNode) {
        var selectPath = sWdgtPath;
        if (trySave) currSelectedWdgt = savedWdgt;
        if (succ) {
          if (retNode) {
            var b = getWidgetPath(retNode), currPath = b?b[0]:'';
            if (currPath && currPath == sWdgtPath)  // if keyid renamed, auto unselect
              setSelectByNode(retNode,false,false);
            else selectPath = '';
          }
          afterModifyDoc(300,selectPath);
        }
      }
    }
  },false);
  floatButtons.addEventListener('dblclick', function(event) {
    if (nowInModal()) return;
    var targ = event.target;
    if (targ.nodeName != 'IMG' || targ.getAttribute('draggable') != 'true') return;
    
    event.stopPropagation();
    var sSrc = targ.getAttribute('src'), sName = targ.getAttribute('name');
    if (sSrc) {
      selectInfoBtn.setAttribute('src',sSrc);
      if (sName) selectInfoBtn.setAttribute('name',sName);
      selectInfoBtn.setAttribute('title',selectInfoSpan.textContent);
      selectInfoBtn.isSceneWdgt = selectInfoSpan.isSceneWdgt;
      selectInfoBtn.style.display = 'inline';
    }
  },false);
  floatButtons.addEventListener('dragstart', function(event) {
    if (nowInModal()) return;
    var sPath = selectInfoSpan.textContent, targ = event.target;
    if (sPath && targ.nodeName == 'IMG' && targ.getAttribute('draggable') == 'true') {
      draggingId_ = operatorId = operatorId + 1;
      operatorStack.push([draggingId_,'dragging widget']);
      draggingNode_ = targ;
      draggingNode_.isSceneWdgt = selectInfoSpan.isSceneWdgt;
      event.dataTransfer.setData('text/plain',sPath);
    }
  },false);
  floatButtons.addEventListener('dragend', function(event) {
    if (draggingNode_) popOperator(draggingId_);
    draggingNode_ = null;
    haloFrame2.selectedInfo  = null;
    haloFrame2.style.display = 'none';
  },false);
  
  leftPanel.addEventListener('click', function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    unselectWidget();
  },false);
  topPanel.addEventListener('click', function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    unselectWidget();
  },false);
  
  setInterval( function() {
    if (absoWdgtInMove_) return;
    
    try {
      if (currSelectedWdgt && currSelectedWdgt.parentNode)
        renewSelectedFrame(currSelectedWdgt,null);  // renewSelectedFrame() is very light
      else {
        if (currSelectedWdgt)
          unselectWidget();
      }
    }
    catch(e) { }
  },250);
  
  document.addEventListener('mousedown',docOnMouseDown,false);
  document.addEventListener('mousemove',docOnMouseMove,false);
  document.addEventListener('mouseup',docOnMouseUp,false);
  
  haloFrame2 = document.createElement('div');
  haloFrame2.setAttribute('style','display:none; position:absolute; z-index:3010; pointer-events:none; border:1px solid red;');
  document.body.appendChild(haloFrame2);
  var floatKeyName = document.createElement('div');
  floatKeyName.setAttribute('style','position:absolute; left:0px; top:-24px; width:100px; height:22px; color:#c00;');
  haloFrame2.appendChild(floatKeyName);
  haloFrame2Ins = document.createElement('img');
  haloFrame2Ins.setAttribute('style','display:none; position:absolute; right:0px; bottom:0px; width:16px; height:16px;');
  haloFrame2Ins.setAttribute('src',creator.appBase()+'/res/insert.png');
  haloFrame2.appendChild(haloFrame2Ins);
  
  if (supportBackup)
    resetBackup();
  else {
    setTimeout( function() {
      rootNode.instantShow('warning: undo/redo not supported, your browser has no local storage.');
    },0);
  }
  
  // step 6.2: add multi-select halo frame
  //--------------------------------------
  haloFrameMult = document.createElement('div');
  haloFrameMult.setAttribute('style','display:none; position:absolute; left:0px; top:0px; z-index:3010; pointer-events:none;');
  document.body.appendChild(haloFrameMult);
  
  // step 7: define menu items
  //--------------------------
  mainMenuArea = document.createElement('ul');
  mainMenuArea.setAttribute('style','position:absolute; z-index:3022; display:none; left:30px; top:30px; min-width:60px; background-color:#f4f4f4; border:1px solid #eee; margin:0px; padding:2px; line-height:1.4; border-radius:4px; box-shadow:-2px 4px 4px rgba(0,0,0,0.2); list-style:none; -webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none');
  mainMenuArea.innerHTML = '<li name="list_prj" style="padding:0px 8px">List projects</li><li name="show_doc" style="padding:0px 8px">Online document</li>';
  document.body.appendChild(mainMenuArea);
  if (creator.useHtmlProxy) mainMenuArea.querySelector('li[name="list_prj"]').style.display = 'none';
  
  mainMenuArea.addEventListener('mouseover', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'LI') {
      targ.style.backgroundColor = 'blue';
      targ.style.color = 'white';
    }
  },false);
  mainMenuArea.addEventListener('mouseout', function(event) {
    var targ = event.target;
    if (targ.nodeName == 'LI') {
      targ.style.backgroundColor = '';
      targ.style.color = '';
    }
  },false);
  mainMenuArea.addEventListener('click', function(event) {
    event.stopPropagation();
    mainMenuArea.style.display = 'none';
    
    var targ = event.target;
    if (targ.nodeName == 'LI') {
      var sName = targ.getAttribute('name');
      if (sName == 'list_prj') {
        getAsynRequest('$utils?cmd=list_project', function(err,sJson) {
          if (err) {
            rootNode.instantShow('warning: query project failed.');
            return;
          }
          
          try {
            var bInner,bOuter, bList = JSON.parse(sJson);
            if (Array.isArray(bList) && bList.length == 2 && Array.isArray(bInner=bList[0]) && Array.isArray(bOuter=bList[1])) {
              var innerLen = bInner.length, bProj = bInner.concat(bOuter);
              var dTool = {
                name: 'default',
                title: 'list project',
                url: creator.appBase()+'/list_projects.html',
                halfScreen: true,
                width: 0.9,
                height: 0.9,
                clickable: false,
              };
              rootNode.showDesignDlg(0,dTool,bProj,'',innerLen);
            }
          }
          catch(e) { }  // ignore error
        });
      }
      else if (sName == 'show_doc') {
        var dTool = {
          name: 'default',
          title: 'online help',
          url: creator.appBase()+'/doc/index.html',
          halfScreen: false,
          width: 0.9,
          height: 0.9,
          clickable: false,
        };
        rootNode.showDesignDlg(0,dTool,{},'');
      }
    }
  },false);
  mainMenuArea.showMenu = function(iX,iY) {
    mainMenuArea.style.left = iX + 'px';
    mainMenuArea.style.top = iY + 'px';
    mainMenuArea.style.display = 'block';
  };
  mainMenuArea.hideMenu = function() {
    mainMenuArea.style.display = 'none';
  };
  
  // step 8: define modal mask
  //--------------------------
  modalMaskTop = document.createElement('div');
  modalMaskTop.setAttribute('style','position:absolute; z-index:3020; display:none; left:0px; top:0px; width:100%; height:100%');
  topPanel.appendChild(modalMaskTop);
  modalMaskLeft = document.createElement('div');
  modalMaskLeft.setAttribute('style','position:absolute; z-index:3020; display:none; left:0px; top:0px; width:100%; height:100%');
  leftPanel.appendChild(modalMaskLeft);
  modalMaskRight = document.createElement('div');
  modalMaskRight.setAttribute('style','position:absolute; z-index:3020; display:none; left:0px; top:0px; width:100%; height:100%');
  rightPanel.appendChild(modalMaskRight);
  modalMaskMiddle = document.createElement('div');
  modalMaskMiddle.isFull = true;
  modalMaskMiddle.setAttribute('style','position:absolute; z-index:3020; display:none; left:' + LEFT_PANEL_WIDTH + 'px; top:0px; width:' + (window.innerWidth-LEFT_PANEL_WIDTH) + 'px; height:100%; overflow:hidden');
  document.body.appendChild(modalMaskMiddle);
  
  var maskFrameCanMove_ = false, maskFrameInMove_ = false, maskMoveArea = null, maskFrame = null;
  var iMaskMoveX_ = 0, iMaskMoveY_ = 0;
  modalMaskMiddle.onmouseup = modalMaskRight.onmouseup = modalMaskLeft.onmouseup = modalMaskTop.onmouseup = function(event) {
    if (!maskFrameInMove_)
      event.stopPropagation();
  };
  modalMaskMiddle.addEventListener('mousemove', function(event) {
    event.stopPropagation();
    if (!maskFrameCanMove_) return;
    if (!maskMoveArea || !maskMoveArea.parentNode) return; // has removed
    if (!maskFrame || !maskFrame.parentNode) return; // has removed
    
    var detaX = event.clientX - iMaskMoveX_, detaY = event.clientY - iMaskMoveY_;
    if (!maskFrameInMove_) {
      if (Math.abs(detaX) >= 4 || Math.abs(detaY >= 4))
        maskFrameInMove_ = true;
    }
    if (maskFrameInMove_ && (detaX != 0 || detaY != 0)) {
      maskMoveArea.style.left = (maskMoveArea.offsetLeft + detaX) + 'px';
      maskMoveArea.style.top = (maskMoveArea.offsetTop + detaY) + 'px';
      maskFrame.style.left = (maskFrame.offsetLeft + detaX) + 'px';
      maskFrame.style.top = (maskFrame.offsetTop + detaY) + 'px';
      iMaskMoveX_ += detaX;
      iMaskMoveY_ += detaY;
    }
  },false);
  document.addEventListener('mouseup', function(event) {
    maskFrameCanMove_ = false;
    maskFrameInMove_ = false;
    if (maskMoveArea && maskMoveArea.parentNode) { // still avaiable
      maskMoveArea.style.width = '10px';
      maskMoveArea.style.height = '10px';
    }
  },false);
  
  modalMaskMiddle.ondblclick = modalMaskRight.ondblclick = modalMaskLeft.ondblclick = modalMaskTop.ondblclick = eventNoPropagation2;
  modalMaskMiddle.onmousedown = modalMaskRight.onmousedown = modalMaskLeft.onmousedown = modalMaskTop.onmousedown = eventNoPropagation2;
  modalMaskMiddle.onmousemove = modalMaskRight.onmousemove = modalMaskLeft.onmousemove = modalMaskTop.onmousemove = eventNoPropagation;
  modalMaskMiddle.onkeypress = modalMaskRight.onkeypress = modalMaskLeft.onkeypress = modalMaskTop.onkeypress = eventNoPropagation2;
  modalMaskMiddle.onkeydown = modalMaskRight.onkeydown = modalMaskLeft.onkeydown = modalMaskTop.onkeydown = eventNoPropagation2;
  modalMaskMiddle.onkeyup = modalMaskRight.onkeyup = modalMaskLeft.onkeyup = modalMaskTop.onkeyup = eventNoPropagation;
  modalMaskMiddle.ondragover = modalMaskRight.ondragover = modalMaskLeft.ondragover = modalMaskTop.ondragover = eventNoPropagation;
  modalMaskMiddle.ondrop = modalMaskRight.ondrop = modalMaskLeft.ondrop = modalMaskTop.ondrop = eventNoPropagation;
  
  rootNode.selectedWidget = function(node) {
    var old = currSelectedWdgt;
    if (node && typeof node.nodeName == 'string') // node is HTML node
      currSelectedWdgt = node;
    return old && old.parentNode? old: null;
  };
  rootNode.notifyBackup = function(wdgtPath,afterTm) {
    afterModifyDoc(afterTm || 300,wdgtPath);
  };
  rootNode.showDesignDlg = function(taskId,toolOpt,inValue,baseUrl,extraArg) {
    var iTotalWd = window.innerWidth - LEFT_PANEL_WIDTH, iTotalHi = window.innerHeight;
    if (toolOpt.halfScreen) {
      iTotalWd -= rootNode.frameInfo.rightWd;
      modalMaskMiddle.isFull = false;
      rightPageDiv.showPropEditor(false);
    }
    else modalMaskMiddle.isFull = true;
    modalMaskMiddle.style.width = iTotalWd + 'px';
    modalMaskMiddle.innerHTML = '';
    
    var sUrl, sTmp = toolOpt.url + '';
    if (sTmp[0] == '/' || (sTmp.indexOf('http') == 0 && (sTmp[4] == ':' || sTmp.slice(4,6) == 's:')))
      sUrl = sTmp;
    else {
      baseUrl = baseUrl || '';
      if (baseUrl && baseUrl.slice(-1) != '/')
        sUrl = baseUrl + '/' + sTmp;
      else sUrl = baseUrl + sTmp;
    }
    
    var fLeft = parseFloat(toolOpt.left), fTop = parseFloat(toolOpt.top);
    var iLeft, wd = parseFloat(toolOpt.width);
    if (typeof wd != 'number' || (wd >= 0.9999 && wd < 1) || wd <= 0) {
      wd = '100%';
      iLeft = 0;
    }
    else if (wd >= 1) {
      iLeft = Math.floor((iTotalWd - wd)/2);       // align to middle
      wd = wd + 'px';
    }
    else {
      iLeft = Math.floor(((1 - wd)/2) * iTotalWd); // align to middle
      if (typeof fLeft == 'number' && fLeft > 0 && fLeft < 1) {
        if (fLeft < 1 - wd)  // not out of range
          iLeft = Math.floor(fLeft * iTotalWd);
      }
      wd = (wd * 100) + '%';
    }
    var iTop, hi = parseFloat(toolOpt.height);
    if (typeof hi != 'number' || (hi >= 0.9999 && hi < 1) || hi <= 0) {
      hi = '100%';
      iTop = 0;
    }
    else if (hi >= 1) {
      iTop = Math.floor((iTotalHi - hi)/2);       // align to middle
      hi = hi + 'px';
    }
    else {
      iTop = Math.floor(((1 - hi)/2) * iTotalHi); // align to middle
      if (typeof fTop == 'number' && fTop > 0 && fTop < 1) {
        if (fTop < 1 - hi)  // not out of range
          iTop = Math.floor(fTop * iTotalHi);
      }
      hi = (hi * 100) + '%';
    }
    
    maskFrame = document.createElement('iframe');
    maskFrame.setAttribute('frameborder','no');
    maskFrame.setAttribute('border','0'); // for IE
    maskFrame.setAttribute('style','position:absolute; border:0px solid #e0e0e0; left:0px; top:0px; width:100%; height:100%;');
    maskFrame.style.left = iLeft + 'px'; maskFrame.style.top = iTop + 'px';
    maskFrame.style.width = wd; maskFrame.style.height = hi;
    var isFullScrn = true;
    if (wd != '100%' && hi != '100%') {
      isFullScrn = false;
      maskFrame.style.borderWidth = '1px';
      maskFrame.style.boxShadow = '-2px 8px 4px rgba(0,0,0,0.1)';
    }
    
    maskFrame.messengerOK = false;
    maskFrame.initDialog = function() {
      if (!maskFrame.messengerOK || !rootNode.pluginCss) return;
      try {
        var bParam = [taskId,inValue,rootNode.pluginCss()];
        if (extraArg !== undefined) bParam.push(extraArg);
        var s = '[PROJECT_NAME]' + JSON.stringify({method:'init',param:bParam});
        maskFrame.contentWindow.postMessage(s,'*');
      }
      catch(e) { console.log(e); }  // maybe meet invalid json-data
    };
    maskFrame.exitDialog = function() {
      if (maskFrame.messengerOK) {
        var s = '[PROJECT_NAME]' + JSON.stringify({method:'close',param:[true]});
        maskFrame.contentWindow.postMessage(s,'*');
      }
      else {  // close right now
        setTimeout( function() {
          modalMaskMiddle.innerHTML = '';
          rootNode.setDialogModal(false);
          rootNode.setDesignModal(false);
        },0);
      }
    };
    
    modalMaskMiddle.appendChild(maskFrame);
    var proxyPath = creator.useHtmlProxy? '$proxy.html': '$proxy';
    maskFrame.setAttribute('src',proxyPath+'?url='+encodeURIComponent(sUrl));
    
    if (!isFullScrn && !toolOpt.noMove) {
      maskMoveArea = document.createElement('div');
      maskMoveArea.setAttribute('style','position:absolute; left:' + iLeft + 'px; top:' + iTop + 'px; width:10px; height:10px;');
      var moveDiv = document.createElement('div');
      moveDiv.setAttribute('style','width:10px; height:10px; background-color:#00d; cursor:move;');
      maskMoveArea.appendChild(moveDiv);
      modalMaskMiddle.appendChild(maskMoveArea);
      
      moveDiv.onmousedown = function(event) {
        event.stopPropagation();
        event.preventDefault();
        
        if (!maskMoveArea || !maskMoveArea.parentNode) return;
        maskFrameCanMove_ = true; maskFrameInMove_ = false;
        maskMoveArea.style.width = '100%';
        maskMoveArea.style.height = '100%';
        iMaskMoveX_ = event.clientX;
        iMaskMoveY_ = event.clientY;
      };
    }
    rootNode.setDialogModal(true);
  };
  rootNode.setDesignModal = function(beModal) {
    if (!beModal) rootNode.closeModal();  // recreate .body.$pop
    
    rootNode.style.zIndex = beModal? '3012': '3000';  // use 3012 to cover haloFrame
    var css = beModal? 'block': 'none';
    modalMaskTop.style.display = css;
    modalMaskLeft.style.display = css;
    modalMaskRight.style.display = css;
    if (!beModal) rightPageDiv.showPropEditor(true);
  };
  rootNode.setDialogModal = function(beModal) {
    var css = beModal? 'block': 'none';
    if (!beModal) { // exit design modal also
      modalMaskTop.style.display = 'none';
      modalMaskRight.style.display = 'none';
      rootNode.style.zIndex = '3000';
    }
    modalMaskLeft.style.display = css;
    modalMaskMiddle.style.display = css;
  };
  
  modalMaskMiddle.onclick = modalMaskRight.onclick = modalMaskLeft.onclick = modalMaskTop.onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    
    var targ = event.target;
    setTimeout( function() {
      var closeDlg = false, frame = null, exitDesign = true;
      if (targ === modalMaskLeft || targ === modalMaskMiddle) {
        if (modalMaskMiddle.style.display != 'none') {
          frame = modalMaskMiddle.querySelector('iframe');
          if (frame && frame.exitDialog)
            closeDlg = true;
        }
        if (!closeDlg) rootNode.setDialogModal(false); // exit both dialog and design modal
      }
      else {
        var targ2 = targ.parentNode;
        while (targ2) {
          if (targ2 === modalMaskLeft || targ2 === modalMaskMiddle) {
            exitDesign = false; // under modalMaskLeft and modalMaskMiddle
            break;
          }
          else if (targ2 === document) break;
          targ2 = targ2.parentNode;
        }
      }
      
      if (closeDlg) // frame must not null
        frame.exitDialog();
      else {
        if (exitDesign) rootNode.setDesignModal(false);
      }
    },300); // delay some time, let dialog can catch onchange event
  };
  
  // step 9: define click-select, dragging selected widget, dblclick editing
  //------------------------------------------------------------------------
  var canSelectWdgt_ = true;
  rootNode.addEventListener('click', function(event) {
    if (nowInModal()) return;
    if (haloResizeType_ || haloJustResized_ || justMultiSelect_ || justMultiMoved_ || justSelectMoved_) return;
    if (rootNode.splitterMouseDn && rootNode.splitterMouseDn()) return;
    mainMenuArea.hideMenu();
    
    var targ = event.target;
    if (targ.nodeName == 'SELECT') return; // avoid select widget, since chrome dropdown for choosing
    
    if (event.shiftKey) {
      var wdgtNode = null, sKey = '';
      if (currRootPageType == 'ScenePage' && currRootPageKeyid) {
        while (targ) {
          if (targ === rootNode) break;
          var tmpNode = targ.parentNode;
          if (tmpNode && tmpNode.classList.contains('rewgt-center')) {
            var tmpNode2 = tmpNode.parentNode;
            if (tmpNode2 && tmpNode2.classList.contains('rewgt-scene')) {
              wdgtNode = targ;
              break;
            }
          }
          targ = tmpNode;
        }
        if (wdgtNode)  // add or remove widget in scene
          sKey = getKeyFromNode2_(wdgtNode)
      }
      if (sKey) { // find widget in current ScenePage, wdgtNode != null
        var multiChanged = false;
        if (haloFrameMult.style.display == 'block' && haloFrameMult.children.length >= 1) {
          var hasExist = false;
          for (var i=1,child; child = haloFrameMult.children[i]; i+=1) {
            if (sKey === child.getAttribute('keyid')) {
              haloFrameMult.removeChild(child);
              hasExist = true;
              break;
            }
          }
          if (hasExist) {
            if (haloFrameMult.children.length <= 1)
              haloFrameMult.style.display = 'none';
            else multiChanged = true; // need update clipTextArea
          }
          else {
            var r = wdgtNode.getBoundingClientRect();
            var div = document.createElement('div');
            div.setAttribute('keyid',sKey);
            div.setAttribute('style','position:absolute; border:1px dotted red; left:' + r.left + 'px; top:' + r.top + 'px; width:' + Math.max(0,r.width-2) + 'px; height:' + Math.max(0,r.height-2) + 'px;');
            haloFrameMult.appendChild(div);
            multiChanged = true;
          }
        }
        else {  // not in multi-select state, enter multi-select
          if (!currSelectedWdgt || currSelectedWdgt.classList.contains('rewgt-scene')) {
            var r = wdgtNode.getBoundingClientRect();
            var div = document.createElement('div');
            div.setAttribute('keyid',sKey);
            div.setAttribute('style','position:absolute; border:1px dotted red; left:' + r.left + 'px; top:' + r.top + 'px; width:' + Math.max(0,r.width-2) + 'px; height:' + Math.max(0,r.height-2) + 'px;');
            haloFrameMult.appendChild(div);
            haloFrameMult.style.display = 'block';
            multiChanged = true;
          }
        }
        
        if (multiChanged) {
          currSelectedIndex += 1;
          var bMultPath = [currRootPageKeyid];
          for (var i=1,child; child = haloFrameMult.children[i]; i += 1) {
            var sKey = child.getAttribute('keyid');
            if (sKey) bMultPath.push(sKey);
          }
          if (bMultPath.length > 1)
            makeWdgtStream(bMultPath);
        }
      }
      return;
    }
    
    var existInCurr = false;
    if (currSelectedWdgt && currSelectedWdgt.parentNode) {
      while (targ) {
        if (targ === rootNode) break;
        if (targ === currSelectedWdgt) {
          existInCurr = true;
          break;
        }
        targ = targ.parentNode;
      }
    }
    
    haloFrameMult.style.display = 'none';
    var b = getWidgetPath(event.target);
    if (b) { // warning: html-original event occured before any react-event, even if react in child
      // event.stopPropagation(); // can not stop propagation since react-widget response click
      // event.preventDefault();
      canSelectWdgt_ = true;
      if (existInCurr) {
        setTimeout( function() {
          nextStep();  // canSelectWdgt_ maybe false after double-click event
        },300);
      }
      else nextStep();
    }
    
    function nextStep() {
      if (!canSelectWdgt_) return;
      
      var sWdgtPath = b[0], currWdgt = b[1], bPath = b[2];
      renewSelectedFrame(currWdgt,bPath);
      topPanel.setWidgetInfo(bPath);
      topPanel.listChildren(sWdgtPath);
      
      haloFrame2.style.display = 'none'; // reset haloFrame2 if it in abnormal showing
    }
  },false);
  rootNode.addEventListener('dblclick', function(event) {  // try popup default plugin-editor
    if (nowInModal()) return;
    if (haloResizeType_ || haloJustResized_) return;
    if (!currSelectedWdgt || !currSelectedWdgt.parentNode) return;
    if (!rootNode.popDesigner) return;
    
    var targ = event.target, canFire = false;
    while (targ) {
      if (targ === rootNode) break;
      if (targ === currSelectedWdgt) {
        canFire = true;
        break;
      }
      targ = targ.parentNode;
    }
    if (!canFire) return;
    
    var b = getWidgetPath(currSelectedWdgt);
    if (b) {
      canSelectWdgt_ = false; // ignore click selecting
      
      // first, try external plugin editor
      var wdgtPath = b[0], bPath = b[2], sOptid = currSelectedWdgt.getAttribute('data-group.optid');
      var editFlag = targCanEditFlag(bPath);
      var noExpr = (editFlag == 0? targCanEditFlag(bPath,true) > 0: true);
      if (editFlag <= 1) {  // editFlag <= 1 means under 'some' or 'all'
        if (sOptid && sOptid.indexOf('/') > 0) { // sOptId must be 'xxx/xxx'
          var bTool = dTemplateTools_[sOptid];   // no need check !bTool and query from server, since it has done on widget selected
          if (Array.isArray(bTool)) {
            var withOrigin = bTool[2];
            bTool = bTool[1]; // bTool[0] is 'mono/all'
            if (bTool) {
              if (withOrigin && rootNode.getGroupOpt)
                bTool = joinOriginTool_(bTool,wdgtPath);
              var dTool = bTool.find( function(item){return item.name === 'default'} );
              if (dTool) { // exist default plugin editor
                var dTool_ = Object.assign({},dTool);
                if (!dTool_.get || !dTool_.set) {
                  var bFn = defaultPluginGetSet(wdgtPath,noExpr); // noExpr means not 'all'
                  dTool_.get = bFn[0]; dTool_.set = bFn[1];
                }
                rootNode.popDesigner(wdgtPath,'default',dTool_,dTool_.baseUrl || '');
                return;
              }
            }
          }
        }
      }
      
      // then, try builtin plugin editor
      if (editFlag <= 1 && rootNode.popDesigner(wdgtPath,'default')) // auto switch comp to node if nessesary
        return;
      
      // then, try show default json prop-editor
      if (editFlag >= 2) return;  // under 'none'
      
      var dTool = { name:'default', title:'default editor',
        url: creator.appBase()+'/edit_prop.html',
        halfScreen:true, clickable:false,
        width: 0.9, height: 0.9,
      };
      var bFn = defaultPluginGetSet(wdgtPath,noExpr);
      dTool.get = bFn[0]; dTool.set = bFn[1];
      rootNode.popDesigner(wdgtPath,'default',dTool,''); // baseUrl is '', show edit_prop.html
    }
  },false);
  rootNode.addEventListener('dragover', function(event) {
    if (nowInModal()) return;
    
    var srcFromScene, byShift = !!event.shiftKey, fromJson = false, isLinker = false;
    if (transferHasType(event.dataTransfer,'application/json')) {
      srcFromScene = false;
      fromJson = true;
    }
    else {
      if (!draggingNode_) return;
      if (draggingNode_ !== selectInfoBtn && draggingNode_.parentNode !== floatButtons) return;
      isLinker = draggingNode_.getAttribute('name') == 'linker';
      srcFromScene = draggingNode_.isSceneWdgt;
    }
    
    var bNodeList = [], b = getWidgetPath(event.target,bNodeList);
    if (b) {
      var sWdgtPath = b[0], currWdgt = b[1], bPath = b[2], sName = sWdgtPath.split('.').pop();
      var inScene = (bPath.length >= 2 && bPath[1][0] == 'ScenePage');
      
      var needAdjust = false;
      if (inScene && srcFromScene && !byShift) {
        var sceneInfo = bPath[1][2];
        sWdgtPath = sceneInfo[1];
        if (isLinker) {
          if (bNodeList.length >= 3) { // bPath has same length as bNodeList
            currWdgt = bNodeList[2];
            bPath = bPath.slice(0,3);
            sName = bPath[2][1];
            sWdgtPath = sWdgtPath + '.' + sName;
          }
          else return; // can not link to ScenePage
        }
        else { // copy or move
          if (bNodeList.length >= 3)
            needAdjust = true;
          else {
            currWdgt = sceneInfo[2];
            bPath = bPath.slice(0,2);
            sName = bPath[1][1];
            // sWdgtPath is '.body.scene'
          }
        }
      }
      else if (inScene && fromJson) {
        if (!isLinker && bNodeList.length >= 3)
          needAdjust = true;
      }
      
      if (needAdjust) { // try ignore background node
        var iTmp = bNodeList.length - 1;
        while (iTmp >= 2) {
          currWdgt = bNodeList[iTmp];
          if (currWdgt.getAttribute('data-is.ground')) { // ignore ground widget, try parent level
            iTmp -= 1;
            continue;
          }
          else {
            bPath = bPath.slice(0,iTmp+1);
            sName = bPath[iTmp][1];
            iTmp -= 1;
            
            sWdgtPath = sName;
            while (iTmp >= 0) {
              sWdgtPath = bPath[iTmp][1] + '.' + sWdgtPath;
              iTmp -= 1;
            }
            break;
          }
        }
      }
      
      var isSceneWdgt = (inScene && bPath.length == 3);
      var onSceneWdgt = (inScene && bPath.length == 2);
      var noTopLine = false, r = currWdgt.getBoundingClientRect();
      var hiSpace = Math.min(0,r.top - TOP_PANEL_HEIGHT); // 0 or negative value
      if (hiSpace < 0) {  // r.top is readonly, can not use: r.top = TOP_PANEL_HEIGHT
        noTopLine = true;
        r = {left:r.left, top:TOP_PANEL_HEIGHT, width:r.width, height:r.height + hiSpace};
      }
      
      haloFrame2.selectedInfo = [sWdgtPath,currWdgt,bPath];
      haloFrame2.style.left = r.left + 'px';
      haloFrame2.style.top = r.top + 'px';
      haloFrame2.style.width = Math.max(0,r.width-2) + 'px';
      haloFrame2.style.height = Math.max(0,r.height-2) + 'px';
      if (noTopLine)
        haloFrame2.style.borderColor = isSceneWdgt? 'transparent blue blue blue': 'transparent red red red';
      else haloFrame2.style.borderColor = isSceneWdgt? 'blue': 'red';
      haloFrame2.style.display = 'block';
      floatKeyName.innerHTML = htmlEncode(sName || '');
      if (!isLinker && r.width >= 20 && r.height >= 10 && !onSceneWdgt)
        haloFrame2Ins.style.display = 'block';
      else haloFrame2Ins.style.display = 'none';
      
      event.preventDefault();  // can drop
    }
    else {
      haloFrame2.style.display = 'none';
      if (fromJson) event.preventDefault();  // can drop
    }
  },false);
  rootNode.addEventListener('drop', function(event) {
    event.stopPropagation();
    event.preventDefault();
    
    var byShift = !!event.shiftKey, iX = event.clientX, iY = event.clientY;
    if (!byShift && haloFrame2Ins.style.display != 'none') {
      var r = haloFrame2Ins.getBoundingClientRect();
      if (iX >= r.left && iX < r.left + r.width && iY >= r.top && iY < r.top + r.height)
        byShift = true;  // mouse in area of haloFrame2Ins
    }
    iX = iX - LEFT_PANEL_WIDTH - mainFrameOffsetX - HALF_OF_CENTER_X;
    iY = iY - TOP_PANEL_HEIGHT - mainFrameOffsetY - HALF_OF_CENTER_Y;
    
    if (transferHasType(event.dataTransfer,'application/json')) {  // pass text by 'text/plain'
      var dOpt = null, sJson = event.dataTransfer.getData('application/json') || '{}';
      try {
        dOpt = JSON.parse(sJson);
      }
      catch(e) { console.log(e); }
      if (!dOpt || (dOpt.dragType != 'template' && dOpt.dragType != 'image')) return;
      var b = haloFrame2.style.display != 'none' && haloFrame2.selectedInfo;
      var tarPath = b? b[0]: null;
      
      if (dOpt.dragType == 'image') {
        var sUrl = dOpt.dragUrl, wd = dOpt.clientWidth, hi = dOpt.clientHeight;
        if (!sUrl) return;
        if (sUrl.indexOf(CURR_USR_PATH) == 0 && sUrl.length > CURR_USR_PATH.length)
          sUrl = sUrl.slice(CURR_USR_PATH.length);  // use relative path
        
        var isSceneWdgt = false;
        if (currRootPageType == 'ScenePage' && currRootPageKeyid) {
          if (!tarPath || tarPath.split('.').length <= 3) {
            tarPath = rootNode.frameInfo.rootName + '.' + currRootPageKeyid;
            byShift = true;
          }
          var bPath_ = tarPath.split('.');
          if (bPath_.length == 3 || (!byShift && bPath_.length == 4))
            isSceneWdgt = true;  // result widget is: .body.scene.XX
        }
        var dProp = {src:sUrl}, bWidget = ['Img',dProp,3];
        if (wd && hi)
          dProp.style = {width:wd+'px',height:hi+'px'};
        if (isSceneWdgt)
          bWidget = [['P',{klass:'default-large-small hidden-visible-auto','data-group.optid':'rewgt/shadow-slide/steps'},2],bWidget];
        
        createWidget(isSceneWdgt,tarPath,{option:{name:'Img',widget:bWidget}},byShift,iX,iY);
      }
      else {
        var isSceneWdgt = false;
        if (currRootPageType == 'ScenePage' && currRootPageKeyid && tarPath) {
          var bPath_ = tarPath.split('.');
          if (bPath_.length == 3 || (!byShift && bPath_.length == 4))
            isSceneWdgt = true;  // result widget is: .body.scene.XX
        }
        createWidget(isSceneWdgt,tarPath,dOpt,byShift,iX,iY);
      }
      return;
    }
    
    if (!draggingNode_) return;
    var sName = draggingNode_.getAttribute('name');
    var srcPath = event.dataTransfer.getData('text/plain');
    var b = haloFrame2.selectedInfo;
    if (sName && srcPath && b) {
      var sWdgtPath = b[0], currWdgt = b[1], bPath = b[2];
      
      if (sName == 'linker' && rootNode.bindLinker) {
        checkFirstBackup();
        rootNode.bindLinker(srcPath,sWdgtPath, function(succ) {
          if (succ) {
            selectInfoBtn.style.display = 'none';
            afterModifyDoc(300,'');  // delay 0.3 second
          }
        });
      }
      else if (sName == 'copy' || sName == 'move') {
        copyWidget_(srcPath,sWdgtPath,byShift,sName == 'move',iX,iY, function(succ) {
          if (succ) selectInfoBtn.style.display = 'none';
        });
      }
    }
  },false);
  
  // step 10: define action for tool buttons
  //---------------------------------------
  
  // define action for menu button
  topTool.querySelector('img[name="menu"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.showMenu(event.clientX,event.clientY);
  };
  
  // define action for thumbnail button, switch pages/widgets
  switchPageList_ = function() {
    if (topPageList.style.display == 'none') {
      if (firstShowPages_) {
        firstShowPages_ = false;
        if (topPageList.children.length == 0 && rootNode.topmostNode && rootNode.topmostNode())
          unselectWidget();
      }
      topPageTool.style.visibility = 'visible'; // let topPageTool.clientWidth available
      topPageList.style.display= 'block';
    }
    else {
      topPageList.style.display = 'none';  // hide all thumbnail even if anyChild.style.visibility is 'visible'
      topPageTool.style.visibility = 'hidden';
    }
  }
  topTool.querySelector('img[name="thumb"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    switchPageList_();
  };
  
  // define action for switch button, hide or show top and right panel
  leftTool.querySelector('img[name="switch"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    
    if (rootNode.frameInfo.topHi) {
      rootNode.frameInfo.topHi = 0;
      rootNode.frameInfo.rightWd = 0;
      leftPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH - 14) + 'px ' + mainFrameOffsetY + 'px';
      topPanel.style.display = 'none';
      rightPanel.style.display = 'none';
    }
    else {
      rootNode.frameInfo.topHi = TOP_PANEL_HEIGHT;
      rootNode.frameInfo.rightWd = RIGHT_PANEL_WIDTH;
      leftPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH - 14) + 'px ' + (TOP_PANEL_HEIGHT+mainFrameOffsetY) + 'px';
      topPanel.style.display = 'block';
      rightPanel.style.display = 'block';
    }
    onDocResize();
  };
  
  // define action for align button, design area align to center or left
  leftTool.querySelector('img[name="align"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    
    if (mainFrameOffsetX != 0 || mainFrameOffsetY != 0) {
      mainFrameOffsetX = 0;
      mainFrameOffsetY = 0;
      rulerRight.style.display = 'block';
      
      rootNode.style.left = mainFrameOffsetX + 'px';
      rootNode.style.top = mainFrameOffsetY + 'px';
      leftPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH - 14) + 'px ' + ((rootNode.frameInfo.topHi == 0?0:TOP_PANEL_HEIGHT) + mainFrameOffsetY) + 'px';
      topPanel.style.backgroundPosition = (LEFT_PANEL_WIDTH + mainFrameOffsetX) + 'px ' + (TOP_PANEL_HEIGHT - 28) + 'px';
      keepRulerPosition();
      
      rootNode.frameInfo.bottomHi = mainFrameOffsetY;  // restore design area
      if (rootNode.refreshFrame) rootNode.refreshFrame();
    }
  };
  
  // define action for delete button
  function removeSelects(confirmIt) {
    var rmvInfo = null;
    if (currRootPageType == 'ScenePage' && currRootPageKeyid && haloFrameMult.style.display == 'block' && haloFrameMult.children.length > 1) {
      var bList = [currRootPageKeyid];
      for (var i=1,child; child = haloFrameMult.children[i]; i += 1) {
        var sKey = child.getAttribute('keyid');
        if (sKey) bList.push(sKey);
      }
      if (bList.length > 1)
        rmvInfo = bList;
    }
    else {
      if (!currSelectedWdgt || !currSelectedWdgt.parentNode) return;
      var b = getWidgetPath(currSelectedWdgt);
      if (b) {
        var editFlag = targCanEditFlag(b[2]); // if under linker, editFlag is 2
        if (editFlag >= 1) { // editFlag >= 1: 'some' or 'none'
          rootNode.instantShow('remove selected widget disallowed.');
          return;
        }
        rmvInfo = b[0];
      }
    }
    
    if (rmvInfo)
      doRemove(rmvInfo,currSelectedWdgt,confirmIt);
    
    function doRemove(rmvInfo,selectedWdgt,confirmIt) { // currSelectedWdgt may changed when confirm() called
      if (!rootNode.removeWidget) return;
      if (confirmIt && !confirm('do you want delete selected widget?')) return;
      
      var nextPageKeyid = '';   // try get next page's keyid
      if (currRootPageType == 'ScenePage' && selectedWdgt && selectedWdgt.classList.contains('rewgt-scene')) {
        var meetCurr = false;
        for (var i=0,node; node = topPageList.children[i]; i++) {
          var sTmp = node.getAttribute('keyid');
          if (sTmp) {
            if (sTmp == currRootPageKeyid)
              meetCurr = true;
            else {
              nextPageKeyid = sTmp;
              if (meetCurr) break;
            }
          }
        }
      }
      
      checkFirstBackup();
      rootNode.removeWidget(rmvInfo, function(changed) {
        if (changed) {
          unselectWidget();     // both for ScenePage and others
          if (nextPageKeyid) {  // try focus to next ScenePage
            setTimeout( function() {
              showRootPage(nextPageKeyid,false);
            },300);
          }
          afterModifyDoc(300,'');
        }
      });
    }
  }
  leftTool.querySelector('img[name="delete"]').onmousedown = function(event) { // use mousedown event to avoid unselect widget
    event.stopPropagation();
    event.preventDefault();
    mainMenuArea.hideMenu();
    removeSelects(true);
  };
  
  // define action for undo button
  leftTool.querySelector('img[name="undo"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    undoBackup()
  };
  
  // define action for redo button
  leftTool.querySelector('img[name="redo"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    redoBackup();
  };
  
  // define action for save button
  function saveBtnClick(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    if (!rootNode.getDocHtml) return;
    // if (!canUndoRedo('save')) return;  // no need check, backup undo may delay
    
    var sHtml = rootNode.getDocHtml(creator.useHtmlProxy);
    if (!sHtml) {
      rootNode.instantShow('warning: dump document failed.');
      return;
    }
    
    if (creator.useHtmlProxy)
      creator.savePages(sHtml,nextStep);
    else {
      var data = {page:currEditHtmlPage, html:sHtml};
      postAsynRequest('$save?page=' + encodeURIComponent(currEditHtmlPage),data,nextStep);
    }
    
    function nextStep(err,sInfo) {
      if (err) {
        rootNode.instantShow('error: save document failed' + (sInfo?' ('+sInfo+').':'.'));
        console.log(err);
      }
      else rootNode.instantShow('save document successful.');
    }
  }
  leftTool.querySelector('img[name="save"]').onclick = saveBtnClick;
  
  // define action for open button
  leftTool.querySelector('img[name="open"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    
    getAsynRequest('$utils?cmd=list_page', function(err,sJson) {
      if (err) {
        rootNode.instantShow('warning: query HTML file list failed.');
        return;
      }
      
      try {
        var bPage = JSON.parse(sJson);
        if (Array.isArray(bPage)) {
          var dTool = {
            name: 'default',
            title: 'open pages',
            url: creator.appBase()+'/list_pages.html',
            halfScreen: true,
            // icon: '', noMove: false,
            // left: 0.05, top: 0.05,
            width: 0.9,
            height: 0.9,
            clickable: false,
            // get, set
          };
          var sPrjUrl = location__('./').href;
          rootNode.showDesignDlg(0,dTool,{currProj:sPrjUrl,currFile:currEditHtmlPage,pages:bPage},'');
        }
      }
      catch(e) { }  // ignore error
    });
  };
  
  // define action for config button
  leftTool.querySelector('img[name="config"]').onclick = function(event) {
    event.stopPropagation();
    mainMenuArea.hideMenu();
    
    var dTool = {
      name: 'default',
      title: 'edit configure',
      url: creator.appBase()+'/edit_config.html',
      halfScreen: false,
      // icon: '', noMove: false,
      // left: 0.05, top: 0.05,
      width: 0.8,
      height: 0.9,
      clickable: false,
      // get, set
    };
    rootNode.showDesignDlg(0,dTool,currEditorConfig,'');
  };
  
  // define clip text copy
  var clipLastCutList_ = null, clipLastCutText_ = '';
  clipTextArea = document.createElement('textarea');
  clipTextArea.setAttribute('style','position:absolute; left:0px; top:0px; width:24px; height:24px; overflow:hidden');
  document.body.appendChild(clipTextArea);
  
  clipTextArea.addEventListener('copy', function(event) {
    clipLastCutList_ = null;      // avoid next cut something
    var clipReady = clipTextState == 2 && clipTextArea.value;
    if (clipReady && clipTextSelectId == currSelectedIndex) {
      // event.preventDefault();  // use default clipboard-copy
      setTimeout( function() {
        rootNode.instantShow('copy successful, wait to paste...');
      },0);
    }
    else {
      event.preventDefault();  // copy nothing
      if (clipReady && clipTextSelectId != currSelectedIndex)
        rootNode.instantShow('copy selected widget failed.');
    }
  },false);
  clipTextArea.addEventListener('paste', function(event) {
    var rmvPath = clipLastCutList_;
    clipLastCutList_ = null; // avoid next cut again when paste
    
    // step 1: get pasted text
    event.preventDefault();  // ignore default paste text
    var types = event.clipboardData.types, sText = '';
    for (var i=0,item; item=types[i]; i+=1) {
      if (item == 'Text' || item.indexOf('text/') == 0) {
        sText = event.clipboardData.getData(item);
        break;
      }
    }
    
    // step 2: get target path
    var sTargPath = '';
    if (sText) {
      if (!currSelectedWdgt && currRootPageType == 'ScenePage' && currRootPageKeyid)
        sTargPath = rootNode.frameInfo.rootName + '.' + currRootPageKeyid;
      else if (sText && currSelectedWdgt && currSelectedWdgt.parentNode) {
        var b = getWidgetPath(currSelectedWdgt);
        if (b) sTargPath = b[0];
      }
    }
    
    // step 3: insert paste objects, remove selected if is cut
    if (sTargPath && rootNode.pasteWidget) {
      if (rmvPath) {
        if (sText !== clipLastCutText_) rmvPath = null;
        clipLastCutText_ = '';
      }
      
      checkFirstBackup();
      rootNode.pasteWidget(sTargPath,sText,rmvPath, function(succNum,unselect,retNode) {
        if (succNum) {
          rootNode.instantShow(succNum + ' widget(s) pasted.');
          if (unselect)
            unselectWidget();
          if (retNode) {
            setTimeout( function() {
              setSelectByNode(retNode,false,false);
            },300);
          }
          afterModifyDoc(300,'');
        }
      });
    }
  },false);
  clipTextArea.addEventListener('cut', function(event) {
    var clipReady = clipTextState == 2 && clipTextArea.value;
    if (clipTextSelectId != currSelectedIndex) {
      event.preventDefault();
      if (clipReady)
        rootNode.instantShow('cut selected widget failed.');
      return;
    }
    
    if (clipReady && typeof clipTextPaths == 'string') {
      var b = getWidgetPath(clipTextPaths);
      if (b) {
        var editFlag = targCanEditFlag(b[2]);
        if (editFlag >= 1) { // 'some' or 'none'
          event.preventDefault();
          rootNode.instantShow('cut selected widget disallowed.');
          return;
        }
      }
    }
    
    if (clipReady) { // single-selected or multi-selected
      // event.preventDefault();  // use default cut text to clipboard
      clipLastCutList_ = clipTextPaths;
      clipLastCutText_ = clipTextArea.value;
      setTimeout( function() {
        rootNode.instantShow('cut successful, wait to paste...');
      },0);
    }
  },false);
  clipTextArea.addEventListener('keydown', function(event) {
    var code = event.keyCode;
    if ((event.ctrlKey || event.metaKey) && (code == 67 || code == 86 || code == 88))
      return;  // ctrl/cmd + c/v/x    // avoid prevent default, for copy/paste/cut
    
    if (code == 83 && (event.ctrlKey || event.metaKey)) {  // cmd + s or ctrl + s
      event.preventDefault(); // avoid trigger default browser's saving
      saveBtnClick(event);
      return;
    }
    
    event.preventDefault();
    if (event.shiftKey) {
      if (code == 37) {      // shift+left, shift uplevel
        selectUpLevel();
      }
      else if (code == 39) { // shift+right, select first child
        if (currSelectedWdgt && currSelectedWdgt.parentNode && rootNode.firstChildOf) {
          var b = getWidgetPath(currSelectedWdgt);
          if (b) {
            var node = rootNode.firstChildOf(b[0],true);
            if (node) setSelectByNode(node,false,false);
          }
        }
      }
      else if (code == 38 || code == 40) { // shift+up/down, select prev/next
        var b;
        if (currSelectedWdgt && currSelectedWdgt.parentNode && currRootPageType == 'ScenePage' && currRootPageKeyid && rootNode.listPageChild && (b=getWidgetPath(currSelectedWdgt))) {
          var bPath = b[2], sSelectKey = bPath.length >= 3? bPath[2][1]: '';
          var b = rootNode.listPageChild(currRootPageKeyid);
          if (b.length) {
            bSort = [];  // [iY,iX,sKey,node]
            b.forEach( function(item) {
              var node = item[1], r = node.getBoundingClientRect();
              if (r.width == 0 && r.height == 0) return; // ignore none-area widget
              bSort.push([r.top,r.left,item[0],node]);
            });
            bSort.sort( function(a,b) {
              if (a[0] == b[0])
                return a[1] - b[1];
              else return a[0] - b[0];
            });
            
            var waitSelect = null;
            if (sSelectKey) {
              for (var i=0,item; item=bSort[i]; i += 1) {
                if (item[2] == sSelectKey) {
                  if (code == 38)
                    waitSelect = i > 0? bSort[i-1][3]: item[3];
                  else waitSelect = i < bSort.length-1? bSort[i+1][3]: item[3];
                  break;
                }
              }
            }
            if (!waitSelect) {
              if (code == 38)
                waitSelect = bSort[0][3];
              else waitSelect = bSort[bSort.length-1][3];
            }
            setSelectByNode(waitSelect,false,false);
          }
        }
      }
    }
    else if (event.altKey) {
      if (code == 8) {       // backspace
        removeSelects(false);
      }
      else {
        var iMoveX = 0, iMoveY = 0;
        if (code == 37)  // alt+left, can not use ctrl+left which reserved in Mac
          iMoveX = -1;
        else if (code == 38)  // alt+up
          iMoveY = -1;
        else if (code == 39)  // alt+right
          iMoveX = 1;
        else if (code == 40)  // alt+down
          iMoveY = 1;
        
        if ((iMoveX || iMoveY) && currRootPageType == 'ScenePage' && currRootPageKeyid) {
          if (haloFrameMult.style.display == 'block' && haloFrameMult.children.length > 1)
            multiMoveSceneObj(currRootPageKeyid,iMoveX,iMoveY);
          else if (currSelectedWdgt && currSelectedWdgt.parentNode) {
            var b = getWidgetPath(currSelectedWdgt);
            if (b) {
              var sWdgtPath = b[0];
              checkFirstBackup();
              b = rootNode.moveSceneWdgt(sWdgtPath,iMoveX,iMoveY);
              if (b.length == 1) { // success, b is [sKey]
                if (iMoveX) haloFrame.style.left = (parseFloat(haloFrame.style.left) + iMoveX) + 'px';
                if (iMoveY) haloFrame.style.top = (parseFloat(haloFrame.style.top) + iMoveY) + 'px';
                afterModifyDoc(3000,sWdgtPath);
              }
            }
          }
        }
      }
    }
  },false);
}

setTimeout( function() {
  var checkReadyNum_ = 0;
  hookReadyEvent( function(succ) {
    if (!succ || typeof W != 'object' || !W.$creator) {
      alert('load shadow-widget system failed!');
      return;
    }
    
    var styNode = document.createElement('style');
    styNode.innerHTML = '@-moz-document url-prefix(){button{padding:0px;}}';
    document.head.appendChild(styNode);
    
    creator = W.$creator;
    initCreator();
    
    if (W.$main) {
      W.$main.inDesign = true;
      if (rootNode.keyOfNode)
        getKeyFromNode_ = rootNode.keyOfNode;
    }
    
    if (rootNode.onlyScenePage && rootNode.onlyScenePage()) {
      var bdNode = rootNode.topmostNode();
      if (!bdNode) return;
      for (var i=0,node; node=bdNode.children[i]; i++) {
        if (node.classList.contains('rewgt-scene')) { // try show first ScenePage
          var sName = getKeyFromNode2_(node);
          if (sName) {
            setTimeout( function() {
              nextStep(sName);
            },800);
          }
          return;
        }
      }
    }
    
    function nextStep(sName) {
      showRootPage(sName,false);
      setTimeout( function() {
        switchPageList_();  // show thumbnail list
      },2000);  // wait ready for cloning thumb nodes
    }
  });
  
  function hookReadyEvent(callback) {
    if (!callback) return;
    checkReadyNum_ += 1;
    if (checkReadyNum_ > 180) {   // timeout: 90 seconds
      setTimeout( function() {
        callback(false);
      },0);
      return;
    }
    
    setTimeout( function() {
      if (window.W && W.$main && W.$main.inRunning)
        callback(true);
      else hookReadyEvent(callback);
    },500);
  }
},800);

})();
