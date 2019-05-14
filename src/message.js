const message = {
  option: {
    zIndex: 0,
    activeClassName: '',
    maskClassName: ''
  }, // 全局自定义配置
  box: null,
  length: 0
}, //消息对象
document = window.document,
rootNode = document.createElement('div'),
className = 'message-box', // 弹窗通用classname
activeClassName = 'active', // 当前激活弹窗classname
maskClassName = 'message-box__mask', // 遮罩层classname
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
  dragMode: 2 // 0不允许移动,1整个移动,2允许head移动
}, //弹窗默认配置
mask = {
  node: null,
  hide() {
    this.node && this.node.classList.add('hide');
  },
  show() {
    if (this.node || !appendMask()) {
      this.node.className = `${maskClassName} ${message.option.maskClassName}`;
    }
  }
} //蒙层对象
;
let currentBox = null, //当前弹窗对象
counter = 0, //当前弹窗个数计数器
transform = true,
transform3d = true,
hasTransformPrefix = false,
cssPrefix = ''
;

rootNode.id = 'jmessage';
rootNode.className = 'j-message';
document.body.appendChild(rootNode);
//监测键盘esc
document.body.addEventListener('keydown', function (e) {
  const key = e.which || e.keyCode;

  if (/^(?:13|27)$/.test(key) && currentBox && !/toast/i.test(currentBox.type)) {
    e.stopPropagation();
    let index = -2;

    if (key == 13) {
      // enter键
      let foot = currentBox.node.lastElementChild,
        btn = foot && foot.classList.contains(`${className}__foot`) ? foot.querySelector('button:focus') : null;
      for (let i = 0; i < foot.children.length && btn; ++i) {
        if (btn === foot.children[i]) {
          index = i + 1;
          break;
        }
      }
    }

    exit(index);
  }
});

function appendMask () {
  const node = mask.node = document.createElement('div');
  node.className = maskClassName;
  node.style.zIndex = message.option.zIndex || defaultOption.zIndex;
  rootNode.appendChild(node);

  node.addEventListener('click', function () {
    !currentBox.option.noClose && counter <= 1 && exit(-1);
  });
}
function clickEvent(self, index) {
  return function (e) {
    e.preventDefault();
    self.remove(index);
    self = index = null;
  }
}
/*
 * 移动处理方法
 *
 * @param object box 弹窗对象
 * @param object option 配置对象
 */
function dragEvent (box) {
  var moveEnable = false, //是否允许移动
    node = box.node,
    dragMode = box.option.dragMode,
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
    transformStyle = '', //style.transform的值 分2d和3d
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
        case 'mousemove': {
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
      case 'mousedown': {
        if (dragMode && box.movesNode.contains(e.target)) {
          if (type == 'touchstart') {
            if (e.targetTouches.length == 1) {
              data.startX = e.targetTouches[0].pageX;
              data.startY = e.targetTouches[0].pageY;
            } else
              break;
          } else {
            data.startX = e.clientX;
            data.startY = e.clientY;
          }

          moveEnable = true;
          var position = /\(\s*([+-]?\d+(?:\.\d+)?)px\s*,\s*([+-]?\d+(?:\.\d+)?)/i.exec(node.style[transformStr]);

          data.x = +position[1];
          data.y = +position[2];
        } else
          moveEnable = false;

        //异步执行
        currentBox !== box && window.setTimeout(function () {
          box.activate();
        }, 0);
      }
      break;
      //移动结束
      case 'touchend':
      case 'mouseup': {
        moveEnable = false;
      }
      break;
      //移出弹窗
      case 'mouseout': {
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
        case 'mousemove': {
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
      case 'mousedown': {
        if (dragMode && box.movesNode.contains(e.target)) {
          if (type == 'touchstart') {
            if (e.targetTouches.length == 1) {
              data.startX = e.targetTouches[0].pageX;
              data.startY = e.targetTouches[0].pageY;
            } else
              break;
          } else {
            data.startX = e.clientX;
            data.startY = e.clientY;
          }

          moveEnable = true;
          data.x = node.offsetLeft;
          data.y = node.offsetTop;
        } else
          moveEnable = false;

        //异步执行
        currentBox !== box && window.setTimeout(function () {
          box.activate();
        }, 0);
      }
      break;
      //移动结束
      case 'touchend':
      case 'mouseup': {
        moveEnable = false;
      }
      break;
      //移出弹窗
      case 'mouseout': {
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
function append (self) {
  //清零option参数
  self.nextBox = self.prevBox = null;
  //append node
  const node = self.node = document.createElement('div');
  node.id = `${self.type}_box_${self.id}`;
  node.className = `${className} ${self.type}-box ${className}_${activeClassName} ${self.option.className}`;
  node.innerHTML = `<div class="message-box__head">${self.option.title}<a href="javascript:void(0);" class="${className}__close" title="close/关闭">×</a></div><div class="${className}__body">${self.option.text}</div><div class="${className}__foot"></div></div>`;
  //绑定关闭事件
  let cssText = `position:fixed;z-index:${(self.option.zIndex > 0 ? self.option.zIndex : 10000) + counter};`,
    i = 0,
    length = self.option.buttons.length,
    eventsName,
    event = dragEvent(self);

  //append node
  rootNode.appendChild(node);
  if (self.option.transform && transform) {
    cssText += 'left:50%;top:50%;' + (hasTransformPrefix ? `-${cssPrefix}-transform:translate(-${Math.floor(node.offsetWidth / 2)}px,-${Math.floor(node.offsetHeight / 2)}px);` : `transform:translate(-${Math.floor(node.offsetWidth / 2)}px,-${Math.floor(node.offsetHeight / 2)}px);`);
  } else {
    cssText += `left:${(document.documentElement.clientWidth - node.offsetWidth) / 2}px;top:${(document.documentElement.clientHeight - node.offsetHeight) / 2}px`;
  }
  node.style.cssText = cssText;
  // 按钮和关闭事件
  node.querySelector(`.${className}__close`).addEventListener('click', clickEvent(self, 0));
  if (length) {
    //如果有按钮
    let footNode = node.childNodes[2];
    for (; i < length; i++) {
      let button = document.createElement('button');
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
    self.movesNode = self.option.dragMode == 1 ? node : node.firstChild;
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
      self.prevBox.nextBox = self;
      self.prevBox.node.classList.remove(`${className}_${activeClassName}`);
    } catch (e) {
      console.log('append error:', e);
    }
  }
  self.promise = new Promise((resolve) => {
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
        self.remove(-3);
      } catch (e) {}
    }, self.option.timeout);
  }
}

/*
 * 退出
 */
function exit(index = -1) {
  counter && currentBox.remove(index);
  !counter && mask.hide();
}

class Box {
  constructor (option, events) {
    this.id = counter++;
    this.option = Object.assign(
      {},
      defaultOption,
      typeof option === 'string' ? { option } : option);
    this.events = events;
  }
  /*
   * 激活当前弹窗到顶层
   */
  activate () {
    let box,
      node = this.node,
      zIndex = node.style.zIndex;
    //必要时，判断currentBox == this
    //断开当前box对象
    this.option.buttons.length && this.node.querySelector(`.${className}__foot>button:first-child`).focus();

    //把当前box对象添加到链到末端
    if (currentBox !== this) {
      try {
        if (this.prevBox)
          this.prevBox.nextBox = this.nextBox;
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
        currentBox.node.classList.remove(`${className}_${activeClassName}`);
      } catch (e) {
        console.log('activate error:', e);
      }
      currentBox = this;
    }
    node.classList.add(`${className}_${activeClassName}`);

    this.events && typeof this.events.active == 'function' && this.events.active(this);

    return this;
  }
  /*
   * 销毁对象
   */
  remove (index = -1) {
      //console.log(isClean)
      let node = this.node;

      //移除node
      node.parentNode.removeChild(node);
      node = this.node = null;
      //清理message列表
      if (--counter) {
        //当前活动弹窗（currentBox）
        try {
          if (this.prevBox)
            this.prevBox.nextBox = this.nextBox;
          if (this.nextBox) {
            this.nextBox.prevBox = this.prevBox;
          }
          if (currentBox === this) {
            currentBox = this.prevBox;
            currentBox.activate();
          }
        } catch (e) {
          console.error('remove error', e)
        }
      } else {
        currentBox = null;
        //关闭蒙版
        !counter && mask.hide();
      }

      this.resolve({
        index
      });
      this.promise.catch(() => {});
      if (this.events && typeof this.events.close == 'function') {
        this.events.close({
          index
        });
        this.callback = null;
      }
      this.events = this.prevBox = this.nextBox = null;

      return this;
    }
    /*
     *  关闭事件
     *  -3 timeout -2 键盘esc -1 点击遮罩层 0 关闭按钮 1~ 底部按钮
     */
    close (cb) {
      this.promise = this.promise.then(cb);

      return this;
    }
}
class AlertBox extends Box {
  constructor (option, events) {
    super(option, events);
    this.type = 'alert';
    append(this);
  }
}
export const alert = (option, events) => {
  return new AlertBox(option, events);
}
export const config = option => {
  if (option && typeof option === 'object') Object.assign(message.option, option);
  return Object.assign({}, message.option);
}

export default {
  alert,
  config
}
