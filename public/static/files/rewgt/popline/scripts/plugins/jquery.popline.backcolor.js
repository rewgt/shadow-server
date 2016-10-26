/*
  jquery.popline.backcolor.js 0.0.1

  Version: 0.0.1
  Updated: Sep 18th, 2013

  (c) 2013 by kenshin54
*/
;(function($) {

  var colors = [
    '#00FFFF',
    '#000000',
    '#0000FF',
    '#FF00FF',
    '#808080',
    '#008000',
    '#00FF00',
    '#800000',
    '#000080',
    '#808000',
    '#800080',
    '#FF0000',
    '#C0C0C0',
    '#008080',
    '#FFFFFF',
    '#FFFF00'
  ];

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function colorToHex(color) {
    if (color.substr(0, 1) === '#') {
      return color;
    }
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    
    return '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue);
  };

  var getColorButtons = function (){
    var buttons = {};

    $(colors).each(function (index, color) {
      buttons['color' + index] = {
        bgColor: color,
        text: '&nbsp',
        action: function (event) {
          document.execCommand('ForeColor', false, colorToHex($(this).css('background-color')));
        }
      }
    });

    return buttons;
  }

  $.popline.addButton({
    color: {
      iconClass: "fa fa-font",
      mode: "edit",
      buttons: getColorButtons()
    }
  });
})(jQuery);
