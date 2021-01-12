"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.BAP=void 0;var _regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")),_simplSchema=_interopRequireDefault(require("simpl-schema")),_collection=require("../lib/collection"),_attest=require("../attest"),_id=require("../id"),BAP=new _collection.Collection("bap",new _simplSchema["default"]({block:{type:_simplSchema["default"].Integer,label:"Block number this transaction was mined into - null if still in mempool",optional:!0},type:{type:String,label:"Type of BAP transaction (ID, ATTEST, DATA, ALIAS, ...)",optional:!1},hash:{type:String,label:"ID key or attestation hash",optional:!1},sequence:{type:String,label:"Sequences number of the attestation, or the address of the ID",optional:!1},signatureAddress:{type:String,label:"Bitcoin address this bap transaction was signed with",optional:!1},data:{type:String,label:"Optional data that was appended to this BAP transaction",optional:!0},timestamp:{type:_simplSchema["default"].Integer,label:"timestamp the transaction was broadcast - if available",optional:!0},processed:{type:Boolean}}));exports.BAP=BAP,BAP.after("updateOne",function(){var a=(0,_asyncToGenerator2["default"])(_regenerator["default"].mark(function a(b,c,d){return _regenerator["default"].wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(!(!0===d.upsert&&b.type&&b.hash&&b.sequence&&b.signatureAddress)){a.next=26;break}if("ATTEST"!==b.type){a.next=6;break}return a.next=4,(0,_attest.handleAttestationTransaction)(b);case 4:a.next=24;break;case 6:if("ID"!==b.type){a.next=11;break}return a.next=9,(0,_id.handleIDTransaction)(b);case 9:a.next=24;break;case 11:if("REVOKE"!==b.type){a.next=16;break}return a.next=14,(0,_attest.handleRevokeTransaction)(b);case 14:a.next=24;break;case 16:if("ALIAS"!==b.type){a.next=21;break}return a.next=19,(0,_id.handleAliasTransaction)(b);case 19:a.next=24;break;case 21:if("DATA"!==b.type){a.next=24;break}return a.next=24,(0,_attest.handleDataTransaction)(b);case 24:return a.next=26,BAP.update({_id:b._id},{$set:{processed:!0}});case 26:case"end":return a.stop();}},a)}));return function(){return a.apply(this,arguments)}}());