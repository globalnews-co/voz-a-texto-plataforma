"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadFile = exports.updateNoticia = exports.updateFechaNoticia = exports.login = exports.getmediosvt = exports.getTrancriptions = exports.getTipos = exports.getTemasGeneralesById = exports.getTemasGenerales = exports.getProgramas = exports.getPalabras = exports.getNotesById = exports.getNotasTemas = exports.getMynotesdsk = exports.getMynotes = exports.getMencionById = exports.getMencion = exports.getMedio = exports.getMediaCuts = exports.getMedia = exports.getCoberturas = exports.getCoberturaId = exports.editNotes = exports.deleteTemas = exports.deleteMensiones = exports.deleteCoberturas = exports.InsertTema = exports.InsertMencions = exports.InsertCoberturas = exports.InserNoticia = void 0;
var _mssql = require("mssql");
var _database = require("../database");
var _fluentFfmpeg = _interopRequireDefault(require("fluent-ffmpeg"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var multer = require('multer');
var getmediosvt = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context.sent;
            _context.next = 7;
            return pool.request().query(_database.querys.getmediosvt);
          case 7:
            result = _context.sent;
            res.json(result.recordset);
            _context.next = 15;
            break;
          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);
            res.status(500);
            res.send(_context.t0.message);
          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 11]]);
  }));
  return function getmediosvt(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports.getmediosvt = getmediosvt;
var getMynotesdsk = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var id, pool, result;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            id = req.params.id; // deshabilitar cors
            res.header("Access-Control-Allow-Origin", "*");
            _context2.next = 5;
            return (0, _database.getConnection)();
          case 5:
            pool = _context2.sent;
            _context2.next = 8;
            return pool.request().input("userid", id).query(_database.querys.selectMyNotesDsk);
          case 8:
            result = _context2.sent;
            res.json(result.recordset);
            _context2.next = 16;
            break;
          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2["catch"](0);
            res.status(500);
            res.send(_context2.t0.message);
          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 12]]);
  }));
  return function getMynotesdsk(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
exports.getMynotesdsk = getMynotesdsk;
var getMynotes = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            // deshabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context3.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context3.sent;
            _context3.next = 7;
            return pool.request().input("userid", req.body.userid).query(_database.querys.selectMyNotes);
          case 7:
            result = _context3.sent;
            res.json(result.recordset);
            _context3.next = 15;
            break;
          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](0);
            res.status(500);
            res.send(_context3.t0.message);
          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 11]]);
  }));
  return function getMynotes(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
//Me traigo la consulta del querys getNotasTemas
exports.getMynotes = getMynotes;
var getNotasTemas = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context4.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context4.sent;
            _context4.next = 7;
            return pool.request().query(_database.querys.getNotasTemas);
          case 7:
            result = _context4.sent;
            res.json(result.recordset);
            _context4.next = 15;
            break;
          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4["catch"](0);
            res.status(500);
            res.send(_context4.t0.message);
          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 11]]);
  }));
  return function getNotasTemas(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
exports.getNotasTemas = getNotasTemas;
var getTrancriptions = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context5.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context5.sent;
            _context5.next = 7;
            return pool.request().input("id", req.params.id).input("name", req.body.nombre).query(_database.querys.getTrancriptions);
          case 7:
            result = _context5.sent;
            res.json(result.recordset[0]);
            _context5.next = 15;
            break;
          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](0);
            res.status(500);
            res.send(_context5.t0.message);
          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 11]]);
  }));
  return function getTrancriptions(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
exports.getTrancriptions = getTrancriptions;
var getMediaCuts = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context6.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context6.sent;
            _context6.next = 7;
            return pool.request().input("id", req.params.id).input("fechaCorte", req.body.fechaCorte).query(_database.querys.getMediaCuts);
          case 7:
            result = _context6.sent;
            res.json(result.recordset);
            _context6.next = 15;
            break;
          case 11:
            _context6.prev = 11;
            _context6.t0 = _context6["catch"](0);
            res.status(500);
            res.send(_context6.t0.message);
          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 11]]);
  }));
  return function getMediaCuts(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();
exports.getMediaCuts = getMediaCuts;
var getMedia = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context7.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context7.sent;
            _context7.next = 7;
            return pool.request().input("nombreCorte", req.body.nombreCorte).query(_database.querys.getCut);
          case 7:
            result = _context7.sent;
            res.json(result.recordset);
            _context7.next = 15;
            break;
          case 11:
            _context7.prev = 11;
            _context7.t0 = _context7["catch"](0);
            res.status(500);
            res.send(_context7.t0.message);
          case 15:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 11]]);
  }));
  return function getMedia(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();
exports.getMedia = getMedia;
var getPalabras = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context8.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context8.sent;
            _context8.next = 7;
            return pool.request().query(_database.querys.getPalabras);
          case 7:
            result = _context8.sent;
            res.json(result.recordset);
            _context8.next = 15;
            break;
          case 11:
            _context8.prev = 11;
            _context8.t0 = _context8["catch"](0);
            res.status(500);
            res.send(_context8.t0.message);
          case 15:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 11]]);
  }));
  return function getPalabras(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}();
exports.getPalabras = getPalabras;
var getNotesById = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context9.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context9.sent;
            _context9.next = 7;
            return pool.request().input("id", req.params.id).query(_database.querys.getNotasById);
          case 7:
            result = _context9.sent;
            return _context9.abrupt("return", res.json(result.recordset[0]));
          case 11:
            _context9.prev = 11;
            _context9.t0 = _context9["catch"](0);
            res.status(500);
            res.send(_context9.t0.message);
          case 15:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 11]]);
  }));
  return function getNotesById(_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}();
exports.getNotesById = getNotesById;
var getMencionById = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context10.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context10.sent;
            _context10.next = 7;
            return pool.request().input("id", req.params.id).query(_database.querys.getMencionById);
          case 7:
            result = _context10.sent;
            return _context10.abrupt("return", res.json(result.recordset));
          case 11:
            _context10.prev = 11;
            _context10.t0 = _context10["catch"](0);
            res.status(500);
            res.send(_context10.t0.message);
          case 15:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 11]]);
  }));
  return function getMencionById(_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}();
exports.getMencionById = getMencionById;
var getMencion = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context11.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context11.sent;
            _context11.next = 7;
            return pool.request().query(_database.querys.getMencion);
          case 7:
            result = _context11.sent;
            return _context11.abrupt("return", res.json(result.recordset));
          case 11:
            _context11.prev = 11;
            _context11.t0 = _context11["catch"](0);
            res.status(500);
            res.send(_context11.t0.message);
          case 15:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[0, 11]]);
  }));
  return function getMencion(_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}();
exports.getMencion = getMencion;
var getTemasGeneralesById = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context12.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context12.sent;
            _context12.next = 7;
            return pool.request().input("id", req.params.id).query(_database.querys.getTemasGeneralesById);
          case 7:
            result = _context12.sent;
            return _context12.abrupt("return", res.json(result.recordset));
          case 11:
            _context12.prev = 11;
            _context12.t0 = _context12["catch"](0);
            res.status(500);
            res.send(_context12.t0.message);
          case 15:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[0, 11]]);
  }));
  return function getTemasGeneralesById(_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
}();
exports.getTemasGeneralesById = getTemasGeneralesById;
var getTipos = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context13.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context13.sent;
            _context13.next = 7;
            return pool.request().query(_database.querys.selectTipos);
          case 7:
            result = _context13.sent;
            return _context13.abrupt("return", res.json(result.recordset));
          case 11:
            _context13.prev = 11;
            _context13.t0 = _context13["catch"](0);
            res.status(500);
            res.send(_context13.t0.message);
          case 15:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[0, 11]]);
  }));
  return function getTipos(_x25, _x26) {
    return _ref13.apply(this, arguments);
  };
}();
exports.getTipos = getTipos;
var getTemasGenerales = /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context14.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context14.sent;
            _context14.next = 7;
            return pool.request().query(_database.querys.getTemasGenerales);
          case 7:
            result = _context14.sent;
            return _context14.abrupt("return", res.json(result.recordset));
          case 11:
            _context14.prev = 11;
            _context14.t0 = _context14["catch"](0);
            res.status(500);
            res.send(_context14.t0.message);
          case 15:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, null, [[0, 11]]);
  }));
  return function getTemasGenerales(_x27, _x28) {
    return _ref14.apply(this, arguments);
  };
}();
exports.getTemasGenerales = getTemasGenerales;
var getCoberturaId = /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context15.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context15.sent;
            _context15.next = 7;
            return pool.request().input("id", req.params.id).query(_database.querys.getCoberturaId);
          case 7:
            result = _context15.sent;
            return _context15.abrupt("return", res.json(result.recordset));
          case 11:
            _context15.prev = 11;
            _context15.t0 = _context15["catch"](0);
            res.status(500);
            res.send(_context15.t0.message);
          case 15:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, null, [[0, 11]]);
  }));
  return function getCoberturaId(_x29, _x30) {
    return _ref15.apply(this, arguments);
  };
}();
exports.getCoberturaId = getCoberturaId;
var getCoberturas = /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context16.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context16.sent;
            _context16.next = 7;
            return pool.request().query(_database.querys.getCobertura);
          case 7:
            result = _context16.sent;
            return _context16.abrupt("return", res.json(result.recordset));
          case 11:
            _context16.prev = 11;
            _context16.t0 = _context16["catch"](0);
            res.status(500);
            res.send(_context16.t0.message);
          case 15:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, null, [[0, 11]]);
  }));
  return function getCoberturas(_x31, _x32) {
    return _ref16.apply(this, arguments);
  };
}();
exports.getCoberturas = getCoberturas;
var getMedio = /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17(req, res) {
    var idmedio, pool, result;
    return _regeneratorRuntime().wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.prev = 0;
            //desabilitar cors  
            idmedio = req.params.id;
            res.header("Access-Control-Allow-Origin", "*");
            _context17.next = 5;
            return (0, _database.getConnection)();
          case 5:
            pool = _context17.sent;
            _context17.next = 8;
            return pool.request().input("idmedio", idmedio).query(_database.querys.selectMedio);
          case 8:
            result = _context17.sent;
            return _context17.abrupt("return", res.json(result.recordset[0]));
          case 12:
            _context17.prev = 12;
            _context17.t0 = _context17["catch"](0);
            res.status(500);
            res.send(_context17.t0.message);
          case 16:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, null, [[0, 12]]);
  }));
  return function getMedio(_x33, _x34) {
    return _ref17.apply(this, arguments);
  };
}();
exports.getMedio = getMedio;
var getProgramas = /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18(req, res) {
    var pool, result;
    return _regeneratorRuntime().wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.prev = 0;
            //desabilitar cors    
            res.header("Access-Control-Allow-Origin", "*");
            _context18.next = 4;
            return (0, _database.getConnection)();
          case 4:
            pool = _context18.sent;
            _context18.next = 7;
            return pool.request().input("id", req.params.id).query(_database.querys.selectProgramas);
          case 7:
            result = _context18.sent;
            return _context18.abrupt("return", res.json(result.recordset));
          case 11:
            _context18.prev = 11;
            _context18.t0 = _context18["catch"](0);
            res.status(500);
            res.send(_context18.t0.message);
          case 15:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, null, [[0, 11]]);
  }));
  return function getProgramas(_x35, _x36) {
    return _ref18.apply(this, arguments);
  };
}();
exports.getProgramas = getProgramas;
var deleteMensiones = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee19(req, res) {
    var MensionDelete, pool, _iterator, _step, mension, result;
    return _regeneratorRuntime().wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            MensionDelete = req.body;
            _context19.prev = 1;
            console.log(MensionDelete.eliminarID);
            _context19.next = 5;
            return (0, _database.getConnection)();
          case 5:
            pool = _context19.sent;
            _iterator = _createForOfIteratorHelper(MensionDelete.eliminarID);
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                mension = _step.value;
                console.log(mension);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            _context19.next = 10;
            return pool.request().input("id", req.params.id).input("MensionDelete", _database.sql.Int, MensionDelete.eliminarID).query(_database.querys.deleteMencion);
          case 10:
            result = _context19.sent;
            return _context19.abrupt("return", res.send("ok"));
          case 14:
            _context19.prev = 14;
            _context19.t0 = _context19["catch"](1);
            res.status(500);
            res.send(_context19.t0.message);
          case 18:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, null, [[1, 14]]);
  }));
  return function deleteMensiones(_x37, _x38) {
    return _ref19.apply(this, arguments);
  };
}();
exports.deleteMensiones = deleteMensiones;
var deleteCoberturas = /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee20(req, res) {
    var MensionDelete, pool, _iterator2, _step2, mension, result;
    return _regeneratorRuntime().wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            MensionDelete = req.body;
            _context20.prev = 1;
            console.log(MensionDelete.eliminarID);
            _context20.next = 5;
            return (0, _database.getConnection)();
          case 5:
            pool = _context20.sent;
            _iterator2 = _createForOfIteratorHelper(MensionDelete.eliminarID);
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                mension = _step2.value;
                console.log(mension);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
            _context20.next = 10;
            return pool.request().input("id", req.params.id).input("CoberturaDelete", _database.sql.Int, MensionDelete.eliminarID).query(_database.querys.deleteCobertura);
          case 10:
            result = _context20.sent;
            return _context20.abrupt("return", res.send("ok"));
          case 14:
            _context20.prev = 14;
            _context20.t0 = _context20["catch"](1);
            res.status(500);
            res.send(_context20.t0.message);
          case 18:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, null, [[1, 14]]);
  }));
  return function deleteCoberturas(_x39, _x40) {
    return _ref20.apply(this, arguments);
  };
}();
exports.deleteCoberturas = deleteCoberturas;
var deleteTemas = /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee21(req, res) {
    var MensionDelete, pool, _iterator3, _step3, mension, result;
    return _regeneratorRuntime().wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            MensionDelete = req.body;
            _context21.prev = 1;
            console.log(MensionDelete.eliminarID);
            _context21.next = 5;
            return (0, _database.getConnection)();
          case 5:
            pool = _context21.sent;
            _iterator3 = _createForOfIteratorHelper(MensionDelete.eliminarID);
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                mension = _step3.value;
                console.log(mension);
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
            _context21.next = 10;
            return pool.request().input("id", req.params.id).input("TemaDelete", _database.sql.Int, MensionDelete.eliminarID).query(_database.querys.deleteTema);
          case 10:
            result = _context21.sent;
            return _context21.abrupt("return", res.send("ok"));
          case 14:
            _context21.prev = 14;
            _context21.t0 = _context21["catch"](1);
            res.status(500);
            res.send(_context21.t0.message);
          case 18:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21, null, [[1, 14]]);
  }));
  return function deleteTemas(_x41, _x42) {
    return _ref21.apply(this, arguments);
  };
}();
exports.deleteTemas = deleteTemas;
var InsertMencions = /*#__PURE__*/function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee22(req, res) {
    var MensionInsert, pool, _iterator4, _step4, mension;
    return _regeneratorRuntime().wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            MensionInsert = req.body;
            console.log("entreinsert");
            req.header("Access-Control-Allow-Origin", "*");
            console.log(MensionInsert);
            _context22.prev = 4;
            _context22.next = 7;
            return (0, _database.getConnection)();
          case 7:
            pool = _context22.sent;
            _iterator4 = _createForOfIteratorHelper(MensionInsert.agregarID);
            _context22.prev = 9;
            _iterator4.s();
          case 11:
            if ((_step4 = _iterator4.n()).done) {
              _context22.next = 19;
              break;
            }
            mension = _step4.value;
            console.log(mension);
            console.log(MensionInsert.fechaAlta);
            _context22.next = 17;
            return pool.request().input("id", _database.sql.Int, req.params.id).input("mension", _database.sql.Int, mension).input("fechaAlta", _database.sql.DateTime, MensionInsert.fechaAlta).query(_database.querys.InsertMencion);
          case 17:
            _context22.next = 11;
            break;
          case 19:
            _context22.next = 24;
            break;
          case 21:
            _context22.prev = 21;
            _context22.t0 = _context22["catch"](9);
            _iterator4.e(_context22.t0);
          case 24:
            _context22.prev = 24;
            _iterator4.f();
            return _context22.finish(24);
          case 27:
            res.json("ok");
            _context22.next = 34;
            break;
          case 30:
            _context22.prev = 30;
            _context22.t1 = _context22["catch"](4);
            res.status(500);
            res.send(_context22.t1);
          case 34:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, null, [[4, 30], [9, 21, 24, 27]]);
  }));
  return function InsertMencions(_x43, _x44) {
    return _ref22.apply(this, arguments);
  };
}();
exports.InsertMencions = InsertMencions;
var InsertCoberturas = /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee23(req, res) {
    var MensionInsert, pool, _iterator5, _step5, cobertura;
    return _regeneratorRuntime().wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            MensionInsert = req.body;
            console.log("entreinsert");
            req.header("Access-Control-Allow-Origin", "*");
            console.log(MensionInsert);
            _context23.prev = 4;
            _context23.next = 7;
            return (0, _database.getConnection)();
          case 7:
            pool = _context23.sent;
            _iterator5 = _createForOfIteratorHelper(MensionInsert.agregarID);
            _context23.prev = 9;
            _iterator5.s();
          case 11:
            if ((_step5 = _iterator5.n()).done) {
              _context23.next = 19;
              break;
            }
            cobertura = _step5.value;
            console.log(cobertura);
            console.log(MensionInsert.fechaAlta);
            _context23.next = 17;
            return pool.request().input("id", _database.sql.Int, req.params.id).input("cobertura", _database.sql.Int, cobertura).input("fechaAlta", _database.sql.DateTime, MensionInsert.fechaAlta).query(_database.querys.InsertCobertura);
          case 17:
            _context23.next = 11;
            break;
          case 19:
            _context23.next = 24;
            break;
          case 21:
            _context23.prev = 21;
            _context23.t0 = _context23["catch"](9);
            _iterator5.e(_context23.t0);
          case 24:
            _context23.prev = 24;
            _iterator5.f();
            return _context23.finish(24);
          case 27:
            res.json("ok");
            _context23.next = 34;
            break;
          case 30:
            _context23.prev = 30;
            _context23.t1 = _context23["catch"](4);
            res.status(500);
            res.send(_context23.t1);
          case 34:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, null, [[4, 30], [9, 21, 24, 27]]);
  }));
  return function InsertCoberturas(_x45, _x46) {
    return _ref23.apply(this, arguments);
  };
}();
exports.InsertCoberturas = InsertCoberturas;
var updateFechaNoticia = /*#__PURE__*/function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee24(req, res) {
    var tiempoNoticia, pool;
    return _regeneratorRuntime().wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            tiempoNoticia = req.body;
            console.log("entreinsert");
            req.header("Access-Control-Allow-Origin", "*");
            _context24.prev = 3;
            _context24.next = 6;
            return (0, _database.getConnection)();
          case 6:
            pool = _context24.sent;
            _context24.next = 9;
            return pool.request().input("id", _database.sql.Int, req.params.id).input("fechaInicio", tiempoNoticia.fechaInicio).input("fechaFin", tiempoNoticia.fechaFin).input("duracion", _database.sql.Int, tiempoNoticia.duracion).query(_database.querys.updateFechaNoticia);
          case 9:
            res.json("ok");
            _context24.next = 16;
            break;
          case 12:
            _context24.prev = 12;
            _context24.t0 = _context24["catch"](3);
            res.status(500);
            res.send(_context24.t0);
          case 16:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, null, [[3, 12]]);
  }));
  return function updateFechaNoticia(_x47, _x48) {
    return _ref24.apply(this, arguments);
  };
}();
exports.updateFechaNoticia = updateFechaNoticia;
var InsertTema = /*#__PURE__*/function () {
  var _ref25 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee25(req, res) {
    var MensionInsert, pool, _iterator6, _step6, tema;
    return _regeneratorRuntime().wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            MensionInsert = req.body;
            console.log("entreinsert");
            req.header("Access-Control-Allow-Origin", "*");
            console.log(MensionInsert);
            _context25.prev = 4;
            _context25.next = 7;
            return (0, _database.getConnection)();
          case 7:
            pool = _context25.sent;
            _iterator6 = _createForOfIteratorHelper(MensionInsert.agregarID);
            _context25.prev = 9;
            _iterator6.s();
          case 11:
            if ((_step6 = _iterator6.n()).done) {
              _context25.next = 19;
              break;
            }
            tema = _step6.value;
            console.log(tema);
            console.log(MensionInsert.fechaAlta);
            _context25.next = 17;
            return pool.request().input("id", _database.sql.Int, req.params.id).input("tema", _database.sql.Int, tema).input("fechaAlta", _database.sql.DateTime, MensionInsert.fechaAlta).query(_database.querys.InsertTema);
          case 17:
            _context25.next = 11;
            break;
          case 19:
            _context25.next = 24;
            break;
          case 21:
            _context25.prev = 21;
            _context25.t0 = _context25["catch"](9);
            _iterator6.e(_context25.t0);
          case 24:
            _context25.prev = 24;
            _iterator6.f();
            return _context25.finish(24);
          case 27:
            res.json("ok");
            _context25.next = 34;
            break;
          case 30:
            _context25.prev = 30;
            _context25.t1 = _context25["catch"](4);
            res.status(500);
            res.send(_context25.t1);
          case 34:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, null, [[4, 30], [9, 21, 24, 27]]);
  }));
  return function InsertTema(_x49, _x50) {
    return _ref25.apply(this, arguments);
  };
}();
exports.InsertTema = InsertTema;
var login = /*#__PURE__*/function () {
  var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee26(req, res) {
    var username, password, pool, result, user, passwordResult, passwordRow;
    return _regeneratorRuntime().wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            username = req.body.nombreUsuario;
            password = req.body.password;
            _context26.prev = 2;
            _context26.next = 5;
            return (0, _database.getConnection)();
          case 5:
            pool = _context26.sent;
            _context26.next = 8;
            return pool.request().input("user", username).query(_database.querys.selectUser);
          case 8:
            result = _context26.sent;
            // Buscar el usuario en la tabla aspnet_Users
            user = result.recordset[0];
            if (user) {
              _context26.next = 12;
              break;
            }
            return _context26.abrupt("return", res.status(401).json({
              message: 'Username or password incorrect user'
            }));
          case 12:
            _context26.next = 14;
            return pool.request().input("pass", password).query(_database.querys.access);
          case 14:
            passwordResult = _context26.sent;
            passwordRow = passwordResult.recordset[0];
            if (passwordRow) {
              _context26.next = 18;
              break;
            }
            return _context26.abrupt("return", res.status(401).json({
              message: 'Username or password incorrect password'
            }));
          case 18:
            // Si el usuario y la contraseña son correctos, generar un token de sesión y retornar el user id
            res.json({
              userId: user.UserId,
              userName: user.UserName
            });
            _context26.next = 25;
            break;
          case 21:
            _context26.prev = 21;
            _context26.t0 = _context26["catch"](2);
            console.log(_context26.t0);
            res.status(500).json({
              message: 'Server error'
            });
          case 25:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26, null, [[2, 21]]);
  }));
  return function login(_x51, _x52) {
    return _ref26.apply(this, arguments);
  };
}();
exports.login = login;
var updateNoticia = /*#__PURE__*/function () {
  var _ref27 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee27(req, res) {
    var updateNoticia, pool, _iterator7, _step7, campo;
    return _regeneratorRuntime().wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            updateNoticia = req.body;
            console.log("entreinsert");
            req.header("Access-Control-Allow-Origin", "*");
            console.log(updateNoticia);
            _context27.prev = 4;
            _context27.next = 7;
            return (0, _database.getConnection)();
          case 7:
            pool = _context27.sent;
            _iterator7 = _createForOfIteratorHelper(updateNoticia.campo);
            _context27.prev = 9;
            _iterator7.s();
          case 11:
            if ((_step7 = _iterator7.n()).done) {
              _context27.next = 17;
              break;
            }
            campo = _step7.value;
            _context27.next = 15;
            return pool.request().input("id", _database.sql.Int, req.params.id).input("valor", updateNoticia.valor).query(_database.querys.updateNoticia(updateNoticia.campo));
          case 15:
            _context27.next = 11;
            break;
          case 17:
            _context27.next = 22;
            break;
          case 19:
            _context27.prev = 19;
            _context27.t0 = _context27["catch"](9);
            _iterator7.e(_context27.t0);
          case 22:
            _context27.prev = 22;
            _iterator7.f();
            return _context27.finish(22);
          case 25:
            res.json("ok");
            _context27.next = 33;
            break;
          case 28:
            _context27.prev = 28;
            _context27.t1 = _context27["catch"](4);
            res.status(500);
            console.log(_context27.t1);
            res.send(_context27.t1);
          case 33:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, null, [[4, 28], [9, 19, 22, 25]]);
  }));
  return function updateNoticia(_x53, _x54) {
    return _ref27.apply(this, arguments);
  };
}();
exports.updateNoticia = updateNoticia;
var editNotes = /*#__PURE__*/function () {
  var _ref28 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee28(req, res) {
    var startTime, endTime, mediaName, mediaUrl, fechainicio, pool, fecha, mes, mes2, year;
    return _regeneratorRuntime().wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            startTime = req.body.inicio;
            endTime = req.body.fin;
            mediaName = req.params.id;
            mediaUrl = req.body.url;
            fechainicio = req.body.fechaInicio;
            _context28.next = 7;
            return (0, _database.getConnection)();
          case 7:
            pool = _context28.sent;
            fecha = new Date(fechainicio);
            mes = fecha.getMonth() + 1;
            mes2 = mes.toString().padStart(2, '0');
            year = fecha.getFullYear();
            (0, _fluentFfmpeg["default"])(mediaUrl).setStartTime(startTime).setDuration(endTime - startTime).output("\\\\192.168.1.85\\web\\Alertas\\".concat(year, "\\").concat(mes2, "\\").concat(mediaName, ".mp4")).on('end', function () {
              var linkCorte = "http://storage08.globalnews.com.co/Alertas/".concat(year, "/").concat(mes2, "/").concat(mediaName, ".mp4");
              pool.request().input('linkCorte', linkCorte).input('noticiaID', mediaName).query('UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] SET [LinkStreaming] = @linkCorte, [FlagCortado] = \'S\' WHERE [NoticiaID] = @noticiaID');
              pool.request().input('inicio', startTime).input('fin', endTime).input('noticiaID', mediaName).query("UPDATE [Videoteca_dev].[dbo].[NoticiasVT] SET [inicio]=@inicio ,[fin]=@fin WHERE [IDNoticia]=@noticiaID");
              res.json({
                id: mediaName
              });
            }).on('error', function (error) {
              res.status(500);
              console.error(error);
              res.send(error);
            }).run();
          case 13:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28);
  }));
  return function editNotes(_x55, _x56) {
    return _ref28.apply(this, arguments);
  };
}();
exports.editNotes = editNotes;
var InserNoticia = /*#__PURE__*/function () {
  var _ref29 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee29(req, res) {
    var insertNoticia, pool, result, mediaUrl, startTime, endTime, mediaName, fecha, mes, mes2, year;
    return _regeneratorRuntime().wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            insertNoticia = req.body;
            console.log("entreinsert");
            req.header("Access-Control-Allow-Origin", "*");
            _context29.prev = 3;
            _context29.next = 6;
            return (0, _database.getConnection)();
          case 6:
            pool = _context29.sent;
            _context29.next = 9;
            return pool.request().input("aclaracion", insertNoticia.aclaracion).input("conductores", insertNoticia.conductores).input("duracion", insertNoticia.duracion).input("entrevistado", insertNoticia.entrevistado).input("fechaInicio", insertNoticia.fechaInicio).input("fechaTransmitido", insertNoticia.fechaTransmitido).input("fechaFin", insertNoticia.fechaFin).input("medio", insertNoticia.medioid).input("programa", insertNoticia.programaid).input("tiponoticiaid", insertNoticia.tiponoticiaid).input("tipotonoid", insertNoticia.tipotonoid).input("titulo", insertNoticia.titulo).input("userid", insertNoticia.userid).query(_database.querys.InsertNota);
          case 9:
            result = _context29.sent;
            mediaUrl = insertNoticia.mediaUrl;
            startTime = insertNoticia.startTime;
            endTime = insertNoticia.endTime;
            mediaName = result.recordset[0].id;
            fecha = new Date(insertNoticia.fechaInicio);
            mes = fecha.getMonth() + 1;
            mes2 = mes.toString().padStart(2, '0');
            year = fecha.getFullYear(); // Aquí se corta el video utilizando fluent-ffmpeg
            (0, _fluentFfmpeg["default"])(mediaUrl).setStartTime(startTime).setDuration(endTime - startTime).output("\\\\192.168.1.85\\web\\Alertas\\".concat(year, "\\").concat(mes2, "\\").concat(mediaName, ".mp4")).on('end', function () {
              var linkCorte = "http://storage08.globalnews.com.co/Alertas/".concat(year, "/").concat(mes2, "/").concat(mediaName, ".mp4");

              // Aquí se actualiza la base de datos
              pool.request().input('CorteUrl', mediaUrl).input('noticiaID', mediaName).input('inicio', startTime).input('fin', endTime).query("INSERT INTO [Videoteca_dev].[dbo].[NoticiasVT] ([IDNoticia],[CorteUrl],[inicio],[fin],[Estado]) VALUES (@noticiaID,@CorteUrl,@inicio,@fin,'S')");
              pool.request().input('linkCorte', linkCorte).input('noticiaID', mediaName).query('UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] SET [LinkStreaming] = @linkCorte, [FlagCortado] = \'S\' WHERE [NoticiaID] = @noticiaID');
              res.json({
                id: mediaName
              });
            }).on('error', function (error) {
              res.status(500);
              console.error(error);
              res.send(error);
            }).run();
            _context29.next = 26;
            break;
          case 21:
            _context29.prev = 21;
            _context29.t0 = _context29["catch"](3);
            res.status(500);
            console.log(_context29.t0);
            res.send(_context29.t0);
          case 26:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29, null, [[3, 21]]);
  }));
  return function InserNoticia(_x57, _x58) {
    return _ref29.apply(this, arguments);
  };
}();

// recibir archivo de un formdata
exports.InserNoticia = InserNoticia;
var uploadFile = /*#__PURE__*/function () {
  var _ref30 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee30(req, res) {
    var upload;
    return _regeneratorRuntime().wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            //desabilitar cors
            res.header("Access-Control-Allow-Origin", "*");
            // leer el form data
            try {
              upload = multer({
                storage: storage
              }).single('file');
              upload(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                  return res.status(500).json(err);
                } else if (err) {
                  return res.status(500).json(err);
                }

                //

                // responder con la ruta del archivo donde se guardo
                return res.status(200).send(req.file);
              });
            } catch (error) {
              res.status(500).json(error);
            }
          case 2:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30);
  }));
  return function uploadFile(_x59, _x60) {
    return _ref30.apply(this, arguments);
  };
}();
exports.uploadFile = uploadFile;
var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    var fechaInicio = req.body.fechaInicio;
    var fecha = new Date(fechaInicio);
    var mes = fecha.getMonth() + 1;
    var mes2 = mes.toString().padStart(2, '0');
    var year = fecha.getFullYear();
    cb(null, "\\\\192.168.1.85\\web\\Alertas\\".concat(year, "\\").concat(mes2));
  },
  filename: function () {
    var _filename = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee31(req, file, cb) {
      var _req$body, titulo, contenido, fechaInicio, fechaFin, medio, programa, duracion, conductores, entrevistado, tipoNoticia, userid, fechatransmitido, fecha, mes, mes2, year, extension, pool, result, medianame, link, name;
      return _regeneratorRuntime().wrap(function _callee31$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              _req$body = req.body, titulo = _req$body.titulo, contenido = _req$body.contenido, fechaInicio = _req$body.fechaInicio, fechaFin = _req$body.fechaFin, medio = _req$body.medio, programa = _req$body.programa, duracion = _req$body.duracion, conductores = _req$body.conductores, entrevistado = _req$body.entrevistado, tipoNoticia = _req$body.tipoNoticia, userid = _req$body.userid, fechatransmitido = _req$body.fechatransmitido;
              fecha = new Date(fechaInicio);
              mes = fecha.getMonth() + 1;
              mes2 = mes.toString().padStart(2, '0');
              year = fecha.getFullYear();
              extension = file.originalname.split('.').pop();
              console.log(extension);
              _context31.next = 9;
              return (0, _database.getConnection)();
            case 9:
              pool = _context31.sent;
              _context31.next = 12;
              return pool.request().input("aclaracion", contenido).input("conductores", conductores).input("duracion", duracion).input("entrevistado", entrevistado).input("fechaInicio", fechaInicio).input("fechaTransmitido", fechatransmitido).input("fechaFin", fechaFin).input("medio", medio).input("programa", programa).input("tiponoticiaid", tipoNoticia).input("tipotonoid", "").input("titulo", titulo).input("userid", userid).query(_database.querys.InsertNota);
            case 12:
              result = _context31.sent;
              medianame = result.recordset[0].id;
              console.log(medianame);
              link = "http://storage08.globalnews.com.co/Alertas/".concat(year, "/").concat(mes2, "/").concat(medianame, ".").concat(extension);
              _context31.next = 18;
              return pool.request().input('linkCorte', link).input('noticiaID', medianame).query('UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] SET [LinkStreaming] = @linkCorte, [FlagCortado] = \'S\' WHERE [NoticiaID] = @noticiaID');
            case 18:
              console.log(titulo);
              // el nombre del archivo tiene que venir si o si de la base de datos
              name = medianame + "." + extension;
              cb(null, name);
            case 21:
            case "end":
              return _context31.stop();
          }
        }
      }, _callee31);
    }));
    function filename(_x61, _x62, _x63) {
      return _filename.apply(this, arguments);
    }
    return filename;
  }()
});