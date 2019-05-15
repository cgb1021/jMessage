'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = exports.pop = exports.toast = exports.confirm = exports.alert = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _browser = require('./browser');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var message = {
  option: {
    zIndex: 999,
    activeClassName: '',
    maskClassName: '',
    transform: true // 是否使用transform属性拖动
  }, // 全局自定义配置
  box: null,
  length: 0
},
    //消息对象
document = window.document,
    rootNode = document.createElement('div'),
    className = 'message-box',
    // 弹窗通用classname
activeClassName = className + '_active',
    // 当前激活弹窗classname
maskClassName = className + '__mask',
    // 遮罩层classname
defaultOption = {
  title: '提示', // 显示标题
  text: '', // 主体内容（文字）
  buttons: ['确认'], // 按钮数组
  className: '', // 附加css类名
  showMask: true, // 是否显示遮罩层
  timeout: 0, // 多少秒后自动关闭
  noClose: false, // 不允许关闭
  dragMode: 2 // 0不允许移动,1整个移动,2允许head移动
},
    //弹窗默认配置
mask = {
  node: null,
  hide: function hide() {
    this.node && this.node.classList.add('hide');
  },
  show: function show() {
    if (!this.node) {
      // 生成mask
      var node = this.node = document.createElement('div');
      node.style.zIndex = message.option.zIndex;
      rootNode.appendChild(node);

      node.addEventListener('click', function () {
        !currentBox.option.noClose && counter <= 1 && exit(-1);
      });
    }
    this.node.className = maskClassName + ' ' + message.option.maskClassName;
  }
},
    //蒙层对象
transformStyle = _browser.transform3d ? 'translate3d({$position},0)' : 'translate({$position})',
    transformStr = !_browser.hasTransformPrefix ? 'transform' : _browser.prefix + 'Transform';
var currentBox = null,
    //当前弹窗对象
counter = 0 //当前弹窗个数计数器
;

rootNode.id = 'jmessage';
rootNode.className = 'jmessage';
document.body.appendChild(rootNode);
//监测键盘esc
document.body.addEventListener('keydown', function (e) {
  var key = e.which || e.keyCode;

  if (/^(?:13|27)$/.test(key) && currentBox && !/toast/i.test(currentBox.type)) {
    e.stopPropagation();
    var index = -2;

    if (key === 13) {
      // enter键
      var foot = currentBox.node.lastElementChild,
          btn = foot && foot.classList.contains(className + '__foot') ? foot.querySelector('button:focus') : null;
      for (var i = 0; i < foot.children.length && btn; ++i) {
        if (btn === foot.children[i]) {
          index = i + 1;
          break;
        }
      }
    }

    exit(index);
  }
});
/*
 * 退出
 */
function exit() {
  var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

  counter && currentBox.remove(index);
  !counter && mask.hide();
}
function clickEvent(self, index) {
  return function (e) {
    e.preventDefault();
    self.remove(index);
    self = index = null;
  };
}
/*
 * 移动处理方法
 *
 * @param object box 弹窗对象
 * @param object option 配置对象
 */
function dragEvent(box) {
  var dragMode = box.option.dragMode,
      data = {
    width: box.node.offsetWidth, //弹窗宽度
    height: box.node.offsetHeight, //弹窗高度
    startX: 0, //鼠标/触摸初始x轴坐标
    startY: 0, //鼠标/触摸初始y轴坐标
    x: 0, //弹窗初始x轴坐标
    y: 0, //弹窗初始y轴坐标
    offsetLeft: 0, //transform模式下，弹窗的offsetLeft
    offsetTop: 0 //transform模式下，弹窗的offsetTop
  };
  var enable = false //是否允许移动
  ;

  //确定拖动模式
  if (message.option.transform && _browser.transform) {
    //transform模式
    return function (e) {
      var type = e.type;
      switch (type) {
        //移动中
        case 'touchmove':
        case 'mousemove':
          {
            if (enable) {
              e.preventDefault();
              e.stopPropagation();
              //var replaceStr = type == 'touchmove' ? Math.floor(data.x + (e.targetTouches[0].pageX - data.startX)) + 'px,' + Math.floor(data.y + (e.targetTouches[0].pageY - data.startY)) + 'px' : Math.floor(data.x + (e.clientX - data.startX)) + 'px,' + Math.floor(data.y + (e.clientY - data.startY)) + 'px';
              box.node.style[transformStr] = transformStyle.replace('{$position}', type === 'touchmove' ? Math.floor(data.x + (e.targetTouches[0].pageX - data.startX)) + 'px,' + Math.floor(data.y + (e.targetTouches[0].pageY - data.startY)) + 'px' : Math.floor(data.x + (e.clientX - data.startX)) + 'px,' + Math.floor(data.y + (e.clientY - data.startY)) + 'px');
            }
          }
          break;
        //移动开始
        case 'touchstart':
        case 'mousedown':
          {
            if (dragMode && box.movesNode.contains(e.target)) {
              if (type === 'touchstart') {
                if (e.targetTouches.length === 1) {
                  data.startX = e.targetTouches[0].pageX;
                  data.startY = e.targetTouches[0].pageY;
                } else break;
              } else {
                data.startX = e.clientX;
                data.startY = e.clientY;
              }

              enable = true;
              var position = /\(\s*([+-]?\d+(?:\.\d+)?)px\s*,\s*([+-]?\d+(?:\.\d+)?)/i.exec(box.node.style[transformStr]);

              data.x = +position[1];
              data.y = +position[2];
            } else enable = false;

            //异步执行
            currentBox !== box && window.setTimeout(function () {
              box.activate();
            }, 0);
          }
          break;
        //移动结束
        case 'touchend':
        case 'mouseup':
          {
            enable = false;
          }
          break;
        //移出弹窗
        case 'mouseout':
          {
            if (enable && !box.node.contains(e.relatedTarget)) {
              enable = false;
            }
          }
          break;
        default:
          return;
      }
    };
  } else {
    //top/left模式
    return function (e) {
      var type = e.type;
      switch (type) {
        //移动中
        case 'touchmove':
        case 'mousemove':
          {
            if (enable) {
              e.preventDefault();
              e.stopPropagation();
              if (type === 'touchmove') {
                box.node.style.left = data.x + (e.targetTouches[0].pageX - data.startX) + 'px';
                box.node.style.top = data.y + (e.targetTouches[0].pageY - data.startY) + 'px';
              } else {
                box.node.style.left = data.x + (e.clientX - data.startX) + 'px';
                box.node.style.top = data.y + (e.clientY - data.startY) + 'px';
              }
            }
          }
          break;
        //移动开始
        case 'touchstart':
        case 'mousedown':
          {
            if (dragMode && box.movesNode.contains(e.target)) {
              if (type === 'touchstart') {
                if (e.targetTouches.length === 1) {
                  data.startX = e.targetTouches[0].pageX;
                  data.startY = e.targetTouches[0].pageY;
                } else break;
              } else {
                data.startX = e.clientX;
                data.startY = e.clientY;
              }

              enable = true;
              data.x = box.node.offsetLeft;
              data.y = box.node.offsetTop;
            } else enable = false;

            //异步执行
            currentBox !== box && window.setTimeout(function () {
              box.activate();
            }, 0);
          }
          break;
        //移动结束
        case 'touchend':
        case 'mouseup':
          {
            enable = false;
          }
          break;
        //移出弹窗
        case 'mouseout':
          {
            if (enable && !box.node.contains(e.relatedTarget)) {
              enable = false;
            }
          }
          break;
        default:
          return;
      }
    };
  }
}
/*
 * 初始化数据和create node
 *
 * @param string msg
 */
function create(self) {
  //create node
  var node = self.node = document.createElement('div');
  node.id = self.type + '_box_' + self.id;
  node.className = className + ' ' + self.type + '-box ' + activeClassName + ' ' + message.option.activeClassName + ' ' + self.option.className;
  node.innerHTML = '<div class="' + className + '__head">' + self.option.title + '<span class="' + className + '__close" title="close/\u5173\u95ED">\xD7</span></div><div class="' + className + '__body">' + self.option.text + '</div><div class="' + className + '__foot"></div></div>';
  rootNode.appendChild(node);
  //绑定关闭事件
  var cssText = 'position:fixed;z-index:' + ((typeof message.option.zIndex === 'number' && message.option.zIndex > 0 ? message.option.zIndex : 10000) + counter) + ';',
      i = 0,
      length = self.option.buttons.length,
      eventsName = void 0,
      event = dragEvent(self);

  //create node
  if (message.option.transform && _browser.transform) {
    // cssText += 'left:50%;top:50%;' + (hasTransformPrefix ? `-${cssPrefix}-transform:translate(-${Math.floor(node.offsetWidth / 2)}px,-${Math.floor(node.offsetHeight / 2)}px);` : `transform:translate(-${Math.floor(node.offsetWidth / 2)}px,-${Math.floor(node.offsetHeight / 2)}px);`);
    cssText += ('left:50%;top:50%;' + (_browser.hasTransformPrefix ? '-' + _browser.prefix + '-' : '') + 'transform:' + transformStyle).replace('{$position}', '-' + Math.floor(node.offsetWidth / 2) + 'px,-' + Math.floor(node.offsetHeight / 2) + 'px');
  } else {
    cssText += 'left:' + (document.documentElement.clientWidth - node.offsetWidth) / 2 + 'px;top:' + (document.documentElement.clientHeight - node.offsetHeight) / 2 + 'px';
  }
  node.style.cssText = cssText;
  // 按钮和关闭事件
  node.querySelector('.' + className + '__close').addEventListener('click', clickEvent(self, 0));
  if (length) {
    //如果有按钮
    var footNode = node.childNodes[2];
    for (; i < length; i++) {
      var button = document.createElement('button');
      button.className = 'btn';
      button.textContent = self.option.buttons[i];
      button.addEventListener('click', clickEvent(self, i + 1));
      footNode.appendChild(button);
    }
    footNode.firstElementChild.focus();
  }

  if (self.option.dragMode) {
    //允许移动
    eventsName = ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup', 'mouseout'];
    //能拖动的node
    self.movesNode = self.option.dragMode === 1 ? node : node.firstChild;
    self.movesNode.classList.add('drag-enable');
  } else {
    eventsName = ['touchend', 'mouseup'];
  }
  //拖动事件
  for (i = eventsName.length - 1; i >= 0; i--) {
    node.addEventListener(eventsName[i], event);
  }
  //保存当前对象
  if (currentBox) {
    try {
      self.prevBox = currentBox;
      currentBox.nextBox = self;
      currentBox.node.classList.remove(activeClassName, message.option.activeClassName);
    } catch (e) {
      console.log('create error:', e);
    }
  }
  //currentBox指向当前对象
  currentBox = self;
  //打开蒙板
  self.option.showMask && mask.show();
  self.promise = new Promise(function (resolve) {
    self.resolve = resolve;
  });
  //message.length = counter;
  if (self.option.timeout) {
    window.setTimeout(function () {
      try {
        self.remove(-3);
      } catch (e) {
        console.log('remove box error: ' + self.id);
      }
    }, self.option.timeout * 1000);
  }
}

var Box = function () {
  /*
   * @param object events {close, active}
   */
  function Box(text, events) {
    _classCallCheck(this, Box);

    this.id = counter++;
    this.option = Object.assign({}, defaultOption, typeof text === 'string' ? { text: text } : text);
    this.events = events;
    this.nextBox = this.prevBox = this.node = null;
  }
  /*
   * 激活当前弹窗到顶层
   */


  _createClass(Box, [{
    key: 'activate',
    value: function activate() {
      var node = this.node;
      var box = void 0,
          zIndex = node.style.zIndex;
      //断开当前box对象
      this.option.buttons.length && node.querySelector('.' + className + '__foot>button:first-child').focus();

      //把当前box对象添加到链到末端
      if (currentBox !== this) {
        try {
          if (this.prevBox) this.prevBox.nextBox = this.nextBox;
          if (this.nextBox) {
            this.nextBox.prevBox = this.prevBox;
            box = this.nextBox;
          }
          currentBox.nextBox = this;
          this.prevBox = currentBox;
          this.nextBox = null;
          //重新排z-index
          while (box) {
            box.node.style.zIndex = zIndex++;
            box = box.nextBox;
          };

          //末端到2个box交换z-index和className
          currentBox.node.classList.remove(activeClassName, message.option.activeClassName);
        } catch (e) {
          console.log('activate error:', e);
        }
        currentBox = this;
      }
      node.classList.add(activeClassName, message.option.activeClassName);

      this.events && typeof this.events.active === 'function' && this.events.active(this);

      return this;
    }
    /*
     * 销毁对象
     */

  }, {
    key: 'remove',
    value: function remove() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

      //移除node
      this.node.parentNode.removeChild(this.node);
      this.node = null;
      this.resolve({
        index: index
      });
      this.promise.catch(function () {});
      this.events && typeof this.events.close === 'function' && this.events.close({
        index: index
      });
      //清理message列表
      if (--counter) {
        //当前活动弹窗（currentBox）
        try {
          if (this.prevBox) this.prevBox.nextBox = this.nextBox;
          if (this.nextBox) {
            this.nextBox.prevBox = this.prevBox;
          }
          if (currentBox === this) {
            currentBox = this.prevBox;
            currentBox.activate();
          }
        } catch (e) {
          console.error('remove error', e);
        }
      } else {
        currentBox = null;
        //关闭蒙版
        !counter && mask.hide();
      }

      this.events = this.prevBox = this.nextBox = null;
    }
    /*
     *  关闭事件
     *  -3 timeout -2 键盘esc -1 点击遮罩层 0 关闭按钮 1~ 底部按钮
     */

  }, {
    key: 'close',
    value: function close(cb) {
      this.promise = this.promise.then(cb);
    }
  }]);

  return Box;
}();

var AlertBox = function (_Box) {
  _inherits(AlertBox, _Box);

  function AlertBox(text, events) {
    _classCallCheck(this, AlertBox);

    var _this = _possibleConstructorReturn(this, (AlertBox.__proto__ || Object.getPrototypeOf(AlertBox)).call(this, { text: text }, events));

    _this.type = 'alert';
    create(_this);
    return _this;
  }

  return AlertBox;
}(Box);

var ConfirmBox = function (_Box2) {
  _inherits(ConfirmBox, _Box2);

  function ConfirmBox(text, events) {
    _classCallCheck(this, ConfirmBox);

    var _this2 = _possibleConstructorReturn(this, (ConfirmBox.__proto__ || Object.getPrototypeOf(ConfirmBox)).call(this, {
      text: text,
      buttons: ['确认', '取消']
    }, events));

    _this2.type = 'confirm';
    create(_this2);
    return _this2;
  }

  return ConfirmBox;
}(Box);

var ToastBox = function (_Box3) {
  _inherits(ToastBox, _Box3);

  function ToastBox(text) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    _classCallCheck(this, ToastBox);

    var _this3 = _possibleConstructorReturn(this, (ToastBox.__proto__ || Object.getPrototypeOf(ToastBox)).call(this, {
      text: text,
      timeout: timeout,
      showMask: false,
      dragMode: 0,
      buttons: []
    }));

    _this3.type = 'toast';
    create(_this3);
    return _this3;
  }

  return ToastBox;
}(Box);

var PopBox = function (_Box4) {
  _inherits(PopBox, _Box4);

  function PopBox(text, events) {
    _classCallCheck(this, PopBox);

    var _this4 = _possibleConstructorReturn(this, (PopBox.__proto__ || Object.getPrototypeOf(PopBox)).call(this, text, events));

    _this4.type = 'pop';
    create(_this4);
    return _this4;
  }

  return PopBox;
}(Box);

var alert = exports.alert = function alert(text, events) {
  return new AlertBox(text, events);
};
var confirm = exports.confirm = function confirm(text, events) {
  return new ConfirmBox(text, events);
};
var toast = exports.toast = function toast(text, timeout) {
  return new ToastBox(text, timeout);
};
var pop = exports.pop = function pop(option, events) {
  return new PopBox(option, events);
};
var config = exports.config = function config(option) {
  if (option && (typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object') Object.assign(message.option, option);
  return Object.assign({}, message.option);
};

exports.default = {
  alert: alert,
  confirm: confirm,
  config: config,
  pop: pop,
  toast: toast
};