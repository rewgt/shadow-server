'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var W = require('shadow-widget');

var T = W.$templates, utils = W.$utils, ex = W.$ex;

class THighlightBtn_ extends T.Button_ {
  constructor(name,desc) {
    super(name || 'HighlightBtn',desc);
  }
  
  getDefaultProps() {
    var props = super.getDefaultProps();
    // props.attr = value;
    return props;
  }
  
  getInitialState() {
    var state = super.getInitialState();
    // do something ...
    return state;
  }
  
  componentDidMount() {
    super.componentDidMount();
    // do something ...
  }
  
  $onMouseOver(event) {
    this.duals.style = {opacity:'0.6'};
  }
  
  $onMouseOut(event) {
    this.duals.style = {opacity:''};
  }
  
  $onClick(event) {
    alert('clicked');
  }
}

T.HighlightBtn_ = THighlightBtn_;
T.HighlightBtn = new THighlightBtn_();
