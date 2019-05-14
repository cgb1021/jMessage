'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var message = {
  option: {
    zIndex: 0
  }, // 全局自定义配置
  box: null,
  length: 0
},
    //消息对象
className = 'message-box',
    //通用classname
activeClassName = 'active',
    //当前激活弹窗classname
maskClassName = 'message-box-mask',
    // 遮罩层classname
defaultOption = {
  title: '提示', // 显示标题
  text: '', // 主体内容（文字）
  buttons: ['确认'], // 按钮数组
  className: '', // 附加css类名
  zIndex: 1000, // css z-index属性
  showMask: true, // 是否显示遮罩层
  timeout: 0, // 多少秒后自动关闭
  transform: true, // 是否使用transform属性拖动
  noClose: false, // 不允许关闭
  dragMode: 2 //0不允许移动,1整个移动,2允许head移动
  //弹窗默认配置
  // document = window.document
};
var mask = {
  node: null,
  hide: function hide() {
    this.node && this.node.classList.add('hide');
  },
  show: function show() {
    if (this.node || this.append()) {
      this.node.className = maskClassName;
    }
  },
  append: function append() {
    var node = this.node = document.createElement('div');
    node.className = maskClassName;
    node.style.zIndex = message.option.zIndex || defaultOption.zIndex;
    document.body.appendChild(node);

    node.addEventListener('click', function () {
      !currentBox.option.noClose && counter <= 1 && exit();
    });
    return true;
  }
} //蒙层对象
;
var currentBox = null,
    //当前弹窗对象
counter = 0,
    //当前弹窗个数计数器
transform = true,
    transform3d = true,
    hasTransformPrefix = false,
    cssPrefix = '';

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
  var moveEnable = false,
      //是否允许移动
  node = box.node,
      moveMode = box.option.moveMode,
      data = {
    width: node.offsetWidth, //弹窗宽度
    height: node.offsetHeight, //弹窗高度
    startX: 0, //鼠标/触摸初始x轴坐标
    startY: 0, //鼠标/触摸初始y轴坐标
    x: 0, //弹窗初始x轴坐标
    y: 0, //弹窗初始y轴坐标
    offsetLeft: 0, //transform模式下，弹窗的offsetLeft
    offsetTop: 0 //transform模式下，弹窗的offsetTop
  },
      transformStyle = '',
      //style.transform的值 分2d和3d
  transformStr = '' //style.transform
  ;

  //确定拖动模式
  if (box.option.transform && transform) {
    //transform模式
    transformStyle = transform3d ? 'translate3d({$position},0)' : 'translate({$position})';
    transformStr = !hasTransformPrefix ? 'transform' : cssPrefix + 'Transform';

    return function (e) {
      var type = e.type;
      switch (type) {
        //移动中
        case 'touchmove':
        case 'mousemove':
          {
            if (moveEnable) {
              e.preventDefault();
              e.stopPropagation();
              //var replaceStr = type == 'touchmove' ? Math.floor(data.x + (e.targetTouches[0].pageX - data.startX)) + 'px,' + Math.floor(data.y + (e.targetTouches[0].pageY - data.startY)) + 'px' : Math.floor(data.x + (e.clientX - data.startX)) + 'px,' + Math.floor(data.y + (e.clientY - data.startY)) + 'px';
              node.style[transformStr] = transformStyle.replace('{$position}', type == 'touchmove' ? Math.floor(data.x + (e.targetTouches[0].pageX - data.startX)) + 'px,' + Math.floor(data.y + (e.targetTouches[0].pageY - data.startY)) + 'px' : Math.floor(data.x + (e.clientX - data.startX)) + 'px,' + Math.floor(data.y + (e.clientY - data.startY)) + 'px');
            }
          }
          break;
        //移动开始
        case 'touchstart':
        case 'mousedown':
          {
            if (moveMode && box.movesNode.contains(e.target)) {
              if (type == 'touchstart') {
                if (e.targetTouches.length == 1) {
                  data.startX = e.targetTouches[0].pageX;
                  data.startY = e.targetTouches[0].pageY;
                } else break;
              } else {
                data.startX = e.clientX;
                data.startY = e.clientY;
              }

              moveEnable = true;
              var position = /\(\s*([+-]?\d+(?:\.\d+)?)px\s*,\s*([+-]?\d+(?:\.\d+)?)/i.exec(node.style[transformStr]);

              data.x = +position[1];
              data.y = +position[2];
            } else moveEnable = false;

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
            moveEnable = false;
          }
          break;
        //移出弹窗
        case 'mouseout':
          {
            if (moveEnable && !node.contains(e.relatedTarget)) {
              moveEnable = false;
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
            if (moveEnable) {
              e.preventDefault();
              e.stopPropagation();
              if (type == 'touchmove') {
                node.style.left = data.x + (e.targetTouches[0].pageX - data.startX) + 'px';
                node.style.top = data.y + (e.targetTouches[0].pageY - data.startY) + 'px';
              } else {
                node.style.left = data.x + (e.clientX - data.startX) + 'px';
                node.style.top = data.y + (e.clientY - data.startY) + 'px';
              }
            }
          }
          break;
        //移动开始
        case 'touchstart':
        case 'mousedown':
          {
            if (moveMode && box.movesNode.contains(e.target)) {
              if (type == 'touchstart') {
                if (e.targetTouches.length == 1) {
                  data.startX = e.targetTouches[0].pageX;
                  data.startY = e.targetTouches[0].pageY;
                } else break;
              } else {
                data.startX = e.clientX;
                data.startY = e.clientY;
              }

              moveEnable = true;
              data.x = node.offsetLeft;
              data.y = node.offsetTop;
            } else moveEnable = false;

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
            moveEnable = false;
          }
          break;
        //移出弹窗
        case 'mouseout':
          {
            if (moveEnable && !node.contains(e.relatedTarget)) {
              moveEnable = false;
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
 * 初始化数据和append node
 *
 * @param string msg
 */
function append(self) {
  //清零option参数
  self.nextBox = self.prevBox = null;
  //append node
  var noHead = /pop|toast/.test(self.type);
  var node = self.node = document.createElement('div');
  node.id = self.type + '_box_' + self.id;
  node.className = className + ' ' + self.type + '-box ' + activeClassName + ' ' + self.option.className;
  node.innerHTML = noHead ? self.option.text : '<div class="head">' + self.option.title + '<a href="javascript:void(0);" class="close-btn" title="close/关闭">×</a></div><div class="body">' + self.option.text + '</div><div class="foot"></div></div>';
  //绑定关闭事件
  var cssText = 'position:fixed;z-index:' + ((self.option.zIndex > 0 ? self.option.zIndex : 10000) + counter) + ';',
      i = 0,
      length = self.option.buttons.length,
      eventsName,
      event = dragEvent(self);

  //append node
  document.body.appendChild(node);
  if (self.option.transform && transform) {
    cssText += 'left:50%;top:50%;' + (hasTransformPrefix ? '-' + cssPrefix + '-transform:translate(-' + Math.floor(node.offsetWidth / 2) + 'px,-' + Math.floor(node.offsetHeight / 2) + 'px);' : 'transform:translate(-' + Math.floor(node.offsetWidth / 2) + 'px,-' + Math.floor(node.offsetHeight / 2) + 'px);');
  } else {
    cssText += 'left:' + (document.documentElement.clientWidth - node.offsetWidth) / 2 + 'px;top:' + (document.documentElement.clientHeight - node.offsetHeight) / 2 + 'px';
  }
  node.style.cssText = cssText;
  // 按钮和关闭事件
  !noHead && node.querySelector('.head>.close-btn').addEventListener('click', clickEvent(self, -1));
  if (length) {
    //如果有按钮
    var footNode = node.childNodes[2];
    for (; i < length; i++) {
      var button = document.createElement('button');
      button.className = 'btn';
      button.textContent = self.option.buttons[i];
      button.addEventListener('click', clickEvent(self, i));
      footNode.appendChild(button);
    }
    footNode.firstElementChild.focus();
  }

  if (self.option.moveMode) {
    //允许移动
    eventsName = ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup', 'mouseout'];
    //能拖动的node
    self.movesNode = self.option.moveMode == 1 ? node : node.firstChild;
    self.movesNode.classList.add('move-enable');
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
      self.prevBox.nextBox = self;
      self.prevBox.node.classList.remove(activeClassName);
    } catch (e) {
      console.log('append error:', e);
    }
  }
  self.promise = new Promise(function (resolve, reject) {
    self.resolve = resolve;
  });
  //currentBox指向当前对象
  currentBox = self;
  //打开蒙板
  self.option.showMask && mask.show();
  //message.length = counter;
  if (self.option.timeout) {
    window.setTimeout(function () {
      try {
        self.remove();
      } catch (e) {}
    }, self.option.timeout);
  }
}

/*
 * 退出
 */
function exit() {
  var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

  counter && currentBox.remove(index);
  !counter && mask.hide();
}

var Box = function Box(text, events) {
  _classCallCheck(this, Box);

  this.id = counter++;
  this.option = Object.assign({}, defaultOption, typeof text === 'string' ? { text: text } : text);
  this.events = events;
};

var AlertBox = function (_Box) {
  _inherits(AlertBox, _Box);

  function AlertBox(text, events) {
    _classCallCheck(this, AlertBox);

    var _this = _possibleConstructorReturn(this, (AlertBox.__proto__ || Object.getPrototypeOf(AlertBox)).call(this, text, events));

    _this.type = 'alert';
    append(_this);
    return _this;
  }

  return AlertBox;
}(Box);

var alert = exports.alert = function alert() {
  console.log(new AlertBox());
};

exports.default = {
  alert: alert
};