# jMessage

Create alert div

## Usage

```javascript
import message from 'jmessage'
import 'jmessage/style.css'

message.alert('a simple alert')
```

## Installation

With npm do

```javascript
npm install jmessage
```

## Basic Usage

### methods

```javascript
/*
 * @param string text
 * @param object events {close, active}
 */
alert()

/*
 * @param string text
 * @param object events {close, active}
 */
confirm()

/*
 * @param string text
 * @param number timeout default value 3
 */
toast()

/*
  * @param string/object text text(html)/option({
      title: '提示', // title
      text: '', // text(html) content
      buttons: ['确认'], // buttons
      className: '', // css class name
      showMask: true, // is show mask div
      timeout: 0, // how many second when auto close
      noClose: false, // don't remove div
      dragMode: 2 // 0 no drag, 1 the entire div can be drag,2 only head can be drag
    })
  * @param object events {close, active}
  */
pop()

/*
 * return current box
 */
current()

/*
 * return root box
 */
root()

/*
 * global option
 * @param object option {
 *  zIndex: 999, // css z-index
    activeClassName: '', // css class name when active
    maskClassName: '', // the mask div className
    transform: true, // use css transform to drag
  }
 */
config()

/*
 * instance default option
 * @param object option {
      title: '提示', // title
      text: '', // text(html) content
      buttons: ['确认'], // buttons
      className: '', // css class name
      showMask: true, // is show mask div
      timeout: 0, // how many second when auto close
      noClose: false, // don't remove div
      dragMode: 2 // 0 no drag, 1 the entire div can be drag,2 only head can be drag
    }
 */
setDefault()
```

### Box API

```javascript
/*
 * put the box to the top
 */
activate()

/*
 * delete the box
 */
remove()

/*
 * when the box close(close event)
 * @param function cb
 */
close()

/*
 * change text content
 */
text()

/*
 * the previous box
 */
prev()

/*
 * the next box
 */
next()
```

### events

```javascript
/*
 * use event when close
 */
message.alert('it is alert1', {
  /*res {
  *   index: -3 timeout, -2 esc key, -1 click mask, 0 click close button, 1~ click footer buttons
  * }
  */
  close (res) {
    // close event
    console.log(res)
  },
  active () {
    // active event
    console.log('active event')
  }
})
/*
 * use promise when close
 * res {
 *   index: -3 timeout, -2 esc key, -1 click mask, 0 click close button, 1~ click footer buttons
 * }
 */
message.alert('it is alert2').close(res => {
  // close event
  console.log(res)
})
```

## License

(MIT)

Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.