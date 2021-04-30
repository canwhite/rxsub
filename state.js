'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));
var _defineProperty = _interopDefault(require('@babel/runtime/helpers/defineProperty'));
var utils_js = require('./utils.js');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var eventBus = _interopDefault(require('./eventBus.js'));
var fromAction = _interopDefault(require('./fromAction.js'));
var StateSubject = _interopDefault(require('./stateSubject.js'));
var store = _interopDefault(require('./store.js'));

var stateMap = store.stateMap;

var StateMachine =
/*#__PURE__*/
function () {
  function StateMachine(state$, options) {
    var _this = this;

    _classCallCheck(this, StateMachine);

    _defineProperty(this, "value", null);

    this.name = options.name;

    if (utils_js.isCorrectVal(stateMap[this.name])) {
      throw new Error("\u540D\u4E3A'".concat(this.name, "'\u7684\u72B6\u6001\u6570\u636E\u5DF2\u5B58\u5728\uFF0C\u4E0D\u80FD\u91CD\u590D\u521B\u5EFA\uFF01"));
    }

    this.defaultValue = options.defaultValue;
    this.value = options.defaultValue;
    this.initial$ = rxjs.isObservable(options.initial) ? options.initial : rxjs.of(this.value);

    if (utils_js.isCorrectVal(options.producer)) {
      this._producer = options.producer;

      var observableFactory = function observableFactory(action) {
        if (!utils_js.isObject(action)) {
          return rxjs.of(action);
        } else if (utils_js.isObject(action) && utils_js.isCorrectVal(action.type)) {
          return rxjs.defer(function () {
            var _result = action.result;
            return rxjs.isObservable(_result) ? _result : rxjs.of(_result);
          });
        }
      };

      this.subscription = rxjs.merge(this.initial$, fromAction(this.name)).pipe(operators.switchMap(observableFactory)).subscribe(function (val) {
        _this.value = val;
        state$.next(val);
      }, function (err) {
        return state$.error(err);
      });
    } else {
      this.initial$.subscribe(function (val) {
        _this.value = val;
        state$.next(val);
      }, function (err) {
        return state$.error(err);
      });
    }
  }

  _createClass(StateMachine, [{
    key: "producer",
    value: function producer(action) {
      var _this2 = this;

      this._producer(function (result) {
        eventBus.next(_defineProperty({}, _this2.name, Object.assign({}, action, {
          type: _this2.name,
          result: result
        })));
      }, this.value, action);
    }
  }]);

  return StateMachine;
}();

function state(options) {
  var state$ = new StateSubject();
  var stateMachine = new StateMachine(state$, options);
  stateMap[options.name] = stateMachine;
  return state$;
}

module.exports = state;
