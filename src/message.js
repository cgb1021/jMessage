import { prefix as cssPrefix, transform, transform3d, hasTransformPrefix } from './browser';
const message = {
  option: {
    zIndex: 999,
    activeClassName: '',
    maskClassName: '',
    transform: true, // 是否使用transform属性拖动
  }, // 全局自定义配置
  box: null,
  length: 0
}, //消息对象
document = window.document,
rootNode = document.createElement('div'),
className = 'message-box', // 弹窗通用classname
activeClassName = `${className}_active`, // 当前激活弹窗classname
maskClassName = `${className}__mask`, // 遮罩层classname
defaultOption = {
  title: '提示', // 显示标题
  text: '', // 主体内容（文字）
  buttons: ['确认'], // 按钮数组
  className: '', // 附加css类名
  showMask: true, // 是否显示遮罩层
  timeout: 0, // 多少秒后自动关闭
  noClose: false, // 不允许关闭
  dragMode: 2 // 0不允许移动,1整个移动,2允许head移动
}, //弹窗默认配置
mask = {
  node: null,
  hide() {
    this.node && this.node.classList.add('hide');
  },
  show() {
    if (!this.node) {
      // 生成mask
      const node = this.node = document.createElement('div');
      node.style.zIndex = message.option.zIndex;
      rootNode.appendChild(node);

      node.addEventListener('click', function maskClick () {
        !currentBox.option.noClose && counter <= 1 && exit(-1);
      });
    }
    this.node.className = `${maskClassName} ${message.option.maskClassName}`;
  }
}, //蒙层对象
transformStyle = transform3d ? 'translate3d({$position},0)' : 'translate({$position})',
transformStr = !hasTransformPrefix ? 'transform' : `${cssPrefix}Transform`,
boxData = {}
;
let currentBox = null, //当前弹窗对象
counter = 0 //当前弹窗个数计数器
;

rootNode.id = 'jmessage';
rootNode.className = 'jmessage';
document.body.appendChild(rootNode);
//监测键盘esc
document.body.addEventListener('keydown', function bodyKeydown(e) {
  const key = e.which || e.keyCode;

  if (/^(?:13|27)$/.test(key) && currentBox && !/toast/i.test(currentBox.type)) {
    e.stopPropagation();
    let index = -2;

    if (key === 13) {
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
/*
 * 退出
 */
function exit(index = -1) {
  counter && currentBox.remove(index);
  !counter && mask.hide();
}
/*
 * 移动处理方法
 *
 * @param object box 弹窗对象
 * @param object option 配置对象
 */
function dragEvent (box) {
  const data = {
      startX: 0, //鼠标/触摸初始x轴坐标
      startY: 0, //鼠标/触摸初始y轴坐标
      x: 0, //弹窗初始x轴坐标
      y: 0, //弹窗初始y轴坐标
      offsetLeft: 0, //transform模式下，弹窗的offsetLeft
      offsetTop: 0 //transform模式下，弹窗的offsetTop
    };
  let enable = false //是否允许移动
  ;
  
  boxData[box.id].destroy.push(() => box = null);
  //确定拖动模式
  if (message.option.transform && transform) {
    //transform模式
    return function dragEventTransform (e) {
      const type = e.type;
      switch (type) {
        //移动中
        case 'touchmove':
        case 'mousemove': {
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
      case 'mousedown': {
        if (box.movesNode && box.movesNode.contains(e.target)) {
          if (type === 'touchstart') {
            if (e.targetTouches.length === 1) {
              data.startX = e.targetTouches[0].pageX;
              data.startY = e.targetTouches[0].pageY;
            } else
              break;
          } else {
            data.startX = e.clientX;
            data.startY = e.clientY;
          }

          enable = true;
          let position = /\(\s*([+-]?\d+(?:\.\d+)?)px\s*,\s*([+-]?\d+(?:\.\d+)?)/i.exec(box.node.style[transformStr]);

          data.x = +position[1];
          data.y = +position[2];
        } else
          enable = false;

        //异步执行
        currentBox !== box && window.setTimeout(() => {
          box.activate();
        }, 0);
      }
      break;
      //移动结束
      case 'touchend':
      case 'mouseup': {
        enable = false;
      }
      break;
      //移出弹窗
      case 'mouseout': {
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
    return function dragEventTopLeft (e) {
      const type = e.type;
      switch (type) {
        //移动中
        case 'touchmove':
        case 'mousemove': {
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
      case 'mousedown': {
        if (box.movesNode && box.movesNode.contains(e.target)) {
          if (type === 'touchstart') {
            if (e.targetTouches.length === 1) {
              data.startX = e.targetTouches[0].pageX;
              data.startY = e.targetTouches[0].pageY;
            } else
              break;
          } else {
            data.startX = e.clientX;
            data.startY = e.clientY;
          }

          enable = true;
          data.x = box.node.offsetLeft;
          data.y = box.node.offsetTop;
        } else
          enable = false;

        //异步执行
        currentBox !== box && window.setTimeout(() => {
          box.activate();
        }, 0);
      }
      break;
      //移动结束
      case 'touchend':
      case 'mouseup': {
        enable = false;
      }
      break;
      //移出弹窗
      case 'mouseout': {
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
function create (self) {
  //create node
  const node = self.node = document.createElement('div'),
    event = dragEvent(self),
    length = self.option.buttons.length
  ;
  node.id = `${self.type}_box_${self.id}`;
  node.className = `${className} ${self.type}-box ${activeClassName} ${message.option.activeClassName} ${self.option.className}`;
  node.innerHTML = `<div class="${className}__head">${self.option.title}<span class="${className}__close" title="close/关闭">×</span></div><div class="${className}__body">${self.option.text}</div><div class="${className}__foot"></div></div>`;
  rootNode.appendChild(node);
  //绑定关闭事件
  let cssText = `position:fixed;z-index:${(typeof message.option.zIndex === 'number' && message.option.zIndex > 0 ? message.option.zIndex : 10000) + counter};`,
    eventsName
  ;

  //create node
  if (message.option.transform && transform) {
    // cssText += 'left:50%;top:50%;' + (hasTransformPrefix ? `-${cssPrefix}-transform:translate(-${Math.floor(node.offsetWidth / 2)}px,-${Math.floor(node.offsetHeight / 2)}px);` : `transform:translate(-${Math.floor(node.offsetWidth / 2)}px,-${Math.floor(node.offsetHeight / 2)}px);`);
    cssText += `left:50%;top:50%;${hasTransformPrefix ? `-${cssPrefix}-` : ''}transform:${transformStyle}`.replace('{$position}', `-${Math.floor(node.offsetWidth / 2)}px,-${Math.floor(node.offsetHeight / 2)}px`);
  } else {
    cssText += `left:${(document.documentElement.clientWidth - node.offsetWidth) / 2}px;top:${(document.documentElement.clientHeight - node.offsetHeight) / 2}px`;
  }
  node.style.cssText = cssText;
  // 按钮和关闭事件
  node.querySelector(`.${className}__close`).addEventListener('click', e => {
    e.preventDefault();
    self && self.remove(0);
  });
  if (length) {
    //如果有按钮
    const footNode = node.childNodes[2];
    for (let i = 0; i < length; i++) {
      const button = document.createElement('button');
      button.className = 'btn';
      button.textContent = self.option.buttons[i];
      button.addEventListener('click', e => {
        e.preventDefault();
        self && self.remove(i + 1);
      });
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
  for (let i = eventsName.length - 1; i >= 0; i--) {
    node.addEventListener(eventsName[i], event);
  }
  //保存当前对象
  if (currentBox) {
    try {
      boxData[self.id].prevBox = currentBox;
      boxData[currentBox.id].nextBox = self;
      currentBox.node.classList.remove(activeClassName) && message.option.activeClassName && currentBox.node.classList.remove(message.option.activeClassName);
    } catch (e) {
      console.log('create error:', e);
    }
  }
  //currentBox指向当前对象
  currentBox = self;
  //打开蒙板
  self.option.showMask && mask.show();
  self.promise = new Promise((resolve) => {
    self.resolve = resolve;
  });
  //message.length = counter;
  if (self.option.timeout) {
    window.setTimeout(() => {
      try {
        self.remove(-3);
      } catch (e) {console.log(`remove box error: ${self.id}`)}
    }, self.option.timeout * 1000);
  }
  boxData[self.id].destroy.push(() => self = null);
}

class Box {
  /*
   * @param string/object text text(html)/option
   * @param object events {close, active}
   */
  constructor (text, events) {
    this.id = counter++;
    this.option = Object.assign(
      {},
      defaultOption,
      typeof text === 'string' ? { text } : text);
    this.node = this.movesNode = null;
    boxData[this.id] = {
      nextBox: null,
      prevBox: null,
      destroy: [],
      events
    };
  }
  /*
   * 激活当前弹窗到顶层
   */
  activate () {
    const node = this.node;
    const data = boxData[this.id];
    //断开当前box对象
    this.option.buttons.length && node.querySelector(`.${className}__foot>button:first-child`).focus();
    node.classList.add(activeClassName) && message.option.activeClassName && node.classList.add(message.option.activeClassName);
    //把当前box对象添加到链到末端
    if (currentBox !== this) {
      let box,
        zIndex = node.style.zIndex;
      try {
        if (data.prevBox) {
          let prev = data.prevBox;
          boxData[prev.id].nextBox = data.nextBox;
        }
        if (data.nextBox) {
          let next = data.nextBox
          boxData[next.id].prevBox = data.prevBox;
          box = data.nextBox;
        }
        boxData[currentBox.id].nextBox = this;
        data.prevBox = currentBox;
        data.nextBox = null;
        //重新排z-index
        while (box) {
          box.node.style.zIndex = zIndex++;
          box = boxData[box.id].nextBox;
        }

        //末端到2个box交换z-index和className
        currentBox.node.classList.remove(activeClassName) && message.option.activeClassName && currentBox.node.classList.remove(message.option.activeClassName);
      } catch (e) {
        console.log('activate error:', e);
      }
      currentBox = this;
    }
    data.events && typeof data.events.active === 'function' && data.events.active(this);

    return this;
  }
  /*
   * 销毁对象
   */
  remove (index = -1) {
    //移除node
    const data = boxData[this.id];
    this.node.parentNode.removeChild(this.node);
    this.node = this.movesNode = null;
    this.resolve({
      index,
      type: this.type
    });
    this.promise.catch(() => {});
    data.events && typeof data.events.close === 'function' && data.events.close({
      index,
      type: this.type
    });
    //清理message列表
    if (--counter) {
      //当前活动弹窗（currentBox）
      try {
        if (data.prevBox) {
          let prev = data.prevBox;
          boxData[prev.id].nextBox = data.nextBox;
        }
        if (data.nextBox) {
          let next = data.nextBox;
          boxData[next.id].prevBox = data.prevBox;
        }
        if (currentBox === this) {
          currentBox = data.prevBox;
          currentBox.activate();
        }
      } catch (e) {
        console.error('remove error', e)
      }
    } else {
      currentBox = null;
      //关闭蒙版
      mask.hide();
    }
    // destroy data
    data.destroy.forEach(fn => fn());
    data.destroy = data.events = data.prevBox = data.nextBox = null;
    boxData[this.id] = null;
  }
  /*
   *  关闭事件
   *  -3 timeout -2 键盘esc -1 点击遮罩层 0 关闭按钮 1~ 底部按钮
   */
  close (cb) {
    return this.promise.then(cb);
  }
  text (text) {
    this.node.querySelector(`.${className}__body`).innerHTML = text;
    return this;
  }
  prev () {
    return boxData[this.id].prevBox;
  }
  next () {
    return boxData[this.id].nextBox;
  }
}
class AlertBox extends Box {
  constructor (text, events) {
    super({ text }, events);
    this.type = 'alert';
    create(this);
  }
}
class ConfirmBox extends Box {
  constructor (text, events) {
    super({
      text,
      buttons: ['确认', '取消']
    }, events);
    this.type = 'confirm';
    create(this);
  }
}
class ToastBox extends Box {
  constructor (text, timeout = 3) {
    super({
      text,
      timeout,
      showMask: false,
      dragMode: 0,
      buttons: []
    });
    this.type = 'toast';
    create(this);
  }
}
class PopBox extends Box {
  constructor (text, events) {
    super(text, events);
    this.type = 'pop';
    create(this);
  }
}
export const alert = (text, events) => new AlertBox(text, events);
export const confirm = (text, events) => new ConfirmBox(text, events);
export const toast = (text, timeout) => new ToastBox(text, timeout);
export const pop = (option, events) => new PopBox(option, events);
export const current = () => currentBox;
export const root = () => {
  let box = currentBox, lastBox;
  do {
    lastBox = box;
  } while (box = box.prev())
  return lastBox;
};
export const config = option => {
  if (option && typeof option === 'object') Object.assign(message.option, option);
  return Object.assign({}, message.option);
}

export default {
  alert,
  confirm,
  config,
  pop,
  toast,
  current,
  root
}
