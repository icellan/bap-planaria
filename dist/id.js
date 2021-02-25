"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.handleIDTransaction=exports.handleAliasTransaction=exports.wasIdValidForAddressAt=exports.getIdKeyForAddress=exports.getIdForAddress=void 0;var _regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")),_bsv=_interopRequireDefault(require("bsv")),_id=require("./schemas/id"),getIdForAddress=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",_id.ID.findOne({"addresses.address":b}));case 1:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.getIdForAddress=getIdForAddress;var getIdKeyForAddress=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){var c;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,getIdForAddress(b);case 2:return c=a.sent,a.abrupt("return",c?c._id:null);case 4:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.getIdKeyForAddress=getIdKeyForAddress;var wasIdValidForAddressAt=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b,c,d){var e,f,g,h;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(a.t1=d,a.t1){a.next=5;break}return a.next=4,getIdForAddress(b);case 4:a.t1=a.sent;case 5:if(a.t0=a.t1,a.t0){a.next=8;break}a.t0={addresses:[]};case 8:if(d=a.t0,!c){a.next=15;break}return e=d.addresses.find(function(c){return c.address===b}),f=d.addresses.find(function(b){return b.block>e.block}),g=e&&e.block<=c&&(!f||f.block>c),h=!c||c>=d.firstSeen,a.abrupt("return",h&&!!e&&g);case 15:return a.abrupt("return",b===d.currentAddress);case 16:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.wasIdValidForAddressAt=wasIdValidForAddressAt;var handleAliasTransaction=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){var c,d,e,f,g;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if("ALIAS"===b.type){a.next=2;break}return a.abrupt("return");case 2:return c=b.hash,d=b.sequence,e=b._id,a.next=7,_id.ID.findOne({_id:c});case 7:return f=a.sent,a.next=10,wasIdValidForAddressAt(b.signatureAddress,b.block,f);case 10:if(g=a.sent,!(f&&g)){a.next=14;break}return a.next=14,_id.ID.updateOne({_id:c},{$set:{identity:d,identityTxId:e}});case 14:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.handleAliasTransaction=handleAliasTransaction;var handleIDTransaction=function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b){var c,d,e,f,g,h;return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if("ID"===b.type){a.next=2;break}return a.abrupt("return");case 2:return c=b.hash,a.next=5,_id.ID.findOne({_id:c});case 5:if(d=a.sent,!d){a.next=23;break}if(e=d.addresses.find(function(a){return a.txId===b._id}),!e){a.next=17;break}if(!b.block){a.next=12;break}return a.next=12,_id.ID.updateOne({_id:b.hash,"addresses.txId":b._id},{$set:{"addresses.$.block":b.block}});case 12:if(d.firstSeen||d.addresses[0].txId!==b._id){a.next=15;break}return a.next=15,_id.ID.updateOne({_id:b.hash},{$set:{firstSeen:b.block}});case 15:a.next=21;break;case 17:if(f=d.addresses[d.addresses.length-1],f.address!==b.signatureAddress){a.next=21;break}return a.next=21,_id.ID.updateOne({_id:b.hash},{$set:{currentAddress:b.sequence},$addToSet:{addresses:{address:b.sequence,txId:b._id,block:b.block}}});case 21:a.next=30;break;case 23:if(g=!1,!(g&&(!b.block||675400<b.block))){a.next=28;break}if(h=_bsv["default"].encoding.Base58(_bsv["default"].crypto.Hash.ripemd160(Buffer.from(b.signatureAddress))).toString(),h===b.hash){a.next=28;break}throw new Error("Id key does not match root address");case 28:return a.next=30,_id.ID.insert({_id:b.hash,firstSeen:b.block,rootAddress:b.signatureAddress,currentAddress:b.sequence,addresses:[{address:b.sequence,txId:b._id,block:b.block}]});case 30:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}();exports.handleIDTransaction=handleIDTransaction;