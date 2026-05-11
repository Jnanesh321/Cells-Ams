"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function verifyPassword(plaintext, passwordHash) {
    return bcrypt_1.default.compare(plaintext, passwordHash);
}
//# sourceMappingURL=password.js.map