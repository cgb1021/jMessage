'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var documentElement = document.documentElement;
var transform = false,
    //transform
transform3d = false,
    //transform translate3d
hasTransformPrefix = false,
    prefix = '';

if ('addEventListener' in window) {
  //标准浏览器或者ie9以上
  var style = global.getComputedStyle(documentElement);
  try {
    //css前缀(浏览器前缀)
    exports.prefix = prefix = [].slice.call(style).join('').match(/-(webkit|ms|moz|o)-/i)[1];
  } catch (e) {
    console.log('no css prefix info', e);
  }

  exports.transform = transform = typeof style.transform === 'string' || typeof style[prefix + 'Transform'] === 'string';
  if (transform) {
    exports.hasTransformPrefix = hasTransformPrefix = !(typeof style.transform === 'string');
    var str = '';
    if (!hasTransformPrefix) {
      documentElement.style.transform = 'translate3d(0,0,0)';
      str = 'transform';
    } else {
      str = '-' + prefix + '-transform';
      documentElement.style[str] = 'translate3d(0,0,0)';
    }
    style = global.getComputedStyle(documentElement);
    exports.transform3d = transform3d = /^\w{5}/.test(style[str]); // 不为空，非none
    documentElement.style.transform = documentElement.style['-' + prefix + '-transform'] = '';
  }
  //清理
  style = null;
} else {
  exports.prefix = prefix = 'ms';
}

exports.prefix = prefix;
exports.transform = transform;
exports.transform3d = transform3d;
exports.hasTransformPrefix = hasTransformPrefix;