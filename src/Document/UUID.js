"use strict";
exports.__esModule = true;
exports.getUUID = void 0;
var uuid_1 = require("uuid");
/**
 * Convert a plain string to a UUID or create a new uuid
 */
var getUUID = function (uuidString) {
    if (uuidString === void 0) { uuidString = uuid_1.v4(); }
    return uuidString;
};
exports.getUUID = getUUID;
