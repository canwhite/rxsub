'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _defineProperty = _interopDefault(require('@babel/runtime/helpers/defineProperty'));

var Store = function Store() {
  _classCallCheck(this, Store);

  _defineProperty(this, "stateMap", {});

  _defineProperty(this, "eventLog", {
    dataMap: {},
    pushHeadersMap: {}
  });
};

var store = new Store();

module.exports = store;
