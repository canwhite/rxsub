'use strict';

var rxjs = require('rxjs');

var eventBus = new rxjs.Subject();

module.exports = eventBus;
