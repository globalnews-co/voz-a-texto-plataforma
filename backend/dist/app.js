"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _morgan = _interopRequireDefault(require("morgan"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _notas = _interopRequireDefault(require("./routes/notas.routes"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var app = (0, _express["default"])();

//setings
app.set('port', 3020);

// Middlewares
app.use((0, _cors["default"])());
app.use((0, _morgan["default"])("dev"));
app.use(_bodyParser["default"].urlencoded({
  limit: '50mb',
  extended: true
}));

//app.use(express.urlencoded({limit:'50mb', extended: true }));
//app.use(express.json({limit: '50mb', extended: true}));

app.use(_bodyParser["default"].json({
  limit: '50mb'
}));

//routes
app.use("/api", _notas["default"]);
var _default = app;
exports["default"] = _default;