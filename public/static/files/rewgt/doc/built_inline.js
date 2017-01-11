// built_inline.js

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

function getAsynRequest(sUrl,callback) {  // callbac must passed
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

( function() {
  var param = getUrlParam(window.location.search.slice(1));
  var sLang = decodeURIComponent(param.lang || 'zh');
  var sBase = 'doc_' + sLang + '/#';
  
  var nodes = document.querySelectorAll('div.doc-body'), count = 0;
  for (var i=0,node; node=nodes[i]; i++) {
    var src = node.getAttribute('src');
    var base = node.getAttribute('base') || '';
    if (src) fillContent(node,src,base,++count == 1);
  }
  
  function fillContent(node,sUrl,baseDir,isFirst) {
    getAsynRequest(baseDir+sUrl, function(err,sTxt) {
      if (err) {
        console.log(err);
        return;
      }
      
      var b = sTxt.split('\n');
      var sName = b.shift();
      while (!sName && b.length) sName = b.shift();
      var sHash = b.shift();
      while (!sHash && b.length) sHash = b.shift();
      if (sName && sHash) {
        var h3Node = document.createElement('h3');
        var aNode = document.createElement('a');
        aNode.setAttribute('class','shadow-cls');
        aNode.setAttribute('target','_blank');
        aNode.setAttribute('href',baseDir+sBase+sHash);
        aNode.textContent = sName;
        h3Node.appendChild(aNode);
        node.appendChild(h3Node);
        
        if (isFirst) document.title = sName;
      }
      else return;  // fatal error
      
      var newSegment = false, sSegment = '', lastUl = null;
      while (true) {
        var sItem = b.shift();
        while (!sItem && b.length) {
          sItem = b.shift();
        }
        if (!sItem) break;
        
        if (sItem[0] == ' ') {
          if (newSegment) {
            newSegment = false;
            var pNode = document.createElement('p');
            pNode.textContent = sSegment;
            // pNode.style.fontWeight = '600';
            node.appendChild(pNode);
            
            lastUl = document.createElement('ul');
            node.appendChild(lastUl);
          }
          
          if (lastUl) {
            var liNode = document.createElement('li');
            var codeNode = document.createElement('code');
            codeNode.textContent = sItem.trim();
            liNode.appendChild(codeNode);
            lastUl.appendChild(liNode);
          }
        }
        else {
          sSegment = sItem;
          newSegment = true;
        }
      }
    });
  }
})();
