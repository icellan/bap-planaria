"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.indexBAPTransactionsStream=exports.indexBAPTransactions=exports.processBlockEvents=exports.parseBAPTransaction=exports.processBapTransaction=exports.parseOpReturn=exports.addBAPErrorTransaction=exports.getLastBlockIndex=exports.updateLastBlock=exports.getBitsocketQuery=exports.FIRST_BAP_BLOCK=void 0;var _defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty")),_regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")),_nodeFetch=_interopRequireDefault(require("node-fetch")),_eventStream=_interopRequireDefault(require("event-stream")),_config=require("./config"),_bap=require("./schemas/bap"),_errors=require("./schemas/errors"),_get=require("./get"),_aip=require("./aip"),_status=require("./status");function _createForOfIteratorHelper(a,b){var c;if("undefined"==typeof Symbol||null==a[Symbol.iterator]){if(Array.isArray(a)||(c=_unsupportedIterableToArray(a))||b&&a&&"number"==typeof a.length){c&&(a=c);var d=0,e=function(){};return{s:e,n:function n(){return d>=a.length?{done:!0}:{done:!1,value:a[d++]}},e:function e(a){throw a},f:e}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var f,g=!0,h=!1;return{s:function s(){c=a[Symbol.iterator]()},n:function n(){var a=c.next();return g=a.done,a},e:function e(a){h=!0,f=a},f:function f(){try{g||null==c["return"]||c["return"]()}finally{if(h)throw f}}}}function _unsupportedIterableToArray(a,b){if(a){if("string"==typeof a)return _arrayLikeToArray(a,b);var c=Object.prototype.toString.call(a).slice(8,-1);return"Object"===c&&a.constructor&&(c=a.constructor.name),"Map"===c||"Set"===c?Array.from(a):"Arguments"===c||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)?_arrayLikeToArray(a,b):void 0}}function _arrayLikeToArray(a,b){(null==b||b>a.length)&&(b=a.length);for(var c=0,d=Array(b);c<b;c++)d[c]=a[c];return d}function ownKeys(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?ownKeys(Object(b),!0).forEach(function(c){(0,_defineProperty2["default"])(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):ownKeys(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}var FIRST_BAP_BLOCK=59e4;exports.FIRST_BAP_BLOCK=590000;var getBitsocketQuery=function(){var a=!!(0<arguments.length&&void 0!==arguments[0])&&arguments[0],b={q:{find:{$or:[{"out.s1":_config.BAP_BITCOM_ADDRESS},{"out.s2":_config.BAP_BITCOM_ADDRESS}]},sort:{"blk.i":1},project:{blk:1,"tx.h":1,out:1}}};return a&&(b.q.find["blk.i"]={$gt:a}),b};exports.getBitsocketQuery=getBitsocketQuery;var updateLastBlock=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",(0,_status.updateStatusValue)("lastBlock",b));case 1:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.updateLastBlock=updateLastBlock;var getLastBlockIndex=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(){var b;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,(0,_status.getStatusValue)("lastBlock");case 2:return b=a.sent,a.abrupt("return",b?+b:FIRST_BAP_BLOCK);case 4:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.getLastBlockIndex=getLastBlockIndex;var addBAPErrorTransaction=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",_errors.Errors.updateOne({_id:b.txId},{$set:b},{upsert:!0}));case 1:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.addBAPErrorTransaction=addBAPErrorTransaction;var parseOpReturn=function(a){for(var b=a.len,c=[],d=0;d<b;d++)a["s".concat(d-3)]===_config.AIP_BITCOM_ADDRESS?c.push(a["b".concat(d)]):c.push(a["s".concat(d)]||a["o".concat(d)]||a["h".concat(d)]||a["b".concat(d)]);"OP_0"===c[0]&&c.shift(),c.shift();for(var e=(0,_defineProperty2["default"])({},c[0],[]),f=c[0],g=0;g<c.length;g++)"|"===c[g]?(f=c[g+1],f===_config.BAP_BITCOM_ADDRESS?("DATA"===c[g+2]&&c[g+3]===e[_config.BAP_BITCOM_ADDRESS][2]&&e[_config.BAP_BITCOM_ADDRESS].push(c[g+4]),g+=4):e[f]=[]):e[f].push(c[g]);return e};exports.parseOpReturn=parseOpReturn;var processBapTransaction=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){var c;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(b){a.next=2;break}return a.abrupt("return");case 2:return c=_objectSpread({_id:b.txId},b),delete c.txId,c.processed=!1,a.next=7,_bap.BAP.updateOne({_id:c._id},{$set:c},{upsert:!0})["catch"](function(a){console.error(a)});case 7:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.processBapTransaction=processBapTransaction;var parseBAPTransaction=function(a){var b=parseOpReturn(a);if(!b||!b[_config.BAP_BITCOM_ADDRESS]||b[_config.BAP_BITCOM_ADDRESS][0]!==_config.BAP_BITCOM_ADDRESS||!b[_config.BAP_BITCOM_ADDRESS][1]||!b[_config.BAP_BITCOM_ADDRESS][2]||!b[_config.BAP_BITCOM_ADDRESS][3])return!1;var c=(0,_aip.validAIPSignature)(b);if(!c)return!1;var d={type:b[_config.BAP_BITCOM_ADDRESS][1],hash:b[_config.BAP_BITCOM_ADDRESS][2],sequence:b[_config.BAP_BITCOM_ADDRESS][3],signatureAddress:b[_config.AIP_BITCOM_ADDRESS][2]};return b[_config.BAP_BITCOM_ADDRESS][4]&&(d.data=b[_config.BAP_BITCOM_ADDRESS][4]),d};exports.parseBAPTransaction=parseBAPTransaction;var processBlockEvents=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){var c,d,e,f,g,h,i;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(c=b.tx.h,d=b.blk&&b.blk.i,e=b.timestamp||+new Date,!b.out){a.next=47;break}f=_createForOfIteratorHelper(b.out),a.prev=5,f.s();case 7:if((g=f.n()).done){a.next=39;break}if(h=g.value,h.s1!==_config.BAP_BITCOM_ADDRESS&&h.s2!==_config.BAP_BITCOM_ADDRESS){a.next=37;break}if(a.prev=10,console.log("got BAP transaction",c,d||"mempool"),i=parseBAPTransaction(h),!i){a.next=24;break}return i.txId=c,i.block=d,i.timestamp=e,a.next=19,processBapTransaction(i);case 19:if(!i.block){a.next=22;break}return a.next=22,updateLastBlock(i.block);case 22:a.next=28;break;case 24:return h.txId=c,h.block=d,a.next=28,addBAPErrorTransaction(h);case 28:a.next=37;break;case 30:return a.prev=30,a.t0=a["catch"](10),h.txId=c,h.block=d,h.error=JSON.stringify(a.t0,Object.getOwnPropertyNames(a.t0)),a.next=37,addBAPErrorTransaction(h);case 37:a.next=7;break;case 39:a.next=44;break;case 41:a.prev=41,a.t1=a["catch"](5),f.e(a.t1);case 44:return a.prev=44,f.f(),a.finish(44);case 47:case"end":return a.stop();}},a,null,[[5,41,44,47],[10,30]])}));return function(){return a.apply(this,arguments)}}();exports.processBlockEvents=processBlockEvents;var indexBAPTransactions=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(){var b,c,d,e;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,getLastBlockIndex();case 2:return b=a.sent,c=getBitsocketQuery(b),a.next=6,(0,_get.getBitbusBlockEvents)(c);case 6:d=a.sent,e=0;case 8:if(!(e<d.length)){a.next=14;break}return a.next=11,processBlockEvents(d[e]);case 11:e++,a.next=8;break;case 14:return a.abrupt("return",!0);case 15:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.indexBAPTransactions=indexBAPTransactions;var indexBAPTransactionsStream=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(){var b,c;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,getLastBlockIndex();case 2:return b=a.sent,_config.DEBUG&&console.log("POST https://txo.bitbus.network/block"),a.next=6,(0,_nodeFetch["default"])("https://txo.bitbus.network/block",{method:"post",headers:{"Content-type":"application/json; charset=utf-8",token:_config.TOKEN,from:FIRST_BAP_BLOCK},body:JSON.stringify(getBitsocketQuery(b))});case 6:return c=a.sent,a.abrupt("return",new Promise(function(a,b){_config.DEBUG&&console.log("PROCESSING BODY"),c.body.on("sfinish",function(){_config.DEBUG&&console.log("FINISHED BODY"),a()}),c.body.on("end",function(){_config.DEBUG&&console.log("END BODY"),a()}),c.body.on("error",function(a){_config.DEBUG&&console.error(a),b(a)}),c.body.pipe(_eventStream["default"].split(),{end:!1}).pipe(_eventStream["default"].mapSync(function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){var c;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(!b){a.next=4;break}return c=JSON.parse(b),a.next=4,processBlockEvents(c);case 4:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}()),{end:!1})}));case 8:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.indexBAPTransactionsStream=indexBAPTransactionsStream;