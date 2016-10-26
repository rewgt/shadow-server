'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var W = require('shadow-widget');

var T = W.$templates, utils = W.$utils, ex = W.$ex;

class TMyList_ extends T.Ul_ {
  constructor(name,desc) {
    super(name || 'MyList',desc);
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    props.url = ['',0];
    props.data = [];
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    
    this.defineDual('data', function(value,oldValue) {
      this.state['data'] = value;
    },'');
    
    this.defineDual('url', function(value,oldValue) {
      this.state.url = value;
      if (!Array.isArray(value)) return;
      
      var self = this;
      var sUrl = value[0], iId = value[1];
      utils.ajax( { type:'GET', url:sUrl, timeout:30000, dataType:'json',
        data: { _:iId+'' },  // ensure not use file cache of web-browser
        success: function(data,statusText,xhr) {
          if (Array.isArray(data))
            self.duals.data = data;
          // else, unknown format, ignore
        },
        
        error: function(xhr,statusText) {
          console.log('warning: query json failed (' + (statusText || 'unknown error') + ')');
        },
      });
    });
    
    this.defineDual('id__', function(value,oldValue) {
      var b = this.duals.data;
      if (!Array.isArray(b)) return;
      
      var children = [];
      b.forEach( function(item,idx) {
        var dProp = {key:item.weekDay,'data-idx':idx+''};
        var bItem = [ ['Li',dProp],
          ['Span',{'html.':item.weekDay+': '+item.income}],
        ];
        if (item.income >= 30) dProp.style = {color:'red'}; // pick out some large data
        children.push(utils.loadElement(bItem));
      });
      
      utils.setChildren(this,children);
    });
    
    return state;
  }
  
  componentDidMount() {
    super.componentDidMount();
    
    this.listen('data', function(value,oldValue) {
      console.log('query json file successful!');
    });
  }
  
  renew() {
    var sUrl = this.duals.url[0];
    this.duals.url = [sUrl,ex.time()];
  }
}

T.MyList_ = TMyList_;
T.MyList  = new TMyList_();
