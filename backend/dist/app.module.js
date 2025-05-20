"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const products_module_1 = require("./products/products.module");
const shops_module_1 = require("./shops/shops.module");
const common_module_1 = require("./common/common.module");
const auth_module_1 = require("./auth/auth.module");
const seed_module_1 = require("./seed/seed.module");
require("dotenv/config");
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            mongoose_1.MongooseModule.forRoot(mongoUri, {
                onConnectionCreate: (connection) => {
                    connection.on('connected', () => console.log('connected'));
                    connection.on('open', () => console.log('open'));
                    connection.on('disconnected', () => console.log('disconnected'));
                    connection.on('reconnected', () => console.log('reconnected'));
                    connection.on('disconnecting', () => console.log('disconnecting'));
                    return connection;
                },
            }),
            products_module_1.ProductsModule,
            shops_module_1.ShopsModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            seed_module_1.SeedModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map