"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.getBitbusBlockEvents=void 0;var _regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")),_nodeFetch=_interopRequireDefault(require("node-fetch")),_config=require("./config"),getBitbusBlockEvents=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){var c,d,e=arguments;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return c=1<e.length&&void 0!==e[1]?e[1]:"txo",c="bob"===c?"bob":"txo",a.next=4,(0,_nodeFetch["default"])("https://".concat(c,".bitbus.network/block"),{method:"post",headers:{"Content-type":"application/json; charset=utf-8",token:_config.TOKEN,format:"json"},body:JSON.stringify(b)});case 4:return d=a.sent,a.abrupt("return",d.json());case 6:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.getBitbusBlockEvents=getBitbusBlockEvents;