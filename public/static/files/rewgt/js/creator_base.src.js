// creator_base.js

if (!window.W) { window.W = new Array(); W.$modules = [];} W.$modules.push( function(require,module,exports) {

var React = require('react');
var ReactDOM = require('react-dom');

var createClass_ = React.createClass;
if (!createClass_) console.log('fatal error: invalid React.createClass'); // before v15.5

var W = require('shadow-widget');
var main = W.$main, utils = W.$utils, T = W.$templates, creator = W.$creator;

var RefDiv__  = T.Div._createClass(null);
var RefSpan__ = T.Span._createClass(null);

var namedColor_ = { aliceblue:'#f0f8ff',antiquewhite:'#faebd7',aqua:'#00ffff',aquamarine:'#7fffd4',
  azure:'#f0ffff',beige:'#f5f5dc',bisque:'#ffe4c4',black:'#000000',
  blanchedalmond:'#ffebcd',blue:'#0000ff',blueviolet:'#8a2be2',
  brown:'#a52a2a',burlywood:'#deb887',cadetblue:'#5f9ea0',chartreuse:'#7fff00',
  chocolate:'#d2691e',coral:'#ff7f50',cornflowerblue:'#6495ed',cornsilk:'#fff8dc',
  crimson:'#dc143c',cyan:'#00ffff',darkblue:'#00008b',darkcyan:'#008b8b',
  darkgoldenrod:'#b8860b',darkgray:'#a9a9a9',darkgreen:'#006400',darkkhaki:'#bdb76b',
  darkmagenta:'#8b008b',darkolivegreen:'#556b2f',darkorange:'#ff8c00',darkorchid:'#9932cc',
  darkred:'#8b0000',darksalmon:'#e9967a',darkseagreen:'#8fbc8f',darkslateblue:'#483d8b',
  darkslategray:'#2f4f4f',darkturquoise:'#00ced1',darkviolet:'#9400d3',deeppink:'#ff1493',
  deepskyblue:'#00bfff',dimgray:'#696969',dodgerblue:'#1e90ff',feldspar:'#d19275',
  firebrick:'#b22222',floralwhite:'#fffaf0',forestgreen:'#228b22',fuchsia:'#ff00ff',
  gainsboro:'#dcdcdc',ghostwhite:'#f8f8ff',gold:'#ffd700',goldenrod:'#daa520',
  gray:'#808080',green:'#008000',greenyellow:'#adff2f',honeydew:'#f0fff0',
  hotpink:'#ff69b4',indianred:'#cd5c5c',indigo:'#4b0082',ivory:'#fffff0',
  khaki:'#f0e68c',lavender:'#e6e6fa',lavenderblush:'#fff0f5',lawngreen:'#7cfc00',
  lemonchiffon:'#fffacd',lightblue:'#add8e6',lightcoral:'#f08080',lightcyan:'#e0ffff',
  lightgoldenrodyellow:'#fafad2',lightgrey:'#d3d3d3',lightgreen:'#90ee90',lightpink:'#ffb6c1',
  lightsalmon:'#ffa07a',lightseagreen:'#20b2aa',lightskyblue:'#87cefa',lightslateblue:'#8470ff',
  lightslategray:'#778899',lightsteelblue:'#b0c4de',lightyellow:'#ffffe0',lime:'#00ff00',
  limegreen:'#32cd32',linen:'#faf0e6',magenta:'#ff00ff',maroon:'#800000',
  mediumaquamarine:'#66cdaa',mediumblue:'#0000cd',mediumorchid:'#ba55d3',mediumpurple:'#9370d8',
  mediumseagreen:'#3cb371',mediumslateblue:'#7b68ee',mediumspringgreen:'#00fa9a',mediumturquoise:'#48d1cc',
  mediumvioletred:'#c71585',midnightblue:'#191970',mintcream:'#f5fffa',mistyrose:'#ffe4e1',
  moccasin:'#ffe4b5',navajowhite:'#ffdead',navy:'#000080',oldlace:'#fdf5e6',
  olive:'#808000',olivedrab:'#6b8e23',orange:'#ffa500',orangered:'#ff4500',
  orchid:'#da70d6',palegoldenrod:'#eee8aa',palegreen:'#98fb98',paleturquoise:'#afeeee',
  palevioletred:'#d87093',papayawhip:'#ffefd5',peachpuff:'#ffdab9',peru:'#cd853f',
  pink:'#ffc0cb',plum:'#dda0dd',powderblue:'#b0e0e6',purple:'#800080',
  red:'#ff0000',rosybrown:'#bc8f8f',royalblue:'#4169e1',saddlebrown:'#8b4513',
  salmon:'#fa8072',sandybrown:'#f4a460',seagreen:'#2e8b57',seashell:'#fff5ee',
  sienna:'#a0522d',silver:'#c0c0c0',skyblue:'#87ceeb',slateblue:'#6a5acd',
  slategray:'#708090',snow:'#fffafa',springgreen:'#00ff7f',steelblue:'#4682b4',
  tan:'#d2b48c',teal:'#008080',thistle:'#d8bfd8',tomato:'#ff6347',
  turquoise:'#40e0d0',violet:'#ee82ee',violetred:'#d02090',wheat:'#f5deb3',
  white:'#ffffff',whitesmoke:'#f5f5f5',yellow:'#ffff00',yellowgreen:'#9acd32',
};

var containNode_ = null;
var topmostWidget_ = null;

/*
var supportedSvgAttr_ = {
  clipPath: 1, cx: 1, cy: 1, d: 1, dx: 1, dy: 1,
  fill: 1, fillOpacity: 1, fontFamily: 1, fontSize: 1,
  fx: 1, fy: 1, gradientTransform: 1, gradientUnits: 1,
  markerEnd: 1, markerMid: 1, markerStart: 1,
  offset: 1, opacity: 1, patternContentUnits: 1, patternUnits: 1,
  points: 1, preserveAspectRatio: 1,
  r: 1, rx: 1, ry: 1,
  spreadMethod: 1, stopColor: 1, stopOpacity: 1, stroke: 1, strokeDasharray: 1,
  strokeLinecap: 1, strokeOpacity: 1, strokeWidth: 1,
  textAnchor: 1, transform: 1, version: 1, viewBox: 1,
  x1: 1, x2: 1, x: 1, xlinkActuate: 1, xlinkArcrole: 1,
  xlinkHref: 1, xlinkRole: 1, xlinkShow: 1, xlinkTitle: 1, xlinkType: 1,
  xmlBase: 1, xmlLang: 1, xmlSpace: 1, y1: 1, y2: 1, y: 1,
};

function getLinkFullPath_(entry,sPath_) {
  var targ = entry.widget;
  if (!targ) return '';
  var b = pathLevelInfo_(sPath_);
  if (!b) return '';
  
  var sPath = b[0], iLevel = b[1], isSibling = b[2];
  if (isSibling) {  // iLevel = 0 or iLevel = -1
    targ = targ.parent;
    if (iLevel < 0) targ = targ && targ.parent;  // start with '//', maybe sPath=''
    if (targ)
      targ = sPath? targ.W(sPath): targ;
    return targ? targ.getPath(): '';
  }
  else if (iLevel == -1) {
    return '.' + sPath;
  }
  else { // iLevel >= 1
    while (targ && iLevel > 0) {
      var comp = targ && targ.component;
      if (comp && comp.props['isNavigator.']) {
        iLevel -= 1;
        if (iLevel == 0) break;
      }
      
      var targ_ = targ.parent;
      if (!targ_) {  // meet topmost
        iLevel -= 1;
        targ = W;
        break;
      }
      else targ = targ_; 
    }
    
    if (targ && iLevel == 0) { // targ maybe W (W.component is undefined)
      targ = sPath?targ.W(sPath):targ;
      if (targ)
        return targ.getPath();
    }
    return '';
  }
}  */

function getCompByPath2_(entry,sPath_,callback) { // entry is component object, auto show template
  function doCallback(targ) {
    targ = targ && targ.component;
    if (callback) callback(targ);
  }
  
  var b = creator.pathLevelInfo(sPath_);
  if (!b) return doCallback(null);
  
  var sPath = b[0], iLevel = b[1], isSibling = b[2];
  if (isSibling) {
    if (entry) {
      var targ = entry.widget, owner = targ; // default according to entry
      if (iLevel < 0) owner = owner && owner.parent; // start with '//', maybe sPath=''
      if (owner)
        return getLevelByLevel(owner,sPath);
    }
  }
  else if (iLevel == -1) {
    if (sPath)
      return getLevelByLevel(null,sPath);
  }
  else { // iLevel >= 1
    if (!entry) return doCallback(null);
    
    var targ = entry.widget;
    while (targ && iLevel > 0) {
      var comp = targ && targ.component;
      if (comp && comp.props['isNavigator.']) {
        iLevel -= 1;
        if (iLevel == 0) break;
      }
      
      var targ_ = targ.parent;
      if (!targ_) {  // meet topmost
        iLevel -= 1;
        targ = W;
        break;
      }
      else targ = targ_; 
    }
    
    if (targ && iLevel == 0) { // targ maybe W (W.component is undefined)
      if (sPath)
        return getLevelByLevel(targ,sPath);
      else return doCallback(targ);
    }
  }
  return doCallback(null);
  
  function getLevelByLevel(wdgt,sPath) {
    var b = sPath.split('.');
    if (!wdgt) {
      var sItem = b.shift();  // '.body.xx'  -->  ['','body','xx']
      if (!sItem) sItem = b.shift();
      
      wdgt = topmostWidget_;
      var wdgtObj = wdgt && wdgt.component;
      if (!wdgtObj || wdgtObj.$gui.keyid != sItem)
        return doCallback(null);
    }
    return oneLoop();
    
    function oneLoop() {
      var sItem = b.shift();
      if (!sItem) return doCallback(wdgt);
      
      wdgt = wdgt[sItem];
      var childObj = wdgt && wdgt.component;
      if (!childObj) return doCallback(null);
      
      var iFlag = childObj.props['isTemplate.'];
      if (!iFlag || (childObj.state.style || {}).display != 'none')
        return oneLoop();
      
      var displayCss = iFlag == 3? 'inline': (iFlag == 2? 'block': 'flex');
      var dStyle = Object.assign({},childObj.state.style,{display:displayCss});
      childObj.setState({style:dStyle},oneLoop);
    }
  }
}

function getRelativePath_(srcPath,tarPath,inParent) {
  var iPadding = inParent? 0: 1;  // inParent means srcPath is parent of real source
  
  // step 1: get same part of path
  var b1 = srcPath.split('.'), b2 = tarPath.split('.');
  var iLen = Math.min(b1.length,b2.length), sSame = '', iSameNum = 0;
  for (var i=0; i < iLen; i++) {
    var s1 = b1[i], s2 = b2[i];
    if (s1 != s2) {
      if (i > 0) {
        iSameNum = i;
        sSame = b1.slice(0,iSameNum).join('.');
      }
      break;
    }
  }
  
  // step 2: adjust target path, try use shortcut under last NavXXX
  var sLnkPath = '';
  if (sSame) {
    if (b2.length >= b1.length && iSameNum >= 2 && iSameNum == (b1.length-iPadding)) { // reference by sibling
      sLnkPath = '//' + b2.slice(iSameNum).join('.');
    }
    else {
      var hasNav = false, sRelative = '';
      var sameWdgt = W.W(sSame);
      while (sameWdgt) {
        var obj = sameWdgt.component;
        if (!obj) {
          if (sameWdgt !== W)
            sRelative = '';
          break;
        }
        
        if (obj.props['isNavigator.']) {
          hasNav = true;
          break;
        }
        sRelative = '.' + obj.$gui.keyid + sRelative;
        sameWdgt = sameWdgt.parent;
      }
      if (!sRelative && !hasNav) return '';  // !!failed
      
      sLnkPath = b2.slice(iSameNum).join('.');
      if (hasNav) {
        if (sRelative)
          sRelative = sRelative.slice(1);  // remove first '.'
        if (sRelative)
          sLnkPath = './' + sRelative + (sLnkPath?'.':'') + sLnkPath;
        else sLnkPath = './' + sLnkPath;
      }
      else { // !hasNav, sRelative is full-path
        if (sRelative)
          sLnkPath = sRelative + (sLnkPath?'.':'') + sLnkPath;
      }
    }
  }
  else sLnkPath = tarPath;
  
  return sLnkPath;
}

function getCompSchema_(comp,dTypeInfo,noExpr) {
  var template = comp._;
  if (!template || !template._getGroupOpt) return null;  // failed
  
  var props,AStyle, sLink = undefined;
  var bStated = template._statedProp || [];
  var bSilent = template._silentProp || [];
  var hasHtmlTxt = template._htmlText;
  
  // step 1: prepare wdgtOption
  var sTempName = template._className;
  var wdgtOption = { name:sTempName, desc:template._classDesc,
    option:template._getGroupOpt(comp), doc:template._docUrl || '',
    linkPath:'', linkStyles:null,
  };
  var isLinker = false, iFlag = 0; // 0:panel, 1:unit(div), 2:paragraph, 3:inline
  sLink = comp.state['data-unit.path'];
  if (sLink !== undefined) {
    iFlag = 2; isLinker = true;
    sTempName = 'RefDiv';
  }
  else {
    sLink = comp.state['data-span.path'];
    if (sLink !== undefined) {
      iFlag = 3; isLinker = true;
      sTempName = 'RefSpan';
    }
  }
  if (!isLinker) {
    if (comp.props['childInline.']) {
      if (utils.hasClass(comp,'rewgt-unit'))
        iFlag = 2;
      else iFlag = 3;
    }
    else {
      if (utils.hasClass(comp,'rewgt-unit'))
        iFlag = 1;
      // else iFlag = 0;
    }
  }
  else {  // isLinker
    wdgtOption.linkPath = sLink;
    wdgtOption.linkStyles = comp.props.styles;
  }
  wdgtOption.flag = iFlag;
  
  // step 2: process linker props
  var keyid_, sKeyid_;
  if (isLinker) {
    var oldProp = comp.props['link.props'];
    if (oldProp) { // has linked, use old props
      props = Object.assign({},oldProp);
      AStyle = props.style || {};
      delete props.style;
      delete props.styles;
      
      keyid_ = props['keyid.']; // edit old props, not linker itself
      if (typeof keyid_ == 'string') {
        if (keyid_[0] == '$') { // adjust keyid
          keyid_ = keyid_.slice(1);
          var iTmp = parseInt(keyid_);
          if ((iTmp + '') == keyid_) {
            props['keyid.'] = iTmp;
            sKeyid_ = keyid_ = '';  // avoid editing number in GUI
          }
          else sKeyid_ = props['keyid.'] = keyid_;
        }
        else sKeyid_ = keyid_;
      }
      else sKeyid_ = keyid_ = '';
    }
    else return null;  // system error, unknown format
  }
  else if (comp.props['isReference.'])
    return null; // ignore unlinked RefDiv/RefSpan
  else { // not linker
    props = Object.assign({},comp.props);
    AStyle = props.style || {};
    delete props.style;
    
    keyid_ = comp.$gui.keyid;
    if (typeof keyid_ != 'string')
      sKeyid_ = keyid_ = '';
    else sKeyid_ = keyid_;
  }
  
  // step 3: replace stated props, remove silent props
  bStated.forEach( function(item) {
    if (props.hasOwnProperty(item))
      props[item] = comp.state[item];
  });
  bSilent.forEach( function(item) {
    delete props[item];
  });
  
  if (hasHtmlTxt) {
    var sHtml = isLinker? props['html.']: comp.state['html.'];
    if (sHtml && typeof sHtml == 'string')
      wdgtOption['html.'] = sHtml;
  }
  delete props['html.'];
  
  delete props.children;
  delete props['hasStatic.'];
  props.key = sKeyid_;
  
  // step 4: prepare prop.* (data-*/aria-* renewed)
  var propsEx = {}, hasEx = false;
  var bProp = Object.keys(props), propIndex = 100;
  var dProp = {key:{propertyOrder:propIndex, type:'string', default:keyid_}};
  bProp.forEach( function(item) {
    var iPos = item.indexOf('.');
    if (iPos >= 0) {
      if (iPos == item.length - 1) return;  // ignore 'xxx.'
      propsEx[item] = props[item];
      hasEx = true;
      return;
    }
    
    if (noExpr && item[0] == '$') return;   // ignore $expr
    
    var value = props[item], isDataset = false;
    if (value === undefined) return;    // ignore 'undefined' value
    if (item.indexOf('data-') == 0 || item.indexOf('aria-') == 0)
      isDataset = true;
    
    if (item == 'klass') {
      if (typeof value != 'string') return;
      var bCls = value.split(/[^-_a-zA-Z0-9]+/);
      if (bCls.length == 0) return;
      
      propIndex += 1;
      dProp['klass'] = { type:'array', options:{disable_array_reorder:true},
        propertyOrder:propIndex, items:{type:'string',format:'classname'}, default:bCls,
      };
      return;
    }
    
    var bInfo = dTypeInfo[item], sType = 'any', iOrder = -1, bEnum = null, sDesc = '';
    if (bInfo) {  // bInfo = [iOrder,sType,bEnum,sDesc] or []
      if (bInfo.length == 0) return;  // hide this attribute
      iOrder = bInfo[0];
      sType = bInfo[1] || 'any';
      bEnum = bInfo[2] || null;
      sDesc = bInfo[3] || '';
    }
    
    if (iOrder < 0) {
      propIndex += 1;
      iOrder = propIndex;
    }
    var dCfg = {propertyOrder:iOrder,default:value}, matched = true;
    if (bEnum) dCfg.enum = bEnum;
    if (sDesc) dCfg.description = sDesc;
    
    if (isDataset) {
      dCfg.type = 'string';  // force as string type
      if (typeof value != 'string')
        dCfg.default = JSON.stringify(value);
    }
    else if (value === null || sType == 'any') {  // match any type, no dCfg.type
      if (item[0] == '$')    // force as string type: $expr
        dCfg.type = 'string';
      
      var valType = typeof value;
      if (valType == 'string') {
        if (!value)
          dCfg.type = 'string';    // take empty string as 'string'
      }
      else {
        if (valType == 'function') {
          console.log('warning: can not edit function property (' + item + ')');
          return;
        }
        dCfg.default = JSON.stringify(value);
      }
    }
    else if (sType == 'integer') {
      var iTmp = parseInt(value);
      if (iTmp+'' === value+'') {  // is correct integer
        dCfg.type = sType;
        dCfg.default = iTmp;
      }
      else matched = false;  // if mismatch, no dCfg.type
    }
    else if (sType == 'number' || sType == 'boolean' || sType == 'array' || sType == 'object') {
      if (sType == 'array' && Array.isArray(value))
        dCfg.type = sType;
      else if (typeof value == sType)
        dCfg.type = sType;
      else matched = false;  // if mismatch, no dCfg.type
    }
    else {
      if (typeof value == 'string') {
        dCfg.type = 'string';
        if (sType != 'string')
          dCfg.format = sType;
      }
      else matched = false;  // if mismatch, no dCfg.type
    }
    
    if (!matched) {
      if (typeof value != 'string')
        dCfg.default = JSON.stringify(value);
      console.log('warning: property (' + item + ') is not match to expected type (' + sType + ').' );
    }
    dProp[item] = dCfg;
  });
  if (hasEx) wdgtOption.propsEx = propsEx;
  
  // step 5: prepare style
  var bStyle = Object.keys(AStyle);
  if (bStyle.length) {
    var dStyle = {};
    propIndex += 1;
    dProp.style = {type:'object', properties:dStyle, propertyOrder:propIndex};
    bStyle.sort();
    bStyle.forEach( function(item) {
      var iPos, dCfg = {type:'string', default:AStyle[item]+''};
      if (item == 'color' || ((iPos=item.indexOf('Color')) > 0 && iPos + 5 == item.length)) {
        var sColor = convertColor(dCfg.default.trim());
        if (sColor) {  // success convert
          dCfg.default = sColor;
          dCfg.format = 'color';
        }
      }
      dStyle[item] = dCfg;
    });
  }
  
  return {type:'object', title:sTempName+' - '+sKeyid_, properties:dProp, wdgtOption:wdgtOption};
  
  function convertColor(s) {
    if (!s) return '';
    var sRet = namedColor_[s];
    if (sRet) return sRet;
    
    var ch = s[0];
    if (ch == '#' && s.length == 4)      // #abc  -->  #aabbcc
      return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    else if (ch == '#' && s.length == 7) // #rrggbb
      return s;
    else if (s.slice(0,3) == 'rgb') {
      s = s.slice(3).trim();
      if (s[0] == '(' && s.slice(-1) == ')') {
        var b = s.slice(1,-1).split(',');
        if (b.length == 3) {
          sRet = '#' + ('0' + parseInt(b[0]).toString(16)).slice(-2);
          sRet += ('0' + parseInt(b[1]).toString(16)).slice(-2);
          sRet += ('0' + parseInt(b[2]).toString(16)).slice(-2);
          return sRet;
        }
      }
    }
    return '';
  }
  
  function getWidgetTempInfo(t) {
    return [t._className,t._statedProp || [],t._silentProp || [],t._defaultProp || {}, t._htmlText];
  }
}

main.$$onLoad.push( function(callback) {
  containNode_ = creator.containNode_;      // must be exists
  topmostWidget_ = creator.topmostWidget_;
  
  if (utils.instantShow !== containNode_.instantShow) {
    setTimeout( function() {
      if (typeof containNode_.instantShow == 'function')
        utils.instantShow = containNode_.instantShow;  // overwrite old function
    },300);
  }
  
  containNode_.closeModal = function(callback) {
    function doCallback() {
      if (callback) callback();
    }
    
    var topObj = topmostWidget_ && topmostWidget_.component;
    if (!topObj) return doCallback();
    
    var ele = React.createElement(createClass_(T.Panel._extend()), {
      'hookTo.':topmostWidget_, key:'$pop', 'keyid.':'$pop',
      left:0, top:0, width:0, height:0,
      style:{position:'absolute', zIndex:3016, overflow:'visible'}, 
    });
    topObj.setChild('$pop',ele,doCallback);
  };
  
  containNode_.topmostNode = function() {  // return node of '.body'
    var comp = topmostWidget_ && topmostWidget_.component;
    if (comp)
      return comp.getHtmlNode();
    else return null;
  };
  
  containNode_.pluginCss = function() {
    var bRet = [], b = W.$css || [];
    b.forEach( function(item) {
      if (Array.isArray(item)) {
        var sFlag = item[0], sCss = item[1];
        if (sCss && (sFlag == 'pseudo' || sFlag == 'basic' || sFlag == 'lazy'))
          bRet.push(sCss+'');
      }
    });
    return bRet;
  };
  
  containNode_.getWidgetNode = function(sPath,sRefBy,callback) { // auto show template when meet
    var retIsRef = false;
    function doCallback(ret) {
      if (callback) callback(ret,retIsRef);
    }
    
    if (!sPath) return doCallback(null);
    
    var refObj = null;
    var ch = sPath[0], isAbs = (ch == '.' || ch == '/') && sPath[1] != '/'; // start with: .seg  or /seg
    if (sRefBy && !isAbs) {
      refObj = W.W(sRefBy);
      refObj = refObj && refObj.component;
      if (!refObj) return doCallback(null);
    }
    getCompByPath2_(refObj,sPath, function(targObj) {
      // if (!targObj) console.log('warning: can not find widget (' + sPath + ').'); // no need logout
      var ret = null;
      if (targObj) {
        retIsRef = !!targObj.props['isReference.'];
        ret = targObj.getHtmlNode();
      }
      doCallback(ret);
    });
  };
  
  containNode_.getDocHtml = function(childOfBody) {
    var bTree = [];
    containNode_.dumpTree(bTree=[]);
    if (bTree.length == 1) {
      var body = bTree[0];
      
      if (childOfBody) {
        var sRet = '', firstItem = body[0];
        if (Array.isArray(firstItem)) {
          for (var i=1,item; item=body[i]; i++) {
            var s = containNode_.streamTree(item,0,1);
            if (s) sRet += s;
          }
        }
        return sRet;
      }
      
      else return containNode_.streamTree(body,0,1);
    }
    return '';
  };
  
  containNode_.resetRootShow = function(callback) {
    var targ = topmostWidget_, targObj = targ && targ.component;
    if (targObj) {
      var bComp = targObj.$gui.comps, bDelay = [];
      bComp.forEach( function(child) {
        if (!child) return;
        var sKey = utils.keyOfElement(child);
        if (!sKey || sKey == '$pop') return;
        
        var item = targ[sKey];
        item = item && item.component;
        if (item) {
          if ((item.state.style || {}).position == 'absolute')
            item.setState({style:Object.assign({},item.state.style,{display:'none'})});
          else {
            var sCss = utils.hasClass(item,'rewgt-panel')? 'flex': 'block';
            bDelay.push([item,sCss]);  // hide first, then delay to show
          }
        }
      });
      bDelay.forEach( function(item) { // then show visible
        var sCss = item[1];
        item = item[0];
        item.setState({style:Object.assign({},item.state.style,{display:sCss})});
      });
    }
    
    if (callback) {
      setTimeout( function() {
        callback();
      },0);
    }
  };
  
  containNode_.showRootPage = function(sName,callback) {
    var sNodeType = '';
    function doCallback() {
      if (callback) callback(sNodeType);
    }
    
    if (!W.__design__ || sName == '$pop') return doCallback();
    
    var targ = topmostWidget_, targObj = targ && targ.component;
    if (targObj) {
      var selectChild = targ.W(sName); // sName maybe 'virtual.sub'
      selectChild = selectChild && selectChild.component;
      if (!selectChild) return doCallback();
      
      var selectNode = selectChild.getHtmlNode();
      if (selectNode) {
        if (selectNode.classList.contains('rewgt-panel'))
          sNodeType = 'Panel';
        else if (selectNode.classList.contains('rewgt-unit'))
          sNodeType = 'Unit';
        else if (selectNode.classList.contains('rewgt-inline')) // available in __design__
          sNodeType = 'Span';
        if (sNodeType) {
          if (selectNode.hasAttribute('data-temp.type'))
            sNodeType = 'Template';
          else if (selectNode.classList.contains('rewgt-scene'))
            sNodeType = 'ScenePage';
        }
      }
      
      var hideNormal = false;
      if ((selectChild.state.style || {}).position == 'absolute')
        hideNormal = true;  // show current page, hide others
      
      var bComp = targObj.$gui.comps, bDelay = [];
      bComp.forEach( function(child) {
        if (!child) return;
        var sKey = utils.keyOfElement(child);
        if (!sKey || sKey == '$pop') return;
        
        var item = targ[sKey];
        item = item && item.component;
        if (item) {
          var sCss, displayCss = utils.hasClass(item,'rewgt-panel')? 'flex': 'block';
          if ((item.state.style || {}).position == 'absolute') {
            if (hideNormal)
              sCss = sKey == sName? displayCss: 'none';
            else sCss = 'none';
          }
          else sCss = hideNormal? 'none': displayCss;
          
          if (sCss == 'none')
            item.setState({style:Object.assign({},item.state.style,{display:'none'})});
          else bDelay.push([item,sCss]);  // hide first
        }
      });
      bDelay.forEach( function(item) {    // then show visible
        var sCss = item[1];
        item = item[0];
        item.setState({style:Object.assign({},item.state.style,{display:sCss})});
      });
    }
    doCallback();
  };
  
  containNode_.removeWidget = function(pathInfo,callback) {
    if (pathInfo && typeof pathInfo == 'string') {
      var targ = W.W(pathInfo), targObj = targ && targ.component;
      if (targObj) {
        var owner = targ.parent, keyid = targObj.$gui.keyid;
        var ownerObj = owner && owner.component;
        if (ownerObj) {
          ownerObj.setChild('-' + keyid, function(changed) {
            if (callback) callback(changed);
          });
          return;
        }
      }
    }
    else if (Array.isArray(pathInfo) && pathInfo.length >= 2) {
      var scene = topmostWidget_ && topmostWidget_.W(pathInfo[0]);
      var sceneObj = scene && scene.component;
      if (sceneObj && sceneObj.props['isScenePage.']) {
        var bArgs = [];
        pathInfo.slice(1).forEach( function(sKey) {
          bArgs.push('-' + sKey);
        });
        bArgs.push( function(changed) {
          if (callback) callback(changed);
        });
        sceneObj.setChild.apply(sceneObj,bArgs);
        return;
      }
    }
    if (callback) callback(false);
  };
  
  containNode_.listPageChild = function(sKey) {
    var bRet = [], targ = topmostWidget_ && topmostWidget_.W(sKey);
    var targObj = targ && targ.component;
    if (targObj && targObj.props['isScenePage.']) {
      var bComp = targObj.$gui.comps || [];
      bComp.forEach( function(child) {
        if (child) {
          var sKey = utils.keyOfElement(child);
          if (sKey[0] == '$') return;
          
          var childObj = targ[sKey];
          childObj = childObj && childObj.component;
          if (childObj) {
            var node = childObj.getHtmlNode();
            if (node) bRet.push([sKey,node]);
          }
        }
      });
    }
    return bRet;
  };
  
  containNode_.listChildren = function(sPath) {
    var bRet = [], bExt = [], iActive = -1, sWdgtName = '', sColor = '#a00';
    var isTop = true, targ = topmostWidget_;
    if (sPath) {
      targ = W.W(sPath);
      if (targ !== topmostWidget_) isTop = false;
    }
    var targObj = targ && targ.component;
    
    if (targObj) {
      var bComp = targObj.$gui.comps || [], isNav = targObj.props['isNavigator.'];
      bComp.forEach( function(child) {
        if (!child) return;
        
        var sKey = utils.keyOfElement(child), childObj = sKey && targ[sKey];
        childObj = childObj && childObj.component;
        if (!childObj) return;
        
        if (isTop || isNav) {
          if (isTop) {
            if (sKey[0] == '$') {
              if (sKey == '$pop') return;
              if (sKey[1] == '$' && child.props['isTemplate.']) return;
            }
            
            if (childObj.props['isScenePage.'])
              bExt.push([sKey,childObj.getHtmlNode()]);
            
            var dStyle = childObj.state.style || {};
            if (dStyle.position == 'absolute' && dStyle.display != 'none') {
              iActive = bRet.length;
              sColor = childObj.props['isTemplate.']? '#00f': '#a00';
            }
          }
          else {  // isNav
            if (childObj.props['isPlayground.'])
              iActive = bRet.length;
          }
        }
        bRet.push(sKey);  // only add exists child
      });
      
      sWdgtName = targObj._._desc(targObj);
    }
    return [sWdgtName,sColor,iActive,bRet,bExt];
  };
  
  containNode_.resizeWidget = function(sPath,iResizeType,x,y,callback) {
    var node, bRet = [], targ = W.W(sPath), changed = false;
    var targObj = targ && targ.component;
    
    if (targObj && (node = targObj.getHtmlNode())) {
      if (utils.hasClass(targObj,['rewgt-panel','rewgt-unit'])) {
        var r = node.getBoundingClientRect();
        var iOldX = targObj.state.width, iOldY = targObj.state.height;
        if ((iResizeType == 1 || iResizeType == 3) && typeof iOldX == 'number') {
          if (iOldX > 0 && iOldX < 1) {
            if (iOldX >= 0.9999) iOldX = 1;
            var newX = Math.max(0,r.width + x);
            if (newX == 0)
              newX = 0.001;
            else {
              newX = newX / (r.width / iOldX);
              if (newX >= 1) newX = 0.9999;  // max is 100%
            }
            targObj.duals.width = newX;
            changed = true;
          }
          else if (iOldX >= 1) {
            targObj.duals.width = Math.max(1,r.width + x);
            changed = true;
          }
        }
        if ((iResizeType == 2 || iResizeType == 3) && typeof iOldY == 'number') {
          if (iOldY > 0 && iOldY < 1) {
            if (iOldY >= 0.9999) iOldY = 1;
            var newY = Math.max(0,r.height + y);
            if (newY == 0)
              newY = 0.001;
            else {
              newY = newY / (r.height / iOldY);
              if (newY >= 1) newY = 0.9999;  // max is 100%
            }
            targObj.duals.height = newY;
            changed = true;
          }
          else if (iOldY >= 1) {
            targObj.duals.height = Math.max(1,r.height + y);
            changed = true;
          }
        }
      }
      else if (targObj.props['childInline.']) {
        var r = node.getBoundingClientRect(), dStyle = {};
        if (iResizeType == 1 || iResizeType == 3) {
          dStyle.width = Math.max(0,r.width+x) + 'px';
          changed = true;
        }
        if (iResizeType == 2 || iResizeType == 3) {
          dStyle.height = Math.max(0,r.height+y) + 'px';
          changed = true;
        }
        if (changed) targObj.duals.style = dStyle;
      }
      
      if (changed) {
        var ownerObj = targObj.parentOf(true);
        if (ownerObj) {
          creator.renewWidgetSpared(ownerObj,true, function() {
            targObj.reRender( function() {
              if (callback) callback(changed);
            });
          });
        }
        else {
          targObj.reRender( function() {
            if (callback) callback(changed);
          });
        }
        return;
      }
    }
    
    if (callback) callback(changed);
  };
  
  containNode_.setSceneCurrent = function(bChanging) {
    if (!topmostWidget_) return;
    bChanging.forEach( function(item) {
      var sSceneId = item[0], sKey = item[1], targObj = topmostWidget_.W(sSceneId);
      targObj = targObj && targObj.component;
      if (targObj && targObj.props['isScenePage.'])
        targObj.setSelected(sKey);   // sKey maybe '' (for unselect)
    });
  };
  
  containNode_.hideTemplate = function(sPath,ignoreRoot) {
    var targ = W.W(sPath), targObj = targ && targ.component;
    if (!targObj || !targObj.props['isTemplate.']) return;
    if (ignoreRoot && targ.parent === topmostWidget_) return;
    
    targObj.setState({style:Object.assign({},targObj.state.style,{display:'none'})});
  };
  
  containNode_.showTemplate = function(sPath,ignoreRoot,callback) {
    var hasShow = false;
    function doCallback() {
      if (callback) callback(hasShow);
    }
    
    var targ = W.W(sPath), targObj = targ && targ.component;
    if (!targObj) return doCallback();
    var iFlag = targObj.props['isTemplate.'];
    if (!iFlag) return doCallback();
    if (ignoreRoot && targ.parent === topmostWidget_) return doCallback();
    
    var displayCss = iFlag == 3? 'inline': (iFlag == 2? 'block': 'flex');
    hasShow = true;
    targObj.setState({style:Object.assign({},targObj.state.style,{display:displayCss})},doCallback);
  };
  
  var isUnderLinker = function(node) {
    if (!node || node === containNode_) return false;
    if (node.getAttribute('data-unit.path') || node.getAttribute('data-span.path'))
      return true;
    else return isUnderLinker(node.parentNode);
  };
  containNode_.isUnderLinker = isUnderLinker;
  
  var getEditableFlag = function(node,ignoreNum) {
    while (node) {
      if (node === containNode_) break;
      if ( node.classList.contains('rewgt-panel') || 
           node.classList.contains('rewgt-unit') ||
           node.classList.contains('rewgt-inline') ) {
        if (ignoreNum > 0)
          ignoreNum -= 1;
        else {
          var sFlag, s = node.getAttribute('data-group.opt');
          if (s && (sFlag = (s.split('/')[1] || 'all')) != 'all')
            return sFlag; // return first none 'all'
        }
      }
      node = node.parentNode;
    }
    return 'all';
  };
  containNode_.getEditableFlag = getEditableFlag;
  
  containNode_.bindLinker = function(srcPath,tarPath,callback) {
    var hasBind = false;
    function doCallback() {
      if (callback) callback(hasBind);
    }
    
    var linkType = 0, isOrgLink = false;
    function isLinkerObj(obj) {
      linkType = obj.props['isReference.'];
      if (linkType) {
        isOrgLink = true;
        return true;
      }
      
      var s = obj.props['data-unit.path'];
      if (s) {
        linkType = 1;
        return true;
      }
      s = obj.props['data-span.path'];
      if (s) {
        linkType = 2;
        return true;
      }
      return false;
    }
    
    if (srcPath == tarPath) {
      utils.instantShow('error: can not link to self.');
      return doCallback();
    }
    
    // step 1: check source and target node
    var srcNode = W.W(srcPath), tarNode = W.W(tarPath);
    var srcNodeObj = srcNode && srcNode.component;
    var tarNodeObj = tarNode && tarNode.component;
    if (!srcNodeObj || !isLinkerObj(srcNodeObj)) {
      utils.instantShow('error: source widget is not a linker.');
      return doCallback();
    }
    if (!tarNodeObj) {
      utils.instantShow('error: invalid target widget.');
      return doCallback();
    }
    if (tarNodeObj.props['isTemplate.']) {
      utils.instantShow('error: can not link to a template.');
      return doCallback();
    }
    if (linkType == 2) {  // RefSpan
      if (!tarNodeObj.props['childInline.'] || utils.hasClass(tarNodeObj,'rewgt-unit')) {
        utils.instantShow('error: RefSpan can only link to inline widget.');
        return doCallback();
      }
    }
    else {  // RefDiv
      if (!utils.hasClass(tarNodeObj,['rewgt-panel','rewgt-unit'])) {
        utils.instantShow('error: RefDiv can only link to: panel, div, paragraph.');
        return doCallback();
      }
    }
    if (typeof tarNodeObj.$gui.keyid == 'number')
      utils.instantShow('warning: link to numbered-key is not suggested.');
    
    // step 2: get relative path or absolute path
    var sLnkPath = getRelativePath_(srcPath,tarPath,false);
    if (!sLnkPath) return doCallback();
    
    // step 3: bind link path
    var owner = srcNode.parent;
    var ownerObj = owner && owner.component;
    if (!ownerObj) return doCallback(); // unknown error
    
    if (isUnderLinker(ownerObj.getHtmlNode())) {
      utils.instantShow('error: binding path disallowed under a linker.');
      return doCallback();
    }
    
    var keyid = srcNodeObj.$gui.keyid, sKey = keyid + '', sOrgKey = sKey;
    if (sKey[0] != '$')
      keyid = sKey = '$' + sKey;
    
    var newEle, orgEle = null, gui = ownerObj.$gui, idx = gui.compIdx[sOrgKey];
    if (typeof idx == 'number')
      orgEle = gui.comps[idx];
    if (!orgEle) return doCallback(); // unknown error
    var dProp = {'$':sLnkPath,key:sKey,'keyid.':keyid};
    if (isOrgLink)
      newEle = React.cloneElement(orgEle,dProp);
    else {
      var refCls = linkType == 2? RefSpan__: RefDiv__;
      newEle = React.createElement(refCls,Object.assign(srcNodeObj.props['link.props'] || {},dProp));
    }
    
    // delete '$key' or 'key', then and new element
    var nextEle = gui.comps[idx+1];
    var nextEleKey = nextEle && utils.keyOfElement(nextEle);
    ownerObj.setChild('-'+sOrgKey, function() {
      hasBind = true;
      if (nextEleKey)  // insert new '$key'
        ownerObj.setChild('+'+nextEleKey,newEle,doCallback);
      else ownerObj.setChild(newEle,doCallback); // append new '$key'
    });
  };
  
  function canInsertInto(srcType,tarType,tarIsRow) {
    if (tarType == 3) {       // Span
      if (srcType != 3) {
        utils.instantShow('error: can not insert none-inline into inline widget.');
        return false;
      }
    }
    else if (tarType == 2) {  // P
      if (srcType == 0) {
        utils.instantShow('error: can not insert panel into paragraph.');
        return false;
      }
    }
    else if (tarType == 1) {  // Div
      if (srcType == 0) {
        if (!tarIsRow) {
          utils.instantShow('error: can not insert panel into none-panel.');
          return false;
        }
      }
      else if (srcType == 3) {
        utils.instantShow('error: inline widget can not be inserted into panel or div.');
        return false;
      }
    }
    else { // tarType == 0, Panel
      if (srcType == 3) {
        utils.instantShow('error: inline widget can not be inserted into panel or div.');
        return false;
      }
    }
    return true;
  }
  
  containNode_.createWidget = function(bTree,sToolId,tarPath,isChild,iX,iY,callback) {
    var succ = false, oldCompIdx = {}, returnNode = null, tarOwnerObj2 = null;
    function doCallback() {
      if (callback) {
        if (succ && tarOwnerObj2) {
          var b = Object.keys(tarOwnerObj2.$gui.compIdx);
          for (var i=0,item; item=b[i]; i+=1) {
            if (!oldCompIdx.hasOwnProperty(item) && item[0] != '$') {
              var wdgt = tarOwnerObj2.widget, targ = wdgt && wdgt[item];
              var targObj = targ && targ.component;
              if (targObj)
                returnNode = targObj.getHtmlNode();
              break;
            }
          }
        }
        callback(succ,returnNode);
      }
    }
    
    // step 1: check tarNodeObj
    var tarNode = null;
    if (!tarPath) {
      var topNode = containNode_.children[0];
      if (topNode) {     // has .body
        tarNode = topmostWidget_;
        tarPath = containNode_.frameInfo.rootName;
        isChild = true;  // first widget under .body, fixed as child
      }
    }
    else tarNode = W.W(tarPath);
    var tarNodeObj = tarNode && tarNode.component;
    var tarOwner = tarNode && tarNode.parent;
    var tarOwnerObj = tarOwner && tarOwner.component;
    if (!tarNodeObj || (!isChild && !tarOwnerObj)) {
      utils.instantShow('error: invalid target widget.');
      return doCallback();
    }
    
    // step 2: check editable
    var targNd = tarNodeObj.getHtmlNode();
    if (targNd && getEditableFlag(targNd,isChild?0:1) != 'all') {
      utils.instantShow('error: insert target is disallowed.');
      return doCallback();
    }
    
    // step 3: check rewgt-static
    if (!bTree[0]) {
      var dProp = bTree[1], bHtml = dProp && dProp.html;
      if (Array.isArray(bHtml)) {
        var targObj2 = isChild? tarNodeObj: tarOwnerObj;
        returnNode = targObj2.getHtmlNode();
        if (returnNode && isUnderLinker(returnNode)) {
          utils.instantShow('error: can not add widget to a linker.');
          return doCallback();
        }
        
        var childNum, sHtml = bHtml.join('');
        var node = document.createElement('div');
        node.innerHTML = sHtml;
        if ((childNum=node.children.length) > 0) {
          var bList = [], idx = W.$staticNodes.push(bList) - 1;
          for (var i=0; i < childNum; i += 1) {
            bList.push(node.children[i]);
          }
          
          var gui = targObj2.$gui, keyid = gui.comps.length + gui.removeNum, staticName = idx + '';
          var dProp = {'keyid.':keyid, key:keyid+'', className:'rewgt-static', name:staticName}; // no 'hookTo.'
          if (W.__design__) {
            dProp.onMouseDown = creator.staticMouseDown;
            dProp.onDoubleClick = creator.staticDbClick.bind(targObj2);
          }
          
          var srcEle = React.createElement(targObj2.props['childInline.']?'span':'div',dProp);
          var compIdx = gui.compIdx;
          idx = -1;
          if (!isChild) idx = compIdx[tarNodeObj.$gui.keyid];
          if (typeof idx == 'number' && idx >= 0) {
            var compIdx = compIdx
            for (var sKey in compIdx) {
              var idx_ = compIdx[sKey];
              if (idx_ >= idx) compIdx[sKey] = idx_ + 1;
            }
            gui.comps.splice(idx,0,srcEle);
          }
          else idx = gui.comps.push(srcEle) - 1;
          compIdx[keyid] = idx;
          
          succ = true;
          targObj2.reRender( function() {
            if (returnNode) {
              var node = returnNode.querySelector('.rewgt-static[name="' + staticName + '"]');
              if (node) {
                for (var i=0,item; item = bList[i]; i++) {
                  node.appendChild(item);
                }
              }
            }
          });
        }
        
        if (callback) {
          setTimeout( function() {
            callback(succ,returnNode);
          },0);
        }
        return;
      }
    }
    
    // step 4: convert template to element
    var srcEle = utils.loadElement(bTree);
    if (!srcEle) return doCallback();
    
    // step 5: check sceneObj
    var sceneObj = null, sceneWdgt = null, srcIsScene = srcEle.props['isScenePage.'];
    if (tarNodeObj.props['isScenePage.']) {
      sceneObj = tarNodeObj;
      sceneWdgt = tarNode;
    }
    else if (tarOwnerObj && tarOwnerObj.props['isScenePage.']) {
      if (!isChild) {
        sceneObj = tarOwnerObj;
        sceneWdgt = tarOwner;
      }
      else {
        if (srcIsScene) { // ScenePage can insert before another ScenePage (but not into it's child)
          utils.instantShow('error: ScenePage can only insert into topmost widget.');
          return doCallback();
        }
      }
    }
    
    var tarType, sSrcCls = ' ' + srcEle.props.className + ' ';
    var srcType = sSrcCls.indexOf(' rewgt-panel ') >= 0? 0: (sSrcCls.indexOf(' rewgt-unit ') >= 0?1:3);
    if (srcType == 1 && srcEle.props['childInline.']) srcType = 2;
    if (sceneObj) {  // target is ScenePage
      if (sceneWdgt.parent !== topmostWidget_ || !topmostWidget_.component) {
        utils.instantShow('error: invalid target ScenePage.');
        return doCallback();
      }
      
      tarType = 0;
      tarNode = sceneWdgt;
      tarNodeObj = sceneObj;
      
      if (srcIsScene) {  // srcType must be 0
        tarOwner = topmostWidget_;
        tarOwnerObj = topmostWidget_.component;
        isChild = false;
        return insertNewComp();
      }
      
      if (srcType == 3) {  // srcEle is Span like
        utils.instantShow('error: only panel, div, paragraph can add to ScenePage.');
        return doCallback();
      }
      
      tarOwner = null; tarOwnerObj = null; // must not used from now
      isChild = true;   // anything can be child of ScenePage
    }
    else {  // !sceneObj, target is not ScenePage
      if (srcIsScene) {
        if (tarNode !== topmostWidget_ || !isChild) {
          utils.instantShow('error: ScenePage can only hook to topmost widget.');
          return doCallback();
        }
      }
      
      tarType = (tarNodeObj.$gui.isPanel || tarNode === topmostWidget_)? 0: (utils.hasClass(tarNodeObj,'rewgt-unit')?1:3);
      if (tarType == 1 && tarNodeObj.props['childInline.']) tarType = 2;
      var tarIsRow = false;
      if (tarType == 1 && tarNodeObj.props['isTableRow.']) tarIsRow = true;
      
      if (!isChild) {
        if (tarNode === topmostWidget_ || !tarOwnerObj) {
          utils.instantShow('error: can not insert before topmost widget.');
          return;
        }
        tarType = (tarOwnerObj.$gui.isPanel || tarOwner === topmostWidget_)? 0: (utils.hasClass(tarOwnerObj,'rewgt-unit')?1:3);
        if (tarType == 1 && tarOwnerObj.props['childInline.']) tarType = 2;
      }
      
      if (!canInsertInto(srcType,tarType,tarIsRow))
        return doCallback();
    }
    
    // step 6: insert new component
    return insertNewComp();
    
    function insertNewComp() {
      tarOwnerObj2 = isChild? tarNodeObj: tarOwnerObj;
      if (isUnderLinker(tarOwnerObj2.getHtmlNode())) {
        utils.instantShow('error: can not add widget to a linker.');
        return doCallback();
      }
      
      var unitLnk = srcEle.props['data-unit.path'], spanLnk = srcEle.props['data-span.path'];
      var sLnkPath = '', sLnkAttr = typeof unitLnk == 'string'? 'data-unit.path': (typeof spanLnk == 'string'? 'data-span.path': ''); 
      if (sLnkAttr) {
        if (tarOwnerObj2.widget === topmostWidget_) {
          utils.instantShow('error: can not use linker under topmost widget.');
          return doCallback();
        }
        
        sLnkPath = spanLnk || unitLnk;
        if (!sLnkPath)
          utils.instantShow('warning: link path is empty.'); // just warning, continue adding
      }
      
      var sSrcKey = utils.keyOfElement(srcEle), srcNotNamed = false, autoKey = false;
      if (!sSrcKey || typeof sSrcKey != 'string')
        srcNotNamed = true;
      else { // is string
        autoKey = sSrcKey.search(/^auto[0-9]+$/) == 0;
        if (autoKey || (parseInt(sSrcKey)+'') === sSrcKey)
          srcNotNamed = true;
      }
      var needCopy = false;
      if (srcNotNamed)
        needCopy = true;
      else {  // source is named and current do copy
        if (typeof tarOwnerObj2.$gui.compIdx[sSrcKey] == 'number')  // exist same name
          needCopy = true;
      }
      
      var addInScene = sceneObj && !srcIsScene;
      if (needCopy) {
        var dProp = {'keyid.':'',key:''};
        if (autoKey && tarOwnerObj2.props['isScenePage.']) {
          var iAuto2 = tarOwnerObj2.$gui.removeNum + tarOwnerObj2.$gui.comps.length;
          var sAuto2 = 'auto' + iAuto2;
          while (typeof tarOwnerObj2.$gui.compIdx[sAuto2] == 'number') {
            iAuto2 += 1;
            sAuto2 = 'auto' + iAuto2;
          }
          dProp['keyid.'] = dProp.key = sAuto2;
        }
        
        if (sLnkAttr) dProp[sLnkAttr] = sLnkPath;
        if (addInScene) { dProp.left = iX; dProp.top = iY; }
        if (sToolId)  // tool ID, not 'data-group.opt' which would not dump out
          dProp['data-group.optid'] = sToolId + ''; // can success dump out since passed by prop
        srcEle = React.cloneElement(srcEle,dProp);
      }
      else { // must not autoKey
        if (sLnkAttr || addInScene || sToolId) {
          var dProp = {};
          if (sLnkAttr) dProp[sLnkAttr] = sLnkPath;
          if (addInScene) { dProp.left = iX; dProp.top = iY; }
          if (sToolId) dProp['data-group.optid'] = sToolId + '';
          srcEle = React.cloneElement(srcEle,dProp);
        }
      }
      
      succ = true;
      if (isChild) {
        Object.assign(oldCompIdx,tarOwnerObj2.$gui.compIdx);
        tarOwnerObj2.setChild(srcEle,doCallback);
      }
      else {
        Object.assign(oldCompIdx,tarOwnerObj2.$gui.compIdx);
        tarOwnerObj2.setChild('+'+tarNodeObj.$gui.keyid,srcEle,doCallback);
      }
    }
  };
  
  containNode_.copyWidget = function(srcPath,tarPath,isChild,rmvSrc,iX,iY,callback) {
    // step 1: check srcNodeObj, tarNodeObj
    var copied = false, retNode = null;
    var srcNode = W.W(srcPath);
    var srcNodeObj = srcNode && srcNode.component;
    var srcOwner = srcNode && srcNode.parent;
    var srcOwnerObj = srcOwner && srcOwner.component;
    if (!srcNodeObj || !srcOwnerObj) {
      utils.instantShow('error: invalid source widget.');
      return doCallback();
    }
    var tarNode = W.W(tarPath);
    var tarNodeObj = tarNode && tarNode.component;
    var tarOwner = tarNode && tarNode.parent;
    var tarOwnerObj = tarOwner && tarOwner.component;
    if (!tarNodeObj || !tarOwnerObj) {
      utils.instantShow('error: invalid target widget.');
      return doCallback();
    }
    
    // step 2: check editable
    if (rmvSrc) {
      var sourNd = srcNodeObj.getHtmlNode();
      if (sourNd && getEditableFlag(sourNd,1) != 'all') {
        utils.instantShow('error: move source widget is disallowed.');
        return doCallback();
      }
    }
    var targNd = tarNodeObj.getHtmlNode();
    if (targNd && getEditableFlag(targNd,isChild?0:1) != 'all') {
      utils.instantShow('error: insert target is disallowed.');
      return doCallback();
    }
    
    // step 3: check sceneObj
    var sceneObj = null, sceneWdgt = null, srcIsScene = srcNodeObj.props['isScenePage.'];
    if (tarNodeObj.props['isScenePage.']) {
      sceneObj = tarNodeObj;
      sceneWdgt = tarNode;
    }
    else if (tarOwnerObj.props['isScenePage.']) {
      if (!isChild) {
        sceneObj = tarOwnerObj;
        sceneWdgt = tarOwner;
      }
      else {
        if (srcIsScene) {
          utils.instantShow('error: ScenePage can only insert into topmost widget.');
          return doCallback();
        }
      }
    }
    
    // step 4: check copy or drag available or not
    var oldCompIdx = {}, tarOwnerObj2 = null;
    var tarType, srcType = srcNodeObj.$gui.isPanel? 1: (utils.hasClass(srcNodeObj,'rewgt-unit')?2:3);
    if (sceneObj) {
      if (sceneWdgt.parent !== topmostWidget_ || !topmostWidget_.component) {
        utils.instantShow('error: invalid target ScenePage.');
        return doCallback();
      }
      
      tarType = 1;
      tarNode = sceneWdgt;
      tarNodeObj = sceneObj;
      tarOwner = topmostWidget_;  // fix to '.body' for ScenePage
      tarOwnerObj = topmostWidget_.component;
      
      if (srcIsScene) {    // srcType must be 1
        if (rmvSrc && srcNodeObj === sceneObj) { // move to same place
          utils.instantShow('warning: ignore moving ScenePage to same place.');
          return doCallback();
        }
        
        isChild = false;
        return copyOrMove();
      }
      else isChild = true; // anything can be child of ScenePage
      
      if (srcType != 1 && srcType != 2) {    // not panel or unit
        utils.instantShow('error: only panel, div, paragraph can move to ScenePage.');
        return doCallback();
      }
    }
    else {
      if (srcIsScene) { // !sceneObj
        utils.instantShow('error: ScenePage can only hook to topmost widget.');
        return doCallback();
      }
      
      tarType = tarNodeObj.$gui.isPanel? 1: (utils.hasClass(tarNodeObj,'rewgt-unit')?2:3);
      if (isChild) {
        if (tarType == 3 && srcType != 3) {
          utils.instantShow('error: can not append none-inline to inline widget.');
          return doCallback();
        }
        if (tarType == 1 && srcType == 3) {
          utils.instantShow('error: can not append inline widget to panel.');
          return doCallback();
        }
      }
      else {
        if (tarType == 3 && srcType != 3) {
          utils.instantShow('error: can not insert none-inline before inline widget.');
          return doCallback();
        }
        if (tarType != 3 && srcType == 3) {
          utils.instantShow('error: can not insert inline before none-inline widget.');
          return doCallback();
        }
      }
    }
    
    // step 5: copy or move
    return copyOrMove();
    
    function copyOrMove() {  // try adjust linker's path
      var gui = srcOwnerObj.$gui, idx = gui.compIdx[srcNodeObj.$gui.keyid];
      var srcEle = (typeof idx == 'number') && gui.comps[idx];
      if (!srcEle) return doCallback();  // unknown error
      
      tarOwnerObj2 = isChild? tarNodeObj: tarOwnerObj;
      if (isUnderLinker(tarOwnerObj2.getHtmlNode())) {
        utils.instantShow('error: can not add target widget under a linker.');
        return doCallback();
      }
      
      var outOfScene = srcOwnerObj.props['isScenePage.'] && !sceneObj;
      var unitLnk = srcEle.props['data-unit.path'], spanLnk = srcEle.props['data-span.path'];
      var sLnkPath = '', sLnkAttr = typeof unitLnk == 'string'? 'data-unit.path': (typeof spanLnk == 'string'? 'data-span.path': ''); 
      if (sLnkAttr) {
        if (tarOwnerObj2.widget === topmostWidget_) {
          utils.instantShow('error: can not use linker under topmost widget.');
          return doCallback();
        }
        if ((isChild?tarNode:tarOwner) !== srcOwner) {
          utils.instantShow('error: can not move linked-linker to another widget, use unlinked-linker instead.');
          return doCallback();
        }
        
     /* sLnkPath = getLinkFullPath_(srcNodeObj,spanLnk || unitLnk);  // no use, move linked-linker to other owner disallowed
        if (sLnkPath) sLnkPath = getRelativePath_(tarNode.getPath(),sLnkPath,isChild); */
        sLnkPath = spanLnk || unitLnk;
        if (!sLnkPath) {
          utils.instantShow('warning: invalid link path.');
          return doCallback();
        }
      }
      
      var sSrcKey = utils.keyOfElement(srcEle), srcNotNamed = false, autoKey = false;
      if (!sSrcKey || typeof sSrcKey != 'string')
        srcNotNamed = true;
      else {
        autoKey = sSrcKey.search(/^auto[0-9]+$/) == 0;
        if (autoKey || (parseInt(sSrcKey)+'') === sSrcKey)
          srcNotNamed = true;
      }
      var needCopy = false;
      if (srcNotNamed)
        needCopy = true;
      else if (!rmvSrc) {  // source is named and current do copy, !rmvSrc means 'copy'
        if (typeof tarOwnerObj2.$gui.compIdx[sSrcKey] == 'number')   // exist same name
          needCopy = true;
      }
      
      if (needCopy && autoKey && srcIsScene && rmvSrc && !isChild) { // move ScenePage
        var sTargFlag = '+'+tarNodeObj.$gui.keyid;
        tarOwnerObj2.setChild('-' + sSrcKey, function() {
          copied = true;
          tarOwnerObj2.setChild(sTargFlag,srcEle,function() {
            var wdgt = tarOwnerObj2.widget, targ = wdgt && wdgt[sSrcKey];
            var targObj = targ && targ.component;
            if (targObj)
              retNode = targObj.getHtmlNode();
            if (callback) callback(copied,retNode);
          });
        });
        return;
      }
      
      var dProp = creator.getCompRenewProp(srcNodeObj) || {};
      if (needCopy) {
        if (autoKey && (tarOwnerObj2.props['isScenePage.'] || srcIsScene)) {
          var iAuto2 = tarOwnerObj2.$gui.removeNum + tarOwnerObj2.$gui.comps.length;
          var sAuto2 = 'auto' + iAuto2;
          while (typeof tarOwnerObj2.$gui.compIdx[sAuto2] == 'number') {
            iAuto2 += 1;
            sAuto2 = 'auto' + iAuto2;
          }
          dProp['keyid.'] = dProp.key = sAuto2;
        }
        else dProp['keyid.'] = dProp.key = '';
      }
      // else, autoKey must be false
      
      if (sLnkAttr) dProp[sLnkAttr] = sLnkPath;
      if (srcIsScene) {
        dProp.left = 0;
        dProp.top = 0;
      }
      else if (sceneObj) {
        dProp.left = iX;
        dProp.top = iY;
      }
      if (outOfScene) { dProp.left = null; dProp.top = null; }
      // srcEle = React.cloneElement(srcEle,dProp);
      srcEle = creator.deepCloneReactEle(srcEle,dProp,srcNode,srcNodeObj);
      
      if (rmvSrc) {
        if (!srcNotNamed && !needCopy && (isChild?tarNode:tarOwner) === srcOwner) // move in same parent
          rmvSrc = false; // for named widget, old same-keyid-widget will auto-removed
      }
      
      if (rmvSrc && isUnderLinker(srcOwnerObj.getHtmlNode())) {
        utils.instantShow('error: can not remove source widget under a link.');
        return doCallback();
      }
      
      copied = true;
      Object.assign(oldCompIdx,tarOwnerObj2.$gui.compIdx); // backup for finding out which will add
      if (isChild)
        tarOwnerObj2.setChild(srcEle,doCallback);
      else tarOwnerObj2.setChild('+'+tarNodeObj.$gui.keyid,srcEle,doCallback);
    }
    
    function doCallback() {
      if (copied) {
        var b = Object.keys(tarOwnerObj2.$gui.compIdx);
        for (var i=0,item; item=b[i]; i+=1) {
          if (!oldCompIdx.hasOwnProperty(item) && item[0] != '$') {
            var wdgt = tarOwnerObj2.widget, targ = wdgt && wdgt[item];
            var targObj = targ && targ.component;
            if (targObj)
              retNode = targObj.getHtmlNode();
            break;
          }
        }
      }
      
      if (copied && rmvSrc) {
        srcOwnerObj.setChild('-'+srcNodeObj.$gui.keyid, function() {
          if (callback) callback(copied,retNode);
        });
      }
      else {
        if (callback) callback(copied,retNode);
      }
    }
  };
  
  containNode_.setWdgtZIndex = function(sPath,iLevel,callback) {
    var succ = false;
    function doCallback() {
      if (callback) callback(succ);
    }
    
    var compObj = sPath && W.W(sPath);
    var ownerObj = compObj && compObj.parent;
    compObj = compObj && compObj.component;
    ownerObj = ownerObj && ownerObj.component;
    if (!compObj || !ownerObj) return doCallback();
    
    if (isUnderLinker(ownerObj.getHtmlNode())) {
      utils.instantShow('error: can not change z-index under a link.');
      return doCallback();
    }
    
    var dStyle = Object.assign({},compObj.state.style);
    dStyle.zIndex = iLevel + '';
    if (compObj.props.style)
      compObj.props.style.zIndex = dStyle.zIndex; // for saving, element.props.style === compObj.props.style
    succ = true;
    compObj.setState({style:dStyle},doCallback);
  };
  
  containNode_.getGroupOpt = function(compOrPath) {
    var comp = compOrPath;
    if (typeof compOrPath == 'string') {
      var wdgt = W.W(compOrPath);
      comp = wdgt && wdgt.component;
    }
    if (!comp || !comp._) return null; // error
    return comp._._getGroupOpt(comp);
  };
  
  var lastSchemaIndex_ = 0, lastSchemaComp_ = null, lastTypeInfo_ = {}, lastSchemaOpt_ = {};
  containNode_.widgetSchema = function(compOrPath,adjustIt,noExpr) {
    var comp = compOrPath;
    if (typeof compOrPath == 'string') {
      var wdgt = W.W(compOrPath);
      comp = wdgt && wdgt.component;
    }
    if (!comp || !comp.props) return null; // error
    
    if (!adjustIt) {
      var typeInfo = comp._._getSchema(comp);
      return [typeInfo,getCompSchema_(comp,typeInfo,noExpr)];
    }
    // else, adjustIt, for builtin prop-editor (right panel)
    
    var currNode = comp.getHtmlNode(), sEditable = 'all';
    if (currNode) sEditable = getEditableFlag(currNode,1);
    if (sEditable == 'none') return [0];   // failed, clear prop-editor
    
    var typeInfo = comp._._getSchema(comp);
    var dSchema = getCompSchema_(comp,typeInfo,noExpr);
    if (!dSchema) return null;
    if (dSchema.properties && !dSchema.properties.style && !comp.props['$style']) // set default style={} for easy editing
      dSchema.properties.style = {type:'object',propertyOrder:200,default:{}};
    
    lastSchemaOpt_ = dSchema.wdgtOption;
    lastSchemaComp_ = comp;
    lastTypeInfo_ = typeInfo;
    lastSchemaIndex_ += 1;
    
    delete dSchema.wdgtOption;
    if (sEditable == 'some') {
      var attrs = {}, bAttr = Object.keys(dSchema.properties || {});
      bAttr.forEach( function(item) {
        if ( item == 'key' || item == 'klass' || item == 'style' ||
             item.indexOf('data-') == 0 || item.indexOf('aria-') == 0 )
          attrs[item] = dSchema.properties[item];
      });
      dSchema.properties = attrs;
      var opt = dSchema.options || {};
      opt.disable_properties = true;
      dSchema.options = opt;
    }
    
    var bAttr = [], bAttr2 = [];
    Object.keys(lastTypeInfo_).forEach( function(item) {
      var b = lastTypeInfo_[item];
      if (Array.isArray(b))
        bAttr2.push([b[0] || 0,item]);  // [iOrder,sAttr]
    });
    bAttr2.sort( function(a,b) { return a[0] - b[0]; } );
    bAttr2.forEach( function(item) { bAttr.push(item[1]); } );
    
    var baseUrl = lastSchemaOpt_.option.baseUrl || '';
    return [lastSchemaIndex_,dSchema, { name:lastSchemaOpt_.name,
      doc:lastSchemaOpt_.doc, flag:lastSchemaOpt_.flag, baseUrl:baseUrl,
    }, bAttr, comp._._htmlText && !comp.props['marked.']]; // no editing 'html.' for MarkedDiv like
  };
  
  function updateWdgtProp_(compObj,typeInfo,option,dProp,backupComp,callback) {
    var succ = false, retNode = null, ele = null;
    
    // step 1: check available
    var compWdgt = compObj.widget, owner = compWdgt && compWdgt.parent;
    var ownerObj = owner && owner.component;
    if (!ownerObj) {
      utils.instantShow('warning: update property failed (out of date).');
      return doCallback();
    }
    if (typeof dProp != 'object') return doCallback();  // fatal error
    
    var currNode = compObj.getHtmlNode();
    var ownerNode = currNode && currNode.parentNode;
    if (ownerNode && isUnderLinker(ownerNode)) { // currNode can be a linker
      utils.instantShow('error: can not modify widget that under linker.');
      return doCallback();
    }
    
    // step 2: setup dProp
    var b, klass = dProp.klass;
    if (Array.isArray(klass)) {
      var sTmp = '';
      klass.forEach( function(item) {
        if (sTmp) sTmp += ' ';
        sTmp += ((item || 'undefined') + '');
      });
      klass = sTmp? sTmp: undefined;
    }
    else if (klass !== undefined)
      klass = null;
    delete dProp.klass;
    
    var style = dProp.style;
    if (style && style instanceof Object) {
      var style2 = {}, hasSome = false;
      b = Object.keys(style);
      b.forEach( function(item) {
        hasSome = true;
        var s = style[item] + '';  // force to string
        if (s.search(/^#[a-fA-F0-9]{6}$/) == 0) {
          if (s[1] == s[2] && s[3] == s[4] && s[5] == s[6])
            s = '#' + s[1] + s[3] + s[5];
        }
        style2[item] = s;
      });
      if (hasSome)
        style = style2;
      else style = null;
    }
    else style = null;
    delete dProp.style;
    
    var oldKeyid = compObj.$gui.keyid, keyid = dProp.key, clearKey = false;
    if (typeof keyid == 'string') {
      keyid = keyid.trim();
      if (keyid) {
        if ((parseInt(keyid)+'') == keyid)   // ignore number
          keyid = '';
        else {
          if (oldKeyid !== keyid && owner[keyid]) { // renamed key already has existing widget
            utils.instantShow('error: duplication of key name.');
            return doCallback();
          }
        }
      }
      if (!keyid && typeof oldKeyid == 'string') clearKey = true;
    }
    else keyid = '';
    delete dProp['keyid.'];
    delete dProp.key;
    
    b = Object.keys(dProp);
    b.forEach( function(item) {
      var value = dProp[item];
      if (item.indexOf('data-') == 0 || item.indexOf('aria-') == 0) {
        dProp[item] = value + '';       // force to string
        return;
      }
      if (value === undefined) return;  // property removed
      
      var bInfo = typeInfo[item], tpInfoType = 'any';
      if (bInfo && bInfo.length) tpInfoType = bInfo[1];
      if (tpInfoType == 'any' && typeof value == 'string' && item[0] != '$') { // try translate string to matched type
        var value_ = value.trim(), ch = value_[0];
        if ((ch == '"' || ch == "'") && value_.length >= 2 && value_.slice(-1) == ch) {
          dProp[item] = value_.slice(1,-1);   // take as string
        }
        else if ((ch == '[' && value_.slice(-1) == ']') || (ch == '{' && value_.slice(-1) == '}')) {
          try {
            dProp[item] = JSON.parse(value_); // take as [] or {}, JSON format
          }
          catch(e) {
            console.log('error: parse JSON failed, input string:');
            console.log(value_);
          }
        }
        else if (value_ == 'null')
          dProp[item] = null;
        else {
          var tmp = parseFloat(value_);     // try number
          if (tmp + '' === value_)
            dProp[item] = tmp;
        }
      }  // else, keep dProp[item] no change
    });
    
    if (clearKey) { // keyid must be ''
      dProp['keyid.'] = '';
      dProp.key = '';
    }
    else {   // ignore keyid, key
      if (keyid)  // keyid must not number
        dProp['keyid.'] = dProp.key = keyid;
      else { // reuse old keyid
        dProp['keyid.'] = keyid = oldKeyid;
        dProp.key = keyid + '';
      }
    }
    
    if (style)
      dProp.style = style;
    else {
      if (compObj.props.style)
        dProp.style = undefined;  // force remove
    }
    if (klass !== null) dProp.klass = klass; // klass maybe is: undefined
    
    var propsEx = option.propsEx;
    if (propsEx) {
      Object.keys(propsEx).forEach( function(sKey) {
        if (!dProp.hasOwnProperty(sKey))
          dProp[sKey] = propsEx[sKey];   // restore old xx.xx
      });
    }
    
    // step 3: clone element
    var oldLnkId = '';
    var bArgs = ['-' + oldKeyid], gui = ownerObj.$gui, idx = gui.compIdx[oldKeyid];
    if (typeof idx != 'number') return doCallback();  // fatal error
    ele = gui.comps[idx];
    if (!ele) return doCallback();
    
    if (option.linkPath) {
      var reactCls = option.flag == 2? RefDiv__: RefSpan__;
      dProp['$'] = option.linkPath;
      
      var newLnkId;
      if (typeof oldKeyid == 'string') {
        if (oldKeyid[0] != '$') {     // remove dummy-ref also
          oldLnkId = '$' + oldKeyid;
          bArgs.push('-' + oldLnkId);
        }
        newLnkId = keyid === ''? oldKeyid: keyid;
      }
      else {
        oldLnkId = '$' + oldKeyid;
        bArgs.push('-' + oldLnkId);
        newLnkId = keyid + '';
      }
      
      if (newLnkId && newLnkId[0] != '$') newLnkId = '$' + newLnkId;
      if (newLnkId) // adjust key
        dProp['keyid.'] = dProp.key = newLnkId;
      if (option.linkStyles)   // can not edit props.styles online
        dProp.styles = option.linkStyles;
      if (option['html.'] && !dProp.hasOwnProperty('html.'))
        dProp['html.'] = option['html.'];
      ele = React.createElement(reactCls,dProp);
    }
    else { // if props.xxx removed, it's value is: undefined
      // ele = React.cloneElement(ele,dProp); // can not use old props.children, maybe out of date
      if (option['html.'] && !dProp.hasOwnProperty('html.'))
        dProp['html.'] = option['html.'];
      ele = creator.deepCloneReactEle(ele,dProp,compWdgt,compObj); // obj.setChild() not change obj.props.children
    }
    
    // step 4: update element by setChild()
    var compNum = gui.comps.length, nextKey = '';
    for (var i=idx+1; i < compNum; i+=1) {
      var item = gui.comps[i];
      var tmpKey = item && utils.keyOfElement(item);
      if (!tmpKey) continue;
      if (tmpKey != oldLnkId) {
        nextKey = tmpKey;
        break;
      }
    }
    bArgs.push( function() {
      succ = true;
      if (!nextKey)
        ownerObj.setChild(ele,doCallback);
      else ownerObj.setChild('+'+nextKey,ele,doCallback);
    });
    ownerObj.setChild.apply(ownerObj,bArgs);
    
    function doCallback() {
      if (succ) {
        var newNodeKey = (keyid || keyid === 0)? keyid+'': '';
        if (option.linkPath && newNodeKey[0] == '$')
          newNodeKey = newNodeKey.slice(1);
        
        setTimeout( function() {
          if (!newNodeKey) newNodeKey = gui.comps.length + gui.removeNum - 1; // new keyid
          var newChild = owner[newNodeKey];
          newChild = newChild && newChild.component;
          if (newChild) {
            retNode = newChild.getHtmlNode();
            if (backupComp)
              lastSchemaComp_ = newChild;  // not change session of GUI property editing
          }
          if (callback) callback(succ,retNode);
        },300);  // delay for waiting link ready
      }
      else {
        if (callback) callback(succ,retNode);
      }
    }
  }
  
  containNode_.saveWdgtProp = function(comp,typeInfo,option,dProp,callback) {
    if (typeof comp == 'string') {
      comp = W.W(comp);
      comp = comp && comp.component;
    }
    if (!comp || !comp.props) {
      if (callback) callback(false,null);
    }
    else updateWdgtProp_(comp,typeInfo,option,dProp,false,callback);
  };
  
  containNode_.updateWdgtProp = function(schemaId,dProp,callback) {
    if (lastSchemaIndex_ != schemaId || !lastSchemaComp_) {
      if (callback) callback(false,null);
    }
    else updateWdgtProp_(lastSchemaComp_,lastTypeInfo_,lastSchemaOpt_,dProp,true,callback);
  };
  
  containNode_.saveCompStyles = function(comp,option,dStyles,callback) {
    var succ = false, retNode = null;
    
    if (typeof comp == 'string') {
      comp = W.W(comp);
      comp = comp && comp.component;
    }
    if (!comp || !comp.props)
      return doCallback();
    
    var wdgt = comp.widget, owner = wdgt && wdgt.parent;
    var ownerObj = owner && owner.component;
    var srcEle = null, keyid = comp.$gui.keyid, nextKey = '';
    var oldLnkId = typeof keyid == 'string' && keyid[0] == '$'? keyid: '$'+keyid;
    if (ownerObj) {
      var idx = ownerObj.$gui.compIdx[keyid], comps = ownerObj.$gui.comps;
      if (typeof idx == 'number') {
        srcEle = comps[idx++];
        
        while (idx < comps.length) {
          var tmpEle = comps[idx++], tmpKey = tmpEle && utils.keyOfElement(tmpEle);
          if (!tmpKey) continue;
          if (tmpKey != oldLnkId) {
            nextKey = tmpKey;
            break;
          }
        }
      }
    }
    if (!srcEle || !option.linkPath)
      return doCallback();
    
    var ownerNode = ownerObj.getHtmlNode();
    if (ownerNode && isUnderLinker(ownerNode)) {
      utils.instantShow('error: can not modify widget under a linker.');
      return doCallback();
    }
    
    var bStated = comp._._statedProp || [];
    var bSilent = comp._._silentProp || [];
    var dProp = Object.assign({},srcEle.props['link.props']);
    bStated.forEach( function(item) {
      if (dProp.hasOwnProperty(item))
        dProp[item] = comp.state[item];
    });
    bSilent.forEach( function(item) {
      delete dProp[item];
    });
    
    var lnkKey = keyid + '';
    if (lnkKey[0] != '$') lnkKey = '$' + lnkKey;
    dProp['keyid.'] = dProp.key = lnkKey;
    dProp['$'] = option.linkPath;
    if (dStyles)
      dProp.styles = dStyles;
    else delete dProp.styles;
    
    srcEle = React.createElement(option.flag == 2?RefDiv__:RefSpan__,dProp);
    ownerObj.setChild('-'+keyid,'-'+oldLnkId, function(changed) {
      succ = true;
      if (nextKey)
        ownerObj.setChild('+'+nextKey,srcEle,doCallback);
      else ownerObj.setChild(srcEle,doCallback);
    });
    
    function doCallback() {
      if (callback) {
        setTimeout( function() {
          var newChild = owner[keyid];  // keyid not changed
          newChild = newChild && newChild.component;
          if (newChild)
            retNode = newChild.getHtmlNode();
          callback(succ,retNode);
        },300); // wait Refxx ready
      }
    }
  };
  
  containNode_.saveNodeContent = function(comp,sNewTxt,callback) {
    var succ = false, retNode = null;
    
    if (typeof comp == 'string') {
      comp = W.W(comp);
      comp = comp && comp.component;
    }
    if (!comp || !comp.props)
      return doCallback();
    
    var wdgt = comp.widget, owner = wdgt && wdgt.parent;
    var ownerObj = owner && owner.component;
    var srcEle = null, keyid = comp.$gui.keyid, nextKey = '';
    if (ownerObj) {
      var idx = ownerObj.$gui.compIdx[keyid], comps = ownerObj.$gui.comps;
      if (typeof idx == 'number') {
        srcEle = comps[idx++];
        
        var oldLnkId = typeof keyid == 'string' && keyid[0] == '$'? keyid: '$'+keyid;
        while (idx < comps.length) {
          var tmpEle = comps[idx++], tmpKey = tmpEle && utils.keyOfElement(tmpEle);
          if (!tmpKey) continue;
          if (tmpKey != oldLnkId) {
            nextKey = tmpKey;
            break;
          }
        }
      }
    }
    if (!srcEle)
      return doCallback();
    
    var currNode = comp.getHtmlNode();  // comp is not linked linker
    var ownerNode = currNode && currNode.parentNode;
    if (ownerNode && isUnderLinker(ownerNode)) {
      utils.instantShow('error: can not save widget content under a linker.');
      return doCallback();
    }
    
    if (currNode && currNode.children.length == 0) {
      var dProp = comp.props['link.props'];
      if (dProp) { // is linker
        var lnkCls = RefDiv__, lnkPath = comp.props['data-unit.path'];
        if (!lnkPath) {
          lnkPath = comp.props['data-span.path'];
          lnkCls = RefSpan__;
        }
        if (!lnkPath) return doCallback(); // system error
        
        var bStated = comp._._statedProp || [];
        var bSilent = comp._._silentProp || [];
        dProp = Object.assign({},dProp);   // includes dProp.styles
        bStated.forEach( function(item) {
          if (dProp.hasOwnProperty(item))
            dProp[item] = comp.state[item];
        });
        bSilent.forEach( function(item) {
          delete dProp[item];
        });
        
        dProp['$'] = lnkPath;
        if (sNewTxt)
          dProp['html.'] = sNewTxt;
        else delete dProp['html.'];
        var lnkKeyid = keyid + '';
        if (lnkKeyid[0] != '$') lnkKeyid = '$' + lnkKeyid;
        dProp.key = dProp['keyid.'] = lnkKeyid;
        
        srcEle = React.createElement(lnkCls,dProp);
        ownerObj.setChild('-'+keyid,'-'+lnkKeyid, function(changed) {
          succ = true;
          if (nextKey)
            ownerObj.setChild('+'+nextKey,srcEle,doCallback);
          else ownerObj.setChild(srcEle,doCallback);
        });
      }
      else {
        var dProp = creator.getCompRenewProp(comp);
        if (!dProp) return doCallback();  // system error
        
        dProp['html.'] = sNewTxt? sNewTxt: undefined;
        dProp.key = keyid + '';
        dProp['keyid.'] = keyid;
        srcEle = creator.deepCloneReactEle(srcEle,dProp,wdgt,comp);
        
        ownerObj.setChild('-'+keyid, function(changed) {
          succ = true;
          if (nextKey)
            ownerObj.setChild('+'+nextKey,srcEle,doCallback);
          else ownerObj.setChild(srcEle,doCallback);
        });
      }
    }
    else doCallback();
    
    function doCallback() {
      if (callback) {
        var newChild = owner[keyid];  // keyid not changed
        newChild = newChild && newChild.component;
        if (newChild)
          retNode = newChild.getHtmlNode();
        callback(succ,retNode);
      }
    }
  };
  
  containNode_.onlyScenePage = function() {
    var topObj = topmostWidget_, iScene = 0, iOther = 0;
    topObj = topObj && topObj.component;
    if (topObj) {
      topObj.$gui.comps.forEach( function(child) {
        var sKey = child && utils.keyOfElement(child);
        if (sKey && sKey != '$pop') {
          if (child.props['isTemplate.']) return;
          if (child.props['isScenePage.'])
            iScene += 1;
          else iOther += 1;
        }
      });
    }
    return (iScene > 0 && iOther == 0);
  };
  
  containNode_.selectMultWdgt = function(keyid,x1,y1,x2,y2) {
    var bRet = [], wdgt = topmostWidget_ && topmostWidget_.W(keyid), pageObj = wdgt && wdgt.component;
    if (pageObj && pageObj.props['isScenePage.']) {
      var fromRightBtm = y1 >= y2 && x1 >= x2;  // select from right-bottom
      var x1_ = Math.min(x1,x2), y1_ = Math.min(y1,y2), x2_ = Math.max(x1,x2), y2_ = Math.max(y1,y2);
      pageObj.$gui.comps.forEach( function(child) {
        if (!child) return;
        var subKey = utils.keyOfElement(child), childObj = subKey && subKey[0] != '$' && wdgt[subKey];
        childObj = childObj && childObj.component;
        if (childObj) {
          var node = childObj.getHtmlNode();
          if (node) {
            var r = node.getBoundingClientRect();
            if (r.width == 0 && r.height == 0) return;  // ignore none-area widget
            if (parseInt(node.style.zIndex || 0) <= -999) return; // exclude -999
            
            if (fromRightBtm) {
              if (isInteract(x1_,y1_,x2_,y2_,r.left,r.top,r.left+r.width,r.top+r.height))
                bRet.push([subKey,r.left,r.top,r.width,r.height]);
            }
            else {
              if (isInclude(x1_,y1_,x2_,y2_,r.left,r.top,r.width,r.height))
                bRet.push([subKey,r.left,r.top,r.width,r.height]);
            }
          }
        }
      });
    }
    return bRet;
    
    function isInteract(x1,y1,x1_,y1_,x2,y2,x2_,y2_) {
      if (x1 < x2_ && y1 < y2_ && x1_ >= x2 && y1_ >= y2)
        return 1;
      else return 0;
    }
    
    function isInclude(x1,y1,x1_,y1_,x2,y2,w2,h2) { // Area1 includes Area2?
      var x2_ = x2 + w2, y2_ = y2 + h2;  // right-bottom of Area2
      if (x2 >= x1 && y2 >= y1 && x2_ < x1_ && y2_ < y1_)
        return 1;
      else return 0;
    }
  };
  
  containNode_.moveSceneWdgt = function(pathInfo,detaX,detaY) {
    var bRet = [];
    if (typeof pathInfo == 'string') {
      var wdgt = W.W(pathInfo), obj = wdgt && wdgt.component;
      if (obj) { // keep null after added if state.left/top is not a number
        var iLeft_ = obj.state.left, iTop_ = obj.state.top;
        obj.setState( {left: (typeof iLeft_ != 'number')? null:iLeft_+detaX,
          top: (typeof iTop_ != 'number')? null:iTop_+detaY,
        });
        bRet.push(obj.$gui.keyid+'');
      }
    }
    else if (Array.isArray(pathInfo) && pathInfo.length >= 2) {
      var keyid = pathInfo[0], wdgt = topmostWidget_ && topmostWidget_.W(keyid);
      var pageObj = wdgt && wdgt.component;
      if (pageObj && pageObj.props['isScenePage.']) {
        pathInfo.slice(1).forEach( function(sKey) {
          var child = wdgt[sKey], childObj = child && child.component;
          if (childObj) {
            bRet.push(sKey);
            var iLeft_ = childObj.state.left, iTop_ = childObj.state.top;
            childObj.setState( {left: (typeof iLeft_ != 'number')? null:iLeft_+detaX,
              top: (typeof iTop_ != 'number')? null:iTop_+detaY,
            });
          }
        });
      }
    }
    // else, do nothing
    return bRet;
  };
  
  var widgetCompHead_ = 'SHADOW_WIDGET_COMPONENT';
  containNode_.dumpWidget = function(wdgtPath,callback) {
    var succ = false, sText = '';
    function doCallback() {
      if (callback) callback(succ,sText);
    }
    
    try {
      var bRet = null, sTag = ',0,';  // 0 for normal widget, 1 for ScenePage's widget
      if (Array.isArray(wdgtPath)) {
        var sceneId = wdgtPath[0], wdgt = topmostWidget_ && topmostWidget_.W(sceneId);
        var wdgtObj = wdgt && wdgt.component;
        if (wdgtObj && wdgtObj.props['isScenePage.']) {
          sTag = ',1,'; bRet = [];
          for (var i=1,sKey; sKey=wdgtPath[i]; i+=1) {
            var child = wdgt[sKey];
            if (child) {
              var bTree = [];
              containNode_.dumpTree(bTree,child,'');
              if (bTree.length == 1)
                bRet.push(bTree[0]);
            }
          }
          if (bRet.length == 0) bRet = null;
        }
      }
      else if (typeof wdgtPath == 'string' && wdgtPath) {
        var wdgt = W.W(wdgtPath);
        if (wdgt) {
          bRet = [];
          containNode_.dumpTree(bRet,wdgt,'');
          if (bRet.length != 1) bRet = null;
        }
      }
      
      if (bRet) {
        sText = widgetCompHead_ + sTag + JSON.stringify(bRet);
        succ = true;
      }
    }
    catch(err) { }
    doCallback();
  };
  
  containNode_.pasteWidget = function(sTargPath,sText,rmvPath,callback) {
    var inputNum = 0, succNum = 0, beUnselect = true;
    var oldKeys = null, retNode = null, ownerObj = null;
    function doCallback(sMsg) {
      if (rmvPath) {
        if (succNum && succNum == inputNum) { // remove cut-widget only when all paste OK
          if (typeof rmvPath == 'string') {
            var rmTarg = W.W(rmvPath);
            var rmObj = rmTarg && rmTarg.component;
            if (rmObj) {
              var rmOwner = rmTarg.parent, rmkey = rmObj.$gui.keyid;
              var rmOwnerObj = rmOwner && rmOwner.component;
              if (rmOwnerObj)
                rmOwnerObj.setChild('-' + rmkey);
            }
          }
          else if (Array.isArray(rmvPath)) {
            var pgKey = rmvPath[0], pages = rmvPath.slice(1);
            var scenePg = topmostWidget_ && topmostWidget_.W(pgKey);
            var scenePgObj = scenePg && scenePg.component;
            if (scenePgObj) {
              var bArgs = pages.map( function(item) { return '-'+item; } );
              if (bArgs.length)
                scenePgObj.setChild.apply(scenePgObj,bArgs);
            }
          }
        }
      }
      if (sMsg) utils.instantShow(sMsg);
      if (callback) {
        setTimeout( function() {
          if (oldKeys && ownerObj) {
            var b = Object.keys(ownerObj.$gui.compIdx);
            for (var i = b.length-1; i >= 0; i--) {
              var item = b[i];
              if (item[0] != '$' && oldKeys.indexOf(item) < 0) {
                var tmp = ownerObj.widget[item];
                tmp = tmp && tmp.component;
                if (tmp) retNode = tmp.getHtmlNode();
              }
            }
          }
          callback(succNum,beUnselect,retNode);
        },0); // maybe remove some widget, return in next tick
      }
    }
    
    var bInput = null;
    if (sText.indexOf(widgetCompHead_) != 0 || sText[widgetCompHead_.length+3] == '[') {
      try {
        bInput = JSON.parse(sText.slice(widgetCompHead_.length+3));
      }
      catch(e) { }
    }
    if (!Array.isArray(bInput)) return doCallback('paste failed: invalid JSON input.');
    
    // step 1: get targ,owner, and check in ScenePage or not
    var targ = W.W(sTargPath), targObj = targ && targ.component;
    if (!targObj) return doCallback();
    
    var owner = null;
    var inScene = targObj.props['isScenePage.']; // if inScene, fix to append child to owner, else insert before targ
    if (!inScene) {
      owner = targ.parent;
      ownerObj = owner && owner.component;
      if (!ownerObj) return doCallback();
      if (ownerObj.props['isScenePage.'])
        inScene = true;
    }
    else {
      owner = targ;
      ownerObj = targObj;
      targ = null; targObj = null; // no use from now
    }
    
    if ((ownerObj.state.style || {}).position == 'absolute')
      beUnselect = true;  // if add to absolute-widget, need unselect after added
    
    // step 2: load widget from sText
    var bEle = [], meetErr = false;
    bInput.forEach( function(bTree) {
      var srcEle = utils.loadElement(bTree);
      if (!srcEle)
        meetErr = true;
      else bEle.push(srcEle);
    });
    if (meetErr) return doCallback('paste failed: invalid format.');
    inputNum = bEle.length;
    if (inputNum == 0)
      return doCallback('nothing to paste.');
    else if (inputNum == 1 && inScene)
      oldKeys = Object.keys(ownerObj.$gui.compIdx);
    
    // step 3: add widgets
    var tarType = 0, tarIsRow = false;
    if (!inScene) {
      if (isUnderLinker(ownerObj.getHtmlNode())) {
        utils.instantShow('error: can not paste widget to a linker.');
        return doCallback();
      }
      
      if (inputNum != 1) {
        utils.instantShow('warning: only one widget can be inserted into none-ScenePage.');
        bEle.splice(1);
        inputNum = 1;
      }
      tarType = (ownerObj.$gui.isPanel || owner === topmostWidget_)? 0: (utils.hasClass(ownerObj,'rewgt-unit')?1:3);
      if (tarType == 1 && ownerObj.props['childInline.']) tarType = 2;
      if (tarType == 1 && tarNodeObj.props['isTableRow.']) tarIsRow = true;
    }
    for (var i=0,srcEle; srcEle = bEle[i]; i += 1) {
      var srcIsScene = srcEle.props['isScenePage.'];
      if (srcIsScene) {
        if (!inScene) {
          utils.instantShow('error: ScenePage can only insert into topmost widget.');
          return doCallback();
        }
        // else, assert(srcIsScene && inScene);
        
        beUnselect = true;
        if (!insertNewComp(srcEle,true))
          return doCallback();
        succNum += 1;
        continue;
      }
      
      var srcClass = ' ' + srcEle.props.className + ' ';
      var srcType = srcClass.indexOf(' rewgt-panel ') >= 0? 0: (srcClass.indexOf(' rewgt-unit ') >= 0?1:3);
      if (srcType == 1 && srcEle.props['childInline.']) srcType = 2;
      if (!canInsertInto(srcType,tarType,tarIsRow))
        return doCallback();
      if (!insertNewComp(srcEle,false))
        return doCallback();
      succNum += 1;
    }
    
    setTimeout( function() {
      doCallback();  // return in next tick
    },0);
    
    function insertNewComp(srcEle,srcIsScene) {
      if (srcIsScene) { // inScene, insert before owner
        var owner_ = owner.parent, ownerObj_ = owner_ && owner_.component;
        if (!ownerObj_) return false; // system error, ignore
        
        srcEle = React.cloneElement(srcEle,{'keyid.':'',key:''});
        ownerObj_.setChild('+'+ownerObj.$gui.keyid,srcEle); // insert before current ScenePage
        return true;
      }
      
      var unitLnk = srcEle.props['data-unit.path'], spanLnk = srcEle.props['data-span.path'];
      var sLnkPath = '', sLnkAttr = typeof unitLnk == 'string'? 'data-unit.path': (typeof spanLnk == 'string'? 'data-span.path': ''); 
      if (sLnkAttr) {
        if (owner === topmostWidget_) {
          utils.instantShow('error: can not use linker under topmost widget.');
          return false;
        }
        sLnkPath = spanLnk || unitLnk;  // sLnkPath can be empty
      }
      
      var needCopy = false, sSrcKey = utils.keyOfElement(srcEle), autoKey = false;
      if (!sSrcKey || typeof sSrcKey != 'string')
        needCopy = true;
      else {  // sSrcKey is string
        autoKey = sSrcKey.search(/^auto[0-9]+$/) == 0;
        if (autoKey || (parseInt(sSrcKey)+'') === sSrcKey)
          needCopy = true;
        else if (typeof ownerObj.$gui.compIdx[sSrcKey] == 'number')
          needCopy = true;
      }
      
      if (needCopy || sLnkAttr || inScene) {
        var dProp = {};
        if (needCopy) {
          if (autoKey && ownerObj.props['isScenePage.']) {
            var iAuto2 = ownerObj.$gui.removeNum + ownerObj.$gui.comps.length;
            var sAuto2 = 'auto' + iAuto2;
            while (typeof ownerObj.$gui.compIdx[sAuto2] == 'number') {
              iAuto2 += 1;
              sAuto2 = 'auto' + iAuto2;
            }
            dProp['keyid.'] = dProp.key = sAuto2;
          }
          else dProp['keyid.'] = dProp.key = '';
        }
        // else, autoKey must be false
        
        if (sLnkAttr) dProp[sLnkAttr] = sLnkPath;
        if (inScene) { // maybe paste from none scene page
          dProp.left = srcEle.props.left || 0;
          dProp.top = srcEle.props.top || 0;
        }
        srcEle = React.cloneElement(srcEle,dProp);
      }
      
      if (inScene)
        ownerObj.setChild(srcEle); // append to tail
      else ownerObj.setChild('+'+targObj.$gui.keyid,srcEle); // insert before
      return true;
    }
  };
  
  containNode_.firstChildOf = function(sPath,onlyNormal) {
    var wdgt = W.W(sPath), obj = wdgt && wdgt.component;
    if (obj) {
      var comps = obj.$gui.comps, iLen = comps.length;
      for (var i=0; i < iLen; i += 1) {
        var child = comps[i], sKey = child && utils.keyOfElement(child);
        if (sKey) {
          if (onlyNormal && sKey[0] == '$') continue;
          var subWdgt = wdgt[sKey], subObj = subWdgt && subWdgt.component;
          if (subObj) return subObj.getHtmlNode();
        }
      }
    }
    return null;
  };
  
  callback();
});

});
