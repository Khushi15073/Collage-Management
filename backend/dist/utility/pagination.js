"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationQuery = parsePaginationQuery;
const errorClass_1 = require("./errorClass");
function parsePaginationQuery(query, defaults = {}) {
    var _a, _b, _c, _d, _e;
    const defaultPage = (_a = defaults.page) !== null && _a !== void 0 ? _a : 1;
    const defaultLimit = (_b = defaults.limit) !== null && _b !== void 0 ? _b : 10;
    const maxLimit = (_c = defaults.maxLimit) !== null && _c !== void 0 ? _c : 100;
    const page = Number((_d = query.page) !== null && _d !== void 0 ? _d : defaultPage);
    const limit = Number((_e = query.limit) !== null && _e !== void 0 ? _e : defaultLimit);
    if (!Number.isInteger(page) || page < 1) {
        throw errorClass_1.AppError.badRequest("Page must be a positive integer");
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
        throw errorClass_1.AppError.badRequest(`Limit must be an integer between 1 and ${maxLimit}`);
    }
    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
}
