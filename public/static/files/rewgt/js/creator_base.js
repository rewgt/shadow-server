window.W||(window.W=new Array,W.$modules=[]),W.$modules.push(function(a,b,c){function n(a,b,c,d){function e(a){a=a&&a.component,d&&d(a)}function q(a,b){function g(){var b=c.shift();if(!b)return e(a);a=a[b];var d=a&&a.component;if(!d)return e(null);var f=d.props["isTemplate."];if(!f||"none"!=(d.state.style||{}).display)return g();var h=3==f?"inline":2==f?"block":"flex",i=Object.assign({},d.state.style,{display:h});d.setState({style:i},g)}var c=b.split(".");if(!a){var d=c.shift();d||(d=c.shift()),a=m;var f=a&&a.component;if(!f||f.$gui.keyid!=d)return e(null)}return g()}var g=j.pathLevelInfo(b);if(!g)return e(null);var h=g[0],i=g[1],k=g[2];if(k){if(a){var l=a.widget,n=l;if(c&&(n=n&&n.parent),i<0&&(n=n&&n.parent),n)return q(n,h)}}else if(i==-1){if(h)return q(null,h)}else{if(!a)return e(null);for(var l=a.widget;l&&i>0;){var o=l&&l.component;if(o&&o.props["isNavigator."]&&(i-=1,0==i))break;var p=l.parent;if(!p){i-=1,l=f;break}l=p}if(l&&0==i)return h?q(l,h):e(l)}return e(null)}function o(a,b,c){for(var d=c?0:1,e=a.split("."),g=b.split("."),h=Math.min(e.length,g.length),i="",j=0,k=0;k<h;k++){var l=e[k],m=g[k];if(l!=m){k>0&&(j=k,i=e.slice(0,j).join("."));break}}var n="";if(i)if(g.length>=e.length&&j>=2&&j==e.length-d)n=g.slice(j).join(".");else{for(var o=!1,p="",q=f.W(i);q;){var r=q.component;if(!r){q!==f&&(p="");break}if(r.props["isNavigator."]){o=!0;break}p="."+r.$gui.keyid+p,q=q.parent}if(!p&&!o)return"";n=g.slice(j).join("."),o?(p&&(p=p.slice(1)),n=p?"./"+p+(n?".":"")+n:"./"+n):p&&(n=p+(n?".":"")+n)}else n=b;return n}function p(a,b){function z(a){if(!a)return"";var b=k[a];if(b)return b;var c=a[0];if("#"==c&&4==a.length)return"#"+a[1]+a[1]+a[2]+a[2]+a[3]+a[3];if("#"==c&&7==a.length)return a;if("rgb"==a.slice(0,3)&&(a=a.slice(3).trim(),"("==a[0]&&")"==a.slice(-1))){var d=a.slice(1,-1).split(",");if(3==d.length)return b="#"+("0"+parseInt(d[0]).toString(16)).slice(-2),b+=("0"+parseInt(d[1]).toString(16)).slice(-2),b+=("0"+parseInt(d[2]).toString(16)).slice(-2)}return""}var c=a._;if(!c||!c._getGroupOpt)return null;var d,e,f=void 0,g=c._statedProp||[],i=c._slientProp||[],j=c._className,l={name:j,desc:c._classDesc,option:c._getGroupOpt(a),doc:c._docUrl||"",linkPath:"",linkStyles:null},m=0;f=a.state["data-unit.path"],void 0!==f?(m=2,j="RefDiv"):(f=a.state["data-span.path"],void 0!==f&&(m=3,j="RefSpan")),void 0===f?a.props["childInline."]?m=h.hasClass(a,"rewgt-unit")?2:3:h.hasClass(a,"rewgt-unit")&&(m=1):(l.linkPath=f,l.linkStyles=a.props.styles,g=[],i=[]),l.flag=m;var n,o;if(void 0!==f){var p=a.props["link.props"];if(!p)return null;if(d=Object.assign({},p),e=d.style||{},delete d.style,delete d.styles,n=d["keyid."],"string"==typeof n)if("$"==n[0]){n=n.slice(1);var q=parseInt(n);q+""==n?(d["keyid."]=q,o=n=""):o=d["keyid."]=n}else o=n;else o=n=""}else{if(a.props["isReference."])return null;d=Object.assign({},a.props),e=d.style||{},delete d.style,n=a.$gui.keyid,o="string"!=typeof n?n="":n,a.$gui.dataset.forEach(function(b){var c=a.state[b];void 0!==c&&(d[b]=c)})}g.forEach(function(b){var c=a.state[b];void 0!==c&&(d[b]=c)});var r=d["html."];r&&(l["html."]=r),i.forEach(function(a){delete d[a]}),delete d.children,delete d["hasStatic."],d.key=o;var s={},t=!1,u=Object.keys(d),v=100,w={key:{propertyOrder:v,type:"string",default:n}};u.forEach(function(a){var c=a.indexOf(".");if(c>=0){if(c==a.length-1)return;return s[a]=d[a],void(t=!0)}var e=d[a],f=!1;if(void 0!==e){if(0!=a.indexOf("data-")&&0!=a.indexOf("aria-")||(f=!0),"klass"==a){if("string"!=typeof e)return;var g=e.split(/[^-_a-zA-Z0-9]+/);if(0==g.length)return;return v+=1,void(w.klass={type:"array",options:{disable_array_reorder:!0},propertyOrder:v,items:{type:"string",format:"classname"},default:g})}var h=b[a],i="any",j=-1,k=null,l="";if(h){if(0==h.length)return;j=h[0],i=h[1]||"any",k=h[2]||null,l=h[3]||""}j<0&&(v+=1,j=v);var m={propertyOrder:j,default:e},n=!0;if(k&&(m.enum=k),l&&(m.description=l),f)m.type="string","string"!=typeof e&&(m.default=JSON.stringify(e));else if(null===e||"any"==i)"string"!=typeof e&&(m.default=JSON.stringify(e));else if("integer"==i){var o=parseInt(e);o+""==e+""?(m.type=i,m.default=o):n=!1}else"number"==i||"boolean"==i||"array"==i||"object"==i?"array"==i&&Array.isArray(e)?m.type=i:typeof e==i?m.type=i:n=!1:"string"==typeof e?(m.type="string","string"!=i&&(m.format=i)):n=!1;n||("string"!=typeof e&&(m.default=JSON.stringify(e)),console.log("warning: property ("+a+") is not match to expected type ("+i+").")),w[a]=m}}),t&&(l.propsEx=s);var x=Object.keys(e);if(x.length){var y={};v+=1,w.style={type:"object",properties:y,propertyOrder:v},x.sort(),x.forEach(function(a){var b,c={type:"string",default:e[a]+""};if("color"==a||(b=a.indexOf("Color"))>0&&b+5==a.length){var d=z(c.default.trim());d&&(c.default=d,c.format="color")}y[a]=c})}return{type:"object",title:j+" - "+o,properties:w,wdgtOption:l}}var d=a("react"),e=a("react-dom"),f=a("shadow-widget"),g=f.$main,h=f.$utils,i=f.$templates,j=f.$creator,k={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dodgerblue:"#1e90ff",feldspar:"#d19275",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslateblue:"#8470ff",lightslategray:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",violetred:"#d02090",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"},l=null,m=null;g.$$onLoad.push(function(a){function g(a,b,c){if(3==b){if(3!=a)return h.instantShow("error: can not insert none-inline into inline widget."),!1}else if(2==b){if(0==a)return h.instantShow("error: can not insert panel into paragraph."),!1}else if(1==b){if(0==a){if(!c)return h.instantShow("error: can not insert panel into none-panel."),!1}else if(3==a)return h.instantShow("error: inline widget can not be inserted into panel or div."),!1}else if(3==a)return h.instantShow("error: inline widget can not be inserted into panel or div."),!1;return!0}function t(a,c,f,g,i,k){function P(){if(l){var a=B||0===B?B+"":"";f.linkPath&&"$"==a[0]&&(a=a.slice(1)),setTimeout(function(){a||(a=G.comps.length+G.removeNum-1);var b=p[a];b=b&&b.component,b&&(m=e.findDOMNode(b),i&&(q=b)),k&&k(l,m)},300)}else k&&k(l,m)}var l=!1,m=null,n=null,o=a.widget,p=o&&o.parent,r=p&&p.component;if(!r)return h.instantShow("warning: update property failed (out of date)."),P();if("object"!=typeof g)return P();var s=e.findDOMNode(a),t=s&&s.parentNode;if(t&&b(t))return h.instantShow("error: can not modify widget that under linker."),P();var u,v=g.klass;if(Array.isArray(v)){var w="";v.forEach(function(a){a&&(w?w+=" "+a:w=a+"")}),v=w?w:void 0}else void 0!==v&&(v=null);delete g.klass;var x=g.style;if(x&&x instanceof Object){var y={},z=!1;u=Object.keys(x),u.forEach(function(a){z=!0,y[a]=x[a]+""}),x=z?y:null}else x=null;delete g.style;var A=a.$gui.keyid,B=g.key,C=!1;"string"==typeof B?(B=B.trim(),B&&parseInt(B)+""==B&&(B="","string"==typeof A&&(C=!0))):B="",delete g["keyid."],delete g.key,u=Object.keys(g),u.forEach(function(a){var b=g[a];if(0==a.indexOf("data-")||0==a.indexOf("aria-"))return void(g[a]=b+"");if(void 0!==b){var d=c[a],e="any";if(d&&d.length&&(e=d[1]),"any"==e&&"string"==typeof b){var f=b.trim(),h=f[0];if(('"'==h||"'"==h)&&f.length>=2&&f.slice(-1)==h)g[a]=f.slice(1,-1);else if("["==h&&"]"==f.slice(-1)||"{"==h&&"}"==f.slice(-1))try{g[a]=JSON.parse(f)}catch(a){console.log("error: parse JSON failed, input string:"),console.log(f)}else if("null"==f)g[a]=null;else{var i=parseFloat(f);i+""===f&&(g[a]=i)}}}}),C?(g["keyid."]="",g.key=""):B?g["keyid."]=g.key=B:(g["keyid."]=B=A,g.key=B+""),x?g.style=x:a.props.style&&(g.style=void 0),null!==v&&(g.klass=v);var D=f.propsEx;D&&Object.keys(D).forEach(function(a){g.hasOwnProperty(a)||(g[a]=D[a])});var E="",F=["-"+A],G=r.$gui,H=G.compIdx[A];if("number"!=typeof H)return P();if(n=G.comps[H],!n)return P();if(f.linkPath){var I=2==f.flag?j.RefDiv__:j.RefSpan__;g.$=f.linkPath;var J;"string"==typeof A?("$"!=A[0]&&(E="$"+A,F.push("-"+E)),J=""===B?A:B):(E="$"+A,F.push("-"+E),J=B+""),J&&"$"!=J[0]&&(J="$"+J),J&&(g["keyid."]=g.key=J),f.linkStyles&&(g.styles=f.linkStyles),f["html."]&&!g.hasOwnProperty("html.")&&(g["html."]=f["html."]),n=d.createElement(I,g)}else n=j.deepCloneReactEle(n,g,o,a);for(var K=G.comps.length,L="",M=H+1;M<K;M+=1){var N=G.comps[M],O=N&&h.keyOfElement(N);if(O&&O!=E){L=O;break}}F.push(function(){l=!0,L?r.setChild("+"+L,n,P):r.setChild(n,P)}),r.setChild.apply(r,F)}l=j.containNode_,m=j.topmostWidget_,l.closeModal=function(a){function b(){a&&a()}var c=m&&m.component;if(!c)return b();var e=d.createElement(d.createClass(i.Panel._extend()),{"hookTo.":m,key:"$pop","keyid.":"$pop",left:0,top:0,width:0,height:0,style:{position:"absolute",zIndex:3016,overflow:"visible"}});c.setChild("$pop",e,b)},l.topmostNode=function(){var a=m&&m.component;return a?e.findDOMNode(a):null},l.pluginCss=function(){var a=[],b=f.$css||[];return b.forEach(function(b){if(Array.isArray(b)){var c=b[0],d=b[1];!d||"pseudo"!=c&&"basic"!=c&&"lazy"!=c||a.push(d+"")}}),a},l.getWidgetNode=function(a,b,c,d){function h(a){d&&d(a,g)}var g=!1;if(!a)return h(null);var i=null,j=a[0],k="/"!=a[1]&&("."==j||"/"==j);return!b||k||(i=f.W(b),i=i&&i.component)?(k&&(c=!1),void n(i,a,c,function(a){var b=null;a&&(g=!!a.props["isReference."],b=e.findDOMNode(a)),h(b)})):h(null)},l.getDocHtml=function(){var a=[];return l.dumpTree(a=[]),1==a.length?l.streamTree(a[0]):""},l.resetRootShow=function(a){var b=m,c=b&&b.component;if(c){var d=c.$gui.comps,e=[];d.forEach(function(a){if(a){var c=h.keyOfElement(a);if(c&&"$pop"!=c){var d=b[c];if(d=d&&d.component)if("absolute"==(d.state.style||{}).position)d.setState({style:Object.assign({},d.state.style,{display:"none"})});else{var f=h.hasClass(d,"rewgt-panel")?"flex":"block";e.push([d,f])}}}}),e.forEach(function(a){var b=a[1];a=a[0],a.setState({style:Object.assign({},a.state.style,{display:b})})})}a&&setTimeout(function(){a()},0)},l.showRootPage=function(a,b){function d(){b&&b(c)}var c="";if(!f.__design__||"$pop"==a)return d();var g=m,i=g&&g.component;if(i){var j=g[a];if(j=j&&j.component,!j)return d();var k=e.findDOMNode(j);k&&(k.classList.contains("rewgt-panel")?c="Panel":k.classList.contains("rewgt-unit")?c="Unit":k.classList.contains("rewgt-inline")&&(c="Span"),c&&(k.hasAttribute("data-temp.type")?c="Template":k.classList.contains("rewgt-scene")&&(c="ScenePage")));var l=!1;"absolute"==(j.state.style||{}).position&&(l=!0);var n=i.$gui.comps,o=[];n.forEach(function(b){if(b){var c=h.keyOfElement(b);if(c&&"$pop"!=c){var d=g[c];if(d=d&&d.component){var e,f=h.hasClass(d,"rewgt-panel")?"flex":"block";e="absolute"==(d.state.style||{}).position?l&&c==a?f:"none":l?"none":f,"none"==e?d.setState({style:Object.assign({},d.state.style,{display:"none"})}):o.push([d,e])}}}}),o.forEach(function(a){var b=a[1];a=a[0],a.setState({style:Object.assign({},a.state.style,{display:b})})})}d()},l.removeWidget=function(a,b){if(a&&"string"==typeof a){var c=f.W(a),d=c&&c.component;if(d){var e=c.parent,g=d.$gui.keyid,h=e&&e.component;if(h)return void h.setChild("-"+g,function(a){b&&b(a)})}}else if(Array.isArray(a)&&a.length>=2){var i=m&&m[a[0]],j=i&&i.component;if(j&&j.props["isScenePage."]){var k=[];return a.slice(1).forEach(function(a){k.push("-"+a)}),k.push(function(a){b&&b(a)}),void j.setChild.apply(j,k)}}b&&b(!1)},l.listPageChild=function(a){var b=[],c=m&&m[a],d=c&&c.component;if(d&&d.props["isScenePage."]){var f=d.$gui.comps||[];f.forEach(function(a){if(a){var d=h.keyOfElement(a);if("$"==d[0])return;var f=c[d];if(f=f&&f.component){var g=e.findDOMNode(f);g&&b.push([d,g])}}})}return b},l.listChildren=function(a){var b=[],c=[],d=-1,g="",i="#a00",j=!0,k=m;a&&(k=f.W(a),k!==m&&(j=!1));var l=k&&k.component;if(l){var n=l.$gui.comps||[],o=l.props["isNavigator."];n.forEach(function(a){if(a){var f=h.keyOfElement(a),g=f&&k[f];if(g=g&&g.component){if(j||o)if(j){if("$"==f[0]){if("$pop"==f)return;if("$"==f[1]&&a.props["isTemplate."])return}g.props["isScenePage."]&&c.push([f,e.findDOMNode(g)]);var l=g.state.style||{};"absolute"==l.position&&"none"!=l.display&&(d=b.length,i=g.props["isTemplate."]?"#00f":"#a00")}else g.props["isPlayground."]&&(d=b.length);b.push(f)}}}),g=l._._desc(l)}return[g,i,d,b,c]},l.resizeWidget=function(a,b,c,d,g){var i,l=f.W(a),m=!1,n=l&&l.component;if(n&&(i=e.findDOMNode(n))){if(h.hasClass(n,["rewgt-panel","rewgt-unit"])){var o=i.getBoundingClientRect(),p=n.state.width,q=n.state.height;if((1==b||3==b)&&"number"==typeof p)if(p>0&&p<1){p>=.9999&&(p=1);var r=Math.max(0,o.width+c);0==r?r=.001:(r/=o.width/p,r>=1&&(r=.9999)),n.state.width=r,m=!0}else p>=1&&(n.state.width=Math.max(1,o.width+c),m=!0);if((2==b||3==b)&&"number"==typeof q)if(q>0&&q<1){q>=.9999&&(q=1);var s=Math.max(0,o.height+d);0==s?s=.001:(s/=o.height/q,s>=1&&(s=.9999)),n.state.height=s,m=!0}else q>=1&&(n.state.height=Math.max(1,o.height+d),m=!0)}else if(n.props["childInline."]){var o=i.getBoundingClientRect(),t=Object.assign({},n.state.style);1!=b&&3!=b||(t.width=Math.max(0,o.width+c)+"px",n.state.style=t,m=!0),2!=b&&3!=b||(t.height=Math.max(0,o.height+d)+"px",n.state.style=t,m=!0)}if(m){var u=l.parent;return u=u&&u.component,void(u?j.renewWidgetSpared(u,!0,function(){n.reRender(function(){g&&g(m)})}):n.reRender(function(){g&&g(m)}))}}g&&g(m)},l.setSceneCurrent=function(a){m&&a.forEach(function(a){var b=a[0],c=a[1],d=m[b];d=d&&d.component,d&&d.props["isScenePage."]&&d.setSelected(c)})},l.hideTemplate=function(a,b){var c=f.W(a),d=c&&c.component;d&&d.props["isTemplate."]&&(b&&c.parent===m||d.setState({style:Object.assign({},d.state.style,{display:"none"})}))},l.showTemplate=function(a,b,c){function e(){c&&c(d)}var d=!1,g=f.W(a),h=g&&g.component;if(!h)return e();var i=h.props["isTemplate."];if(!i)return e();if(b&&g.parent===m)return e();var j=3==i?"inline":2==i?"block":"flex";d=!0,h.setState({style:Object.assign({},h.state.style,{display:j})},e)};var b=function(a){return!(!a||a===l)&&(!(!a.getAttribute("data-unit.path")&&!a.getAttribute("data-span.path"))||b(a.parentNode))};l.isUnderLinker=b;var c=function(a,b){for(;a&&a!==l;){if(a.classList.contains("rewgt-panel")||a.classList.contains("rewgt-unit")||a.classList.contains("rewgt-inline"))if(b>0)b-=1;else{var c,d=a.getAttribute("data-group.opt");if(d&&"all"!=(c=d.split("/")[1]||"all"))return c}a=a.parentNode}return"all"};l.getEditableFlag=c,l.bindLinker=function(a,c,g){function k(){g&&g(i)}function n(a){if(l=a.props["isReference."])return m=!0,!0;var b=a.props["data-unit.path"];return b?(l=1,!0):(b=a.props["data-span.path"],!!b&&(l=2,!0))}var i=!1,l=0,m=!1;if(a==c)return h.instantShow("error: can not link to self."),k();var p=f.W(a),q=f.W(c),r=p&&p.component,s=q&&q.component;if(!r||!n(r))return h.instantShow("error: source widget is not a linker."),k();if(!s)return h.instantShow("error: invalid target widget."),k();if(s.props["isTemplate."])return h.instantShow("error: can not link to a template."),k();if(2==l){if(!s.props["childInline."]||h.hasClass(s,"rewgt-unit"))return h.instantShow("error: RefSpan can only link to inline widget."),k()}else if(!h.hasClass(s,["rewgt-panel","rewgt-unit"]))return h.instantShow("error: RefDiv can only link to: panel, div, paragraph."),k();"number"==typeof s.$gui.keyid&&h.instantShow("warning: link to numbered-key is not suggested.");var t=o(a,c,!1);if(!t)return k();var u=p.parent,v=u&&u.component;if(!v)return k();if(b(e.findDOMNode(v)))return h.instantShow("error: binding path disallowed under a linker."),k();var w=r.$gui.keyid,x=w+"",y=x;"$"!=x[0]&&(w=x="$"+x);var z,A=null,B=v.$gui,C=B.compIdx[y];if("number"==typeof C&&(A=B.comps[C]),!A)return k();var D={$:t,key:x,"keyid.":w};if(m)z=d.cloneElement(A,D);else{var E=2==l?j.RefSpan__:j.RefDiv__;z=d.createElement(E,Object.assign(r.props["link.props"]||{},D))}var F=B.comps[C+1],G=F&&h.keyOfElement(F);v.setChild("-"+y,function(){i=!0,G?v.setChild("+"+G,z,k):v.setChild(z,k)})},l.createWidget=function(a,i,k,n,o,p,q){function u(){if(q){if(r)for(var c,a=Object.keys(z.$gui.compIdx),b=0;c=a[b];b+=1)if(!s.hasOwnProperty(c)&&"$"!=c[0]){var d=z.widget,f=d&&d[c],g=f&&f.component;g&&(t=e.findDOMNode(g));break}q(r,t)}}function Y(){var a=n?x:z;if(b(e.findDOMNode(a)))return h.instantShow("error: can not add widget to a linker."),u();var c=N.props["data-unit.path"],f=N.props["data-span.path"],g="",j="string"==typeof c?"data-unit.path":"string"==typeof f?"data-span.path":"";if(j){if(a.widget===m)return h.instantShow("error: can not use linker under topmost widget."),u();g=f||c,g||h.instantShow("warning: link path is empty.")}var k=h.keyOfElement(N),l=parseInt(k)+""==k,q=!1;l?q=!0:"number"==typeof a.$gui.compIdx[k]&&(q=!0);var t=R&&!T;if(q){var v={"keyid.":"",key:""};j&&(v[j]=g),t&&(v.left=o,v.top=p),i&&(v["data-group.optid"]=i+""),N=d.cloneElement(N,v)}else if(j||t||i){var v={};j&&(v[j]=g),t&&(v.left=o,v.top=p),i&&(v["data-group.optid"]=i+""),N=d.cloneElement(N,v)}r=!0,n?(z=x,Object.assign(s,z.$gui.compIdx),z.setChild(N,u)):(Object.assign(s,z.$gui.compIdx),z.setChild("+"+x.$gui.keyid,N,u))}var r=!1,s={},t=null,v=null;if(k)v=f.W(k);else{var w=l.children[0];w&&(v=m,k=l.frameInfo.rootName,n=!0)}var x=v&&v.component,y=v&&v.parent,z=y&&y.component;if(!x||!n&&!z)return h.instantShow("error: invalid target widget."),u();var A=e.findDOMNode(x);if(A&&"all"!=c(A,n?0:1))return h.instantShow("error: insert target is disallowed."),u();if(!a[0]){var B=a[1],C=B&&B.html;if(Array.isArray(C)){var D=n?x:z;if(t=e.findDOMNode(D),t&&b(t))return h.instantShow("error: can not add widget to a linker."),u();var E,F=C.join(""),G=document.createElement("div");if(G.innerHTML=F,(E=G.children.length)>0){for(var H=[],I=f.$staticNodes.push(H)-1,J=0;J<E;J+=1)H.push(G.children[J]);var K=D.$gui,L=K.comps.length+K.removeNum,M=I+"",B={"keyid.":L,key:L+"",className:"rewgt-static",name:M};f.__design__&&(B.onMouseDown=j.staticMouseDown,B.onDoubleClick=j.staticDbClick.bind(D));var N=d.createElement(D.props["childInline."]?"span":"div",B),O=K.compIdx;if(I=-1,n||(I=O[x.$gui.keyid]),"number"==typeof I&&I>=0){var O=O;for(var P in O){var Q=O[P];Q>=I&&(O[P]=Q+1)}K.comps.splice(I,0,N)}else I=K.comps.push(N)-1;O[L]=I,r=!0,D.reRender(function(){if(t){var a=t.querySelector('.rewgt-static[name="'+M+'"]');if(a)for(var c,b=0;c=H[b];b++)a.appendChild(c)}})}return void(q&&setTimeout(function(){q(r,t)},0))}}var N=h.loadElement(a);if(!N)return u();var R=null,S=null,T=N.props["isScenePage."];if(x.props["isScenePage."])R=x,S=v;else if(z&&z.props["isScenePage."])if(n){if(T)return h.instantShow("error: ScenePage can only insert into topmost widget."),u()}else R=z,S=y;var U,V=" "+N.props.className+" ",W=V.indexOf(" rewgt-panel ")>=0?0:V.indexOf(" rewgt-unit ")>=0?1:3;if(1==W&&N.props["childInline."]&&(W=2),R){if(S.parent!==m||!m.component)return h.instantShow("error: invalid target ScenePage."),u();if(U=0,v=S,x=R,T)return y=m,z=m.component,n=!1,Y();if(3==W)return h.instantShow("error: only panel, div, paragraph can add to ScenePage."),u();y=null,z=null,n=!0}else{if(T&&(v!==m||!n))return h.instantShow("error: ScenePage can only hook to topmost widget."),u();U=x.$gui.isPanel||v===m?0:h.hasClass(x,"rewgt-unit")?1:3,1==U&&x.props["childInline."]&&(U=2);var X=!1;if(1==U&&x.props["isTableRow."]&&(X=!0),!n){if(v===m||!z)return void h.instantShow("error: can not insert before topmost widget.");U=z.$gui.isPanel||y===m?0:h.hasClass(z,"rewgt-unit")?1:3,1==U&&z.props["childInline."]&&(U=2)}if(!g(W,U,X))return u()}return Y()},l.copyWidget=function(a,d,g,i,k,l,n){function H(){var a=t.$gui,c=a.compIdx[r.$gui.keyid],d="number"==typeof c&&a.comps[c];if(!d)return I();if(E=g?v:x,b(e.findDOMNode(E)))return h.instantShow("error: can not add target widget under a linker."),I();var f=t.props["isScenePage."]&&!A,n=d.props["data-unit.path"],p=d.props["data-span.path"],y="",z="string"==typeof n?"data-unit.path":"string"==typeof p?"data-span.path":"";if(z){if(E.widget===m)return h.instantShow("error: can not use linker under topmost widget."),I();if((g?u:w)!==s)return h.instantShow("error: can not move linked-linker to another widget, use unlinked-linker instead."),I();if(y=p||n,!y)return h.instantShow("warning: invalid link path."),I()}var B=h.keyOfElement(d),C=parseInt(B)+""==B,F=!1;C?F=!0:i||"number"==typeof E.$gui.compIdx[B]&&(F=!0);var G=j.getCompRenewProp(r)||{};return F&&(G["keyid."]="",G.key=""),z&&(G[z]=y),A&&(G.left=k,G.top=l),f&&(G.left=null,G.top=null),d=j.deepCloneReactEle(d,G,q,r),i&&(C||F||(g?u:w)!==s||(i=!1)),i&&b(e.findDOMNode(t))?(h.instantShow("error: can not remove source widget under a link."),I()):(o=!0,Object.assign(D,E.$gui.compIdx),void(g?E.setChild(d,I):E.setChild("+"+v.$gui.keyid,d,I)))}function I(){if(o)for(var c,a=Object.keys(E.$gui.compIdx),b=0;c=a[b];b+=1)if(!D.hasOwnProperty(c)&&"$"!=c[0]){var d=E.widget,f=d&&d[c],g=f&&f.component;g&&(p=e.findDOMNode(g));break}o&&i?t.setChild("-"+r.$gui.keyid,function(){n&&n(o,p)}):n&&n(o,p)}var o=!1,p=null,q=f.W(a),r=q&&q.component,s=q&&q.parent,t=s&&s.component;if(!r||!t)return h.instantShow("error: invalid source widget."),I();var u=f.W(d),v=u&&u.component,w=u&&u.parent,x=w&&w.component;if(!v||!x)return h.instantShow("error: invalid target widget."),I();if(i){var y=e.findDOMNode(r);if(y&&"all"!=c(y,1))return h.instantShow("error: move source widget is disallowed."),I()}var z=e.findDOMNode(v);if(z&&"all"!=c(z,g?0:1))return h.instantShow("error: insert target is disallowed."),I();var A=null,B=null,C=r.props["isScenePage."];if(v.props["isScenePage."])A=v,B=u;else if(x.props["isScenePage."])if(g){if(C)return h.instantShow("error: ScenePage can only insert into topmost widget."),I()}else A=x,B=w;var F,D={},E=null,G=r.$gui.isPanel?1:h.hasClass(r,"rewgt-unit")?2:3;if(A){if(B.parent!==m||!m.component)return h.instantShow("error: invalid target ScenePage."),I();if(F=1,u=B,v=A,w=m,x=m.component,C)return g=!1,H();if(g=!0,1!=G&&2!=G)return h.instantShow("error: only panel, div, paragraph can move to ScenePage."),I()}else{if(C)return h.instantShow("error: ScenePage can only hook to topmost widget."),I();if(F=v.$gui.isPanel?1:h.hasClass(v,"rewgt-unit")?2:3,g){if(3==F&&3!=G)return h.instantShow("error: can not append none-inline to inline widget."),I();if(1==F&&3==G)return h.instantShow("error: can not append inline widget to panel."),I()}else{if(3==F&&3!=G)return h.instantShow("error: can not insert none-inline before inline widget."),I();if(3!=F&&3==G)return h.instantShow("error: can not insert inline before none-inline widget."),I()}}return H()},l.setWdgtZIndex=function(a,c,d){function i(){d&&d(g)}var g=!1,j=a&&f.W(a),k=j&&j.parent;if(j=j&&j.component,k=k&&k.component,!j||!k)return i();if(b(e.findDOMNode(k)))return h.instantShow("error: can not change z-index under a link."),i();var l=Object.assign({},j.state.style);l.zIndex=c+"",j.props.style&&(j.props.style.zIndex=l.zIndex),g=!0,j.setState({style:l},i)},l.beTextable=function(a,b,c){return!a&&(3==c||j.textableBlock(b))},l.getGroupOpt=function(a){var b=a;if("string"==typeof a){var c=f.W(a);b=c&&c.component}return b&&b._?b._._getGroupOpt(b):null};var k=0,q=null,r={},s={};l.widgetSchema=function(a,b){var d=a;if("string"==typeof a){var g=f.W(a);d=g&&g.component}if(!d||!d.props)return null;if(!b){var h=d._._getSchema(d);return[h,p(d,h)]}var i=e.findDOMNode(d),j="all";if(i&&(j=c(i,1)),"none"==j)return[0];var h=d._._getSchema(d),l=p(d,h);if(!l)return null;if(l.properties&&!l.properties.style&&(l.properties.style={type:"object",propertyOrder:200,default:{}}),s=l.wdgtOption,q=d,r=h,k+=1,delete l.wdgtOption,"some"==j){var m={},n=Object.keys(l.properties||{});n.forEach(function(a){"key"!=a&&"klass"!=a&&"style"!=a&&0!=a.indexOf("data-")&&0!=a.indexOf("aria-")||(m[a]=l.properties[a])}),l.properties=m;var o=l.options||{};o.disable_properties=!0,l.options=o}var n=[],t=[];return Object.keys(r).forEach(function(a){var b=r[a];Array.isArray(b)&&t.push([b[0]||0,a])}),t.sort(function(a,b){return a[0]-b[0]}),t.forEach(function(a){n.push(a[1])}),[k,l,{name:s.name,doc:s.doc,flag:s.flag},n]},l.saveWdgtProp=function(a,b,c,d,e){"string"==typeof a&&(a=f.W(a),a=a&&a.component),a&&a.props?t(a,b,c,d,!1,e):e&&e(!1,null)},l.updateWdgtProp=function(a,b,c){k==a&&q?t(q,r,s,b,!0,c):c&&c(!1,null)},l.saveCompStyles=function(a,c,g,i){function A(){i&&setTimeout(function(){var a=n[q];a=a&&a.component,a&&(l=e.findDOMNode(a)),i(k,l)},300)}var k=!1,l=null;if("string"==typeof a&&(a=f.W(a),a=a&&a.component),!a||!a.props)return A();var m=a.widget,n=m&&m.parent,o=n&&n.component,p=null,q=a.$gui.keyid,r="",s="string"==typeof q&&"$"==q[0]?q:"$"+q;if(o){var t=o.$gui.compIdx[q],u=o.$gui.comps;if("number"==typeof t)for(p=u[t++];t<u.length;){var v=u[t++],w=v&&h.keyOfElement(v);if(w&&w!=s){r=w;break}}}if(!p||!c.linkPath)return A();var x=e.findDOMNode(o);if(x&&b(x))return h.instantShow("error: can not modify widget under a linker."),A();var y=Object.assign({},p.props["link.props"]),z=q+"";"$"!=z[0]&&(z="$"+z),y["keyid."]=y.key=z,y.$=c.linkPath,g?y.styles=g:delete y.styles,p=d.createElement(2==c.flag?j.RefDiv__:j.RefSpan__,y),o.setChild("-"+q,"-"+s,function(a){k=!0,r?o.setChild("+"+r,p,A):o.setChild(p,A)})},l.saveNodeContent=function(a,c,g){function C(){if(g){var a=m[p];a=a&&a.component,a&&(k=e.findDOMNode(a)),g(i,k)}}var i=!1,k=null;if("string"==typeof a&&(a=f.W(a),a=a&&a.component),!a||!a.props)return C();var l=a.widget,m=l&&l.parent,n=m&&m.component,o=null,p=a.$gui.keyid,q="";if(n){var r=n.$gui.compIdx[p],s=n.$gui.comps;if("number"==typeof r){o=s[r++];for(var t="string"==typeof p&&"$"==p[0]?p:"$"+p;r<s.length;){var u=s[r++],v=u&&h.keyOfElement(u);if(v&&v!=t){q=v;break}}}}if(!o)return C();var w=e.findDOMNode(a),x=w&&w.parentNode;if(x&&b(x))return h.instantShow("error: can not save widget content under a linker."),C();if(w&&0==w.children.length){var y=a.props["link.props"];if(y){var z=j.RefDiv__,A=a.props["data-unit.path"];if(A||(A=a.props["data-span.path"],z=j.RefSpan__),!A)return C();y=Object.assign({},y),y.$=A,c?y["html."]=c:delete y["html."];var B=p+"";"$"!=B[0]&&(B="$"+B),y.key=y["keyid."]=B,o=d.createElement(z,y),n.setChild("-"+p,"-"+B,function(a){i=!0,q?n.setChild("+"+q,o,C):n.setChild(o,C)})}else{var y=j.getCompRenewProp(a);if(!y)return C();y["html."]=c?c:void 0,y.key=p+"",y["keyid."]=p,o=j.deepCloneReactEle(o,y,l,a),n.setChild("-"+p,function(a){i=!0,q?n.setChild("+"+q,o,C):n.setChild(o,C)})}}else C()},l.onlyScenePage=function(){var a=m,b=0,c=0;return a=a&&a.component,a&&a.$gui.comps.forEach(function(a){var d=a&&h.keyOfElement(a);if(d&&"$pop"!=d){if(a.props["isTemplate."])return;a.props["isScenePage."]?b+=1:c+=1}}),b>0&&0==c},l.selectMultWdgt=function(a,b,c,d,f){function q(a,b,c,d,e,f,g,h){return a<g&&b<h&&c>=e&&d>=f?1:0}function r(a,b,c,d,e,f,g,h){var i=e+g,j=f+h;return e>=a&&f>=b&&i<c&&j<d?1:0}var g=[],i=m&&m[a],j=i&&i.component;if(j&&j.props["isScenePage."]){var k=c>=f&&b>=d,l=Math.min(b,d),n=Math.min(c,f),o=Math.max(b,d),p=Math.max(c,f);j.$gui.comps.forEach(function(a){if(a){var b=h.keyOfElement(a),c=b&&"$"!=b[0]&&i[b];if(c=c&&c.component){var d=e.findDOMNode(c);if(d){var f=d.getBoundingClientRect();if(0==f.width&&0==f.height)return;k?q(l,n,o,p,f.left,f.top,f.left+f.width,f.top+f.height)&&g.push([b,f.left,f.top,f.width,f.height]):r(l,n,o,p,f.left,f.top,f.width,f.height)&&g.push([b,f.left,f.top,f.width,f.height])}}}})}return g},l.moveSceneWdgt=function(a,b,c){var d=[];if("string"==typeof a){var e=f.W(a),g=e&&e.component;if(g){var h=g.state.left,i=g.state.top;g.setState({left:"number"!=typeof h?null:h+b,top:"number"!=typeof i?null:i+c}),d.push(g.$gui.keyid+"")}}else if(Array.isArray(a)&&a.length>=2){var j=a[0],e=m&&m[j],k=e&&e.component;k&&k.props["isScenePage."]&&a.slice(1).forEach(function(a){var f=e[a],g=f&&f.component;if(g){d.push(a);var h=g.state.left,i=g.state.top;g.setState({left:"number"!=typeof h?null:h+b,top:"number"!=typeof i?null:i+c})}})}return d};var u="SHADOW_WIDGET_COMPONENT";l.dumpWidget=function(a,b){function e(){b&&b(c,d)}var c=!1,d="";try{var g=null,h=",0,";if(Array.isArray(a)){var i=a[0],j=m&&m[i],k=j&&j.component;if(k&&k.props["isScenePage."]){h=",1,",g=[];for(var o,n=1;o=a[n];n+=1){var p=j[o];if(p){var q=[];l.dumpTree(q,p,""),1==q.length&&g.push(q[0])}}0==g.length&&(g=null)}}else if("string"==typeof a&&a){var j=f.W(a);j&&(g=[],l.dumpTree(g,j,""),1!=g.length&&(g=null))}g&&(d=u+h+JSON.stringify(g),c=!0)}catch(a){}e()},l.pasteWidget=function(a,c,i,j){function o(a){if(i&&l&&l==k)if("string"==typeof i){var b=f.W(i),c=b&&b.component;if(c){var d=b.parent,e=c.$gui.keyid,g=d&&d.component;g&&g.setChild("-"+e)}}else if(Array.isArray(i)){var o=i[0],p=i.slice(1),q=m&&m[o],r=q&&q.component;if(r){var s=p.map(function(a){return"-"+a});s.length&&r.setChild.apply(r,s)}}a&&h.instantShow(a),j&&setTimeout(function(){j(l,n)},0)}function F(a,b){if(b){var c=s.parent,e=c&&c.component;return!!e&&(a=d.cloneElement(a,{"keyid.":"",key:""}),e.setChild("+"+t.$gui.keyid,a),!0)}var f=a.props["data-unit.path"],g=a.props["data-span.path"],i="",j="string"==typeof f?"data-unit.path":"string"==typeof g?"data-span.path":"";if(j){if(s===m)return h.instantShow("error: can not use linker under topmost widget."),!1;i=g||f}var k=!1,l=h.keyOfElement(a);if(l){var n=parseInt(l);n+""===l?k=!0:"number"==typeof t.$gui.compIdx[l]&&(k=!0)}else k=!0;if(k||j||v){var o={};k&&(o["keyid."]="",o.key=""),j&&(o[j]=i),v&&(o.left=a.props.left||0,o.top=a.props.top||0),a=d.cloneElement(a,o)}return v?t.setChild(a):t.setChild("+"+r.$gui.keyid,a),!0}var k=0,l=0,n=!0,p=null;if(0!=c.indexOf(u)||"["==c[u.length+3])try{p=JSON.parse(c.slice(u.length+3))}catch(a){}if(!Array.isArray(p))return o("paste failed: invalid JSON input.");var q=f.W(a),r=q&&q.component;if(!r)return o();var s=null,t=null,v=r.props["isScenePage."];if(v)s=q,t=r,q=null,r=null;else{if(s=q.parent,t=s&&s.component,
!t)return o();t.props["isScenePage."]&&(v=!0)}"absolute"==(t.state.style||{}).position&&(n=!0);var w=[],x=!1;if(p.forEach(function(a){var b=h.loadElement(a);b?w.push(b):x=!0}),x)return o("paste failed: invalid format.");if(k=w.length,0==k)return o("nothing to paste.");var y=0,z=!1;if(!v){if(b(e.findDOMNode(t)))return h.instantShow("error: can not paste widget to a linker."),o();1!=k&&(h.instantShow("warning: only one widget can be inserted into none-ScenePage."),w.splice(1),k=1),y=t.$gui.isPanel||s===m?0:h.hasClass(t,"rewgt-unit")?1:3,1==y&&t.props["childInline."]&&(y=2),1==y&&tarNodeObj.props["isTableRow."]&&(z=!0)}for(var B,A=0;B=w[A];A+=1){var C=B.props["isScenePage."];if(C){if(!v)return h.instantShow("error: ScenePage can only insert into topmost widget."),o();if(n=!0,!F(B,!0))return o();l+=1}else{var D=" "+B.props.className+" ",E=D.indexOf(" rewgt-panel ")>=0?0:D.indexOf(" rewgt-unit ")>=0?1:3;if(1==E&&B.props["childInline."]&&(E=2),!g(E,y,z))return o();if(!F(B,!1))return o();l+=1}}setTimeout(function(){o()},0)},l.firstChildOf=function(a,b){var c=f.W(a),d=c&&c.component;if(d)for(var g=d.$gui.comps,i=g.length,j=0;j<i;j+=1){var k=g[j],l=k&&h.keyOfElement(k);if(l){if(b&&"$"==l[0])continue;var m=c[l],n=m&&m.component;if(n)return e.findDOMNode(n)}}return null},a()})});