"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.dbName=exports.mongoUrl=exports.TOKEN=exports.AIP_BITCOM_ADDRESS=exports.BAP_BITCOM_ADDRESS=exports.DEBUG=void 0;var _config=_interopRequireDefault(require("../config.json")),DEBUG=!!(process.env.DEBUG||_config["default"].DEBUG||!1);exports.DEBUG=DEBUG;var BAP_BITCOM_ADDRESS="1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT";exports.BAP_BITCOM_ADDRESS="1BAPSuaPnfGnSBM3GLV9yhxUdYe4vGbdMT";var AIP_BITCOM_ADDRESS="15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva";exports.AIP_BITCOM_ADDRESS="15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva";var TOKEN=process.env.BAP_PLANARIA_TOKEN||_config["default"].token;exports.TOKEN=TOKEN,TOKEN||(console.error("No Planaria token defined in config.json (https://token.planaria.network/)"),process.exit(-1));var mongoUrl=process.env.MONGO_URL||_config["default"].mongoUrl;exports.mongoUrl=mongoUrl,mongoUrl||(console.error("No MongoDB connection defined in ENV or config.json"),process.exit(-1));var dbName=process.env.BAP_DB_NAME||_config["default"].dbName||"bap-planaria";exports.dbName=dbName;