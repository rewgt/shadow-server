/*
  jquery.popline.blockformat.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by kenshin54
*/
;(function($) {

  var tags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "VOID"];
  var sizerCls = "S1 S2 S3 S4 S5 S6 ";
  
  var resetSizeClass = function(node,tag) {
    for (var i=0,item; item=node.classList[i]; i++) {
      if (sizerCls.indexOf(item) >= 0) {
        node.classList.remove(item);
        break;
      }
    }
    node.classList.add(tag);
  };
  
  var findSpanNode = function(node) {
    var last = null;
    for (var i=0,item; item=node.childNodes[i]; i++) {
      if (item.nodeType === 1) {
        if (last)
          return null;
        else {
          if (item.tagName == "B" || item.tagName == "I" || item.tagName == "STRIKE" || item.tagName == "U") {
            if (node.childElementCount == 1)
              return findSpanNode(item);
            else return null;
          }
          else if (item.tagName == "SPAN")
            last = item;
          else return null;
        }
      }
      else if (item.nodeType === 3 && $.popline.utils.trim($(item).text()) !== "")
        return null;
    }
    return last;
  };
  
  var removeDupSpan = function(node,tag) {
    var owner_=node.parentNode, owner=owner_;
    while (owner) {
      if (owner.tagName == "B" || owner.tagName == "I" || owner.tagName == "STRIKE" || owner.tagName == "U")
        owner = owner.parentNode;
      else {
        if (owner.tagName != "SPAN")
          owner = null;
        break;
      }
    }
    
    if (owner) {  // assert(owner.tagName == "SPAN");
      var isEmpty = true;
      for (var i=0,item; item=owner_.childNodes[i]; i++) {
        if (item === node)
          continue;
        else if (item.nodeType == 3) {
          if ($.popline.utils.trim($(item).text()) != "") {
            isEmpty = false;
            break;
          }
        }
        else {
          isEmpty = false;
          break;
        }
      }
    
      if (isEmpty) {
        owner_.removeChild(node);
        for (var i=0,item; item=node.childNodes[i]; i++) {
          owner_.appendChild(item);
        }
        resetSizeClass(owner,tag);
        return owner;
      }
    }
    
    node.classList.add(tag);
    return node;
  };
  
  var removeEmptyTag = function(node) {
    if ($.popline.utils.trim($(node).text()) === "") {
      $(node).remove();
    }
  };
  
  var wrap = function(tag) {
    var range = window.getSelection().getRangeAt(0);
    var anchorNode=window.getSelection().anchorNode, focusNode=window.getSelection().focusNode;
    
    if (sizerCls.indexOf(tag) >= 0) {
      if (focusNode.nodeType == 1 && focusNode.tagName == "SPAN") {
        resetSizeClass(focusNode,tag);
      }
      else {
        if ($.popline.utils.browser.firefox) {
          var fragment = range.extractContents();
          var node = findSpanNode(fragment); // can not find span in webkit
          if (node) {
            resetSizeClass(node,tag)
            range.insertNode(node);
          }
          else {
            node = document.createElement("SPAN");
            node.classList.add(tag);
            node.appendChild(fragment);
            range.insertNode(node);
          }
          window.getSelection().selectAllChildren(node);
        }
        else {
          var fragment = range.extractContents();
          var node = document.createElement("SPAN");
          node.appendChild(fragment);
          range.insertNode(node);
  
          node = removeDupSpan(node,tag); // work in webkit, but failed in firefox
          window.getSelection().selectAllChildren(node);
        }
      }
      return;
    }
    
    var matchedNode = $.popline.utils.findNodeWithTags(focusNode,tags);
    tag = matchedNode && matchedNode.tagName === tag ? "VOID" : tag;
    var node = document.createElement(tag);
    var fragment = range.extractContents();
    
    removeEmptyTag(matchedNode);

    var textNode = document.createTextNode($(fragment).text());
    node.appendChild(textNode);

    range.insertNode(node);
    window.getSelection().selectAllChildren(node);
  }

  $.popline.addButton({
    blockFormat: {
      text: "H",
      mode: "edit",
      buttons: {
/*      s1: {
          text: "s1",
          action: function(event) {
            wrap("S1");
          }
        }, */
        s2: {
          text: "s2",
          action: function(event) {
            wrap("S2");
          }
        },
        s3: {
          text: "s3",
          action: function(event) {
            wrap("S3");
          }
        },
        s4: {
          text: "s4",
          action: function(event) {
            wrap("S4");
          }
        },
        s5: {
          text: "s5",
          action: function(event) {
            wrap("S5");
          }
        },
        s6: {
          text: "s6",
          action: function(event) {
            wrap("S6");
          }
        },
        normal: {
          text: "p",
          textClass: "lighter",
          action: function(event) {
            wrap("P");
          }
        },
        h1: {
          text: "h1",
          action: function(event) {
            wrap("H1");
          }
        },
        h2: {
          text: "h2",
          action: function(event) {
            wrap("H2");
          }
        },
        h3: {
          text: "h3",
          action: function(event) {
            wrap("H3");
          }
        },
        h4: {
          text: "h4",
          action: function(event) {
            wrap("H4");
          }
        },
        h5: {
          text: "h5",
          action: function(event) {
            wrap("H5");
          }
        },
/*      h6: {
          text: "h6",
          action: function(event) {
            wrap("H6");
          }
        },  */
      },
      afterHide: function(popline){
        popline.target.find("void").contents().unwrap();
      }
    }
  });

})(jQuery);
