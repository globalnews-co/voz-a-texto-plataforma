"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  querys: true
};
Object.defineProperty(exports, "querys", {
  enumerable: true,
  get: function get() {
    return _querys.querys;
  }
});
var _conexion = require("./conexion");
Object.keys(_conexion).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _conexion[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _conexion[key];
    }
  });
});
var _querys = require("./querys");