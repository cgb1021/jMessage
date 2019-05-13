"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var message = {
  box: null,
  length: 0
}; //消息对象

var alert = exports.alert = function alert() {
  console.log(message);
};

exports.default = {
  alert: alert
};