"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    schema: "./src/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
};
