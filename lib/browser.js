var documentElement = document.documentElement;
var transform = false,
    //transform
transform3d = false,
    //transform translate3d
hasTransformPrefix = false,
    prefix = '';

if ('addEventListener' in window) {
  //标准浏览器或者ie9以上
  var style = window.getComputedStyle(documentElement);
  try {
    //css前缀(浏览器前缀)
    prefix = [].slice.call(style).join('').match(/-(webkit|ms|moz|o)-/i)[1];
  } catch (e) {
    console.log('no css prefix info', e);
  }

  transform = typeof style.transform === 'string' || typeof style[prefix + 'Transform'] === 'string';
  if (transform) {
    hasTransformPrefix = !(typeof style.transform === 'string');
    var str = '';
    if (!hasTransformPrefix) {
      documentElement.style.transform = 'translate3d(0,0,0)';
      str = 'transform';
    } else {
      str = '-' + prefix + '-transform';
      documentElement.style[str] = 'translate3d(0,0,0)';
    }
    style = window.getComputedStyle(documentElement);
    transform3d = /^\w{5}/.test(style[str]); // 不为空，非none
    documentElement.style.transform = documentElement.style['-' + prefix + '-transform'] = '';
  }
  //清理
  style = null;
} else {
  prefix = 'ms';
}

export { prefix, transform, transform3d, hasTransformPrefix };