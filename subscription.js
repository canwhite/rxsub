'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _extends = _interopDefault(require('@babel/runtime/helpers/extends'));
var _defineProperty = _interopDefault(require('@babel/runtime/helpers/defineProperty'));
var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('@babel/runtime/helpers/possibleConstructorReturn'));
var _getPrototypeOf = _interopDefault(require('@babel/runtime/helpers/getPrototypeOf'));
var _inherits = _interopDefault(require('@babel/runtime/helpers/inherits'));
var React = _interopDefault(require('react'));
var store = _interopDefault(require('./store.js'));
var utils_js = require('./utils.js');

var eventLog = store.eventLog;
/**
 * observable与react组件的集成(将observable转换为组件属性)
 * @param {object} observablesMap - 可观察对象集合
 * @param {object} inputOptions - 选项
 * @param {object} inputOptions.defaultProps - 组件的默认属性
*/

var subscription = function subscription(observablesMap, inputOptions) {
  var options = inputOptions || {};

  var handler = function handler(Comp) {
    if (!utils_js.isObject(observablesMap)) throw new TypeError("\u65B9\u6CD5subscription()\u7684\u53C2\u6570observablesMap\u5FC5\u987B\u662Fobject\u7C7B\u578B");

    var Permeate =
    /*#__PURE__*/
    function (_React$PureComponent) {
      _inherits(Permeate, _React$PureComponent);

      function Permeate() {
        var _this;

        _classCallCheck(this, Permeate);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(Permeate).call(this));
        _this.state = {};
        _this.subscriptionArr = [];
        _this.suspendedObservableKeys = Object.keys(observablesMap);
        _this._suspendedObservables = [];
        _this._innerObservableMaps = {};

        if (_this.suspendedObservableKeys.length > 0) {
          _this.suspendedObservableKeys.forEach(function (key) {
            _this._suspendedObservables.push(observablesMap[key]);
          });
        } else {
          throw new TypeError("\u65B9\u6CD5subscription()\u7684\u53C2\u6570observablesMap\u4E0D\u5141\u8BB8\u4F20\u4E00\u4E2A\u7A7A\u7684object");
        }

        _this.state = Object.assign({}, _this._innerObservableMaps, utils_js.isCorrectVal(options.defaultProps) ? options.defaultProps : {});
        return _this;
      }

      _createClass(Permeate, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          var _this2 = this;

          var obsArr = this._suspendedObservables,
              len = obsArr.length;

          var _loop = function _loop(i) {
            var subscription = obsArr[i].subscribe(function (data) {
              // const type = obsArr[i]["__type__"];
              // const pushHeaders = eventLog.pushHeadersMap[type];
              if (_this2.state[_this2.suspendedObservableKeys[i]] !== data) {
                // if (isCorrectVal(pushHeaders))  console.log(pushHeaders);
                _this2.setState(_defineProperty({}, _this2.suspendedObservableKeys[i], data));
              }
            });

            _this2.subscriptionArr.push(subscription);
          };

          for (var i = 0; i < len; i++) {
            _loop(i);
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.subscriptionArr.forEach(function (subscription) {
            subscription.unsubscribe();
          });
        }
      }, {
        key: "render",
        value: function render() {
          return React.createElement(Comp, _extends({}, this.props, this.state));
        }
      }]);

      return Permeate;
    }(React.PureComponent);

    Permeate.displayName = "Permeate(".concat(Comp.displayName || Comp.name || "Component", ")");
    return Permeate;
  };

  return handler;
};

module.exports = subscription;
