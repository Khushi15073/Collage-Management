"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseCodes = void 0;
/**
 * Enum for HTTP response status codes.
 *
 * This enum defines commonly used HTTP status codes to standardize responses
 * and improve code readability across the application.
 */
var ResponseCodes;
(function (ResponseCodes) {
    // Success codes
    ResponseCodes[ResponseCodes["OK"] = 200] = "OK";
    ResponseCodes[ResponseCodes["CREATED"] = 201] = "CREATED";
    ResponseCodes[ResponseCodes["NO_CONTENT"] = 204] = "NO_CONTENT";
    ResponseCodes[ResponseCodes["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
    // Client error codes
    ResponseCodes[ResponseCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ResponseCodes[ResponseCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ResponseCodes[ResponseCodes["UNPROCESS_ABLE_ENTITY"] = 422] = "UNPROCESS_ABLE_ENTITY";
    ResponseCodes[ResponseCodes["FORBIDDEN"] = 403] = "FORBIDDEN";
    ResponseCodes[ResponseCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    ResponseCodes[ResponseCodes["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    ResponseCodes[ResponseCodes["CONFLICT"] = 409] = "CONFLICT";
    ResponseCodes[ResponseCodes["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    // Server error codes
    ResponseCodes[ResponseCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    ResponseCodes[ResponseCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    ResponseCodes[ResponseCodes["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    ResponseCodes[ResponseCodes["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    ResponseCodes[ResponseCodes["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT"; // Gateway Timeout
})(ResponseCodes || (exports.ResponseCodes = ResponseCodes = {}));
