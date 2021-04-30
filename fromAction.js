'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var utils_js = require('./utils.js');
var store = _interopDefault(require('./store.js'));
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var pipe = require('rxjs/internal/util/pipe');
var eventBus = _interopDefault(require('./eventBus.js'));

var eventLog = store.eventLog;

var fromAction = function fromAction(type, options) {
  if (!(typeof type === "string")) {
    throw new Error("action's type must be string");
  }

  var _options = {
    useCache: false,
    cacheType: "eventCache" // eventCache itemCache

  };
  options = Object.assign({}, _options, options);
  var event$ = eventBus.pipe(operators.pluck(type), operators.filter(function (event) {
    if (!utils_js.isCorrectVal(event)) return false;
    if (!utils_js.isCorrectVal(event.payload)) event.payload = {};
    if (!utils_js.isCorrectVal(event.options)) event.options = {};

    if (!utils_js.isCorrectVal(eventLog.pushHeadersMap[event.type])) {
      eventLog.pushHeadersMap[event.type] = {
        event: event,
        lastModifyId: new Date().getTime()
      };
      return true;
    }

    var pushHeaders = eventLog.pushHeadersMap[event.type];
    var lastEvent = pushHeaders.event; // 判断是否要更新lastModifyId

    if (!options.useCache || JSON.stringify(lastEvent.payload) !== JSON.stringify(event.payload) || JSON.stringify(lastEvent.options) !== JSON.stringify(event.options)) {
      eventLog.pushHeadersMap[event.type]["lastModifyId"] = new Date().getTime();
    }

    pushHeaders.event = event;
    return true;
  }));
  var operations = [];
  var _subscription = {
    unsubscribe: function unsubscribe() {}
  };

  function generateObs(obs$) {
    _subscription.unsubscribe();

    var obs$$ = new rxjs.Subject();
    obs$$.__type__ = type;

    var _obs$ = obs$.pipe(operators.switchMap(function (event) {
      var pushHeaders = eventLog.pushHeadersMap[event.type];
      var hasModified = obs$$.lastModifyId !== pushHeaders.lastModifyId; // 判断是否有缓存数据

      var cacheData;

      if (options.useCache && !hasModified) {
        switch (options.cacheType) {
          case "eventCache":
            cacheData = eventLog.dataMap[event.type];

            if (!utils_js.isCorrectVal(cacheData)) {
              hasModified = true;
              pushHeaders.lastModifyId = new Date().getTime();
            }

            break;
        }
      }

      event.hasModified = hasModified;
      return hasModified ? operations.length === 0 ? rxjs.of(event) : pipe.pipeFromArray(operations)(rxjs.of(event)) : rxjs.of(cacheData);
    }), operators.filter(function (data) {
      var canPass = !(data === null || typeof data === "undefined");
      var pushHeaders = eventLog.pushHeadersMap[type];
      var event = pushHeaders.event;
      var hasModified = event.hasModified;

      if (canPass) {
        obs$$.lastModifyId = pushHeaders.lastModifyId;
      } // 缓存数据


      if (canPass && hasModified) {
        switch (options.cacheType) {
          case "eventCache":
            eventLog.dataMap[type] = data;
            break;
        }
      }

      return canPass;
    }));

    _subscription = _obs$.subscribe(obs$$);
    return obs$$;
  }

  var processEvent$ = generateObs(event$);

  processEvent$.pipe = function () {
    for (var i = 0; i < arguments.length; i++) {
      operations.push(arguments[i]);
    }

    return generateObs(event$);
  };

  return processEvent$;
};

module.exports = fromAction;
