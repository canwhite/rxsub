'use strict';

var rxjs = require('rxjs');

function StateSubject(value) {
  this.observerList = [];
  this.value = value;
}

StateSubject.prototype = Object.create(rxjs.Observable.create(function (observer) {
  if (typeof this.value !== "undefined") observer.next(this.value);
  this.observerList.push(observer);
}));

StateSubject.prototype.next = function (val) {
  this.value = val;
  this.observerList.forEach(function (observer) {
    observer.next(val);
  });
};

module.exports = StateSubject;
