'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var W = require('shadow-widget');

var T = W.$templates, utils = W.$utils, ex = W.$ex;

var Panel = T.Panel._createClass();
var P = T.P._createClass();
var Button = T.Button._createClass();

function onLoad() {
  var Button = T.Button._createClass( {
    $onClick: function(event) {
      alert('clicked!');
    },
  });
  
  var body = W.W('.body').component;
  body.setChild(
    <Panel key='top' height={null}>
      <P key='p'>
        <Button key='btn'>test</Button>
      </P>
    </Panel>,
    <Panel key='hello' height={null}>
      <P>Hello, world!</P>
    </Panel>
  );
}

W.$main.$onLoad.push(onLoad);
