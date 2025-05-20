"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleExceptions = handleExceptions;
const common_1 = require("@nestjs/common");
function handleExceptions(error, entityName = 'recurso', operation = 'procesar') {
    if (error.code === 11000) {
        throw new common_1.BadRequestException(`No se pudo ${operation} ${entityName}: ya existe un registro duplicado.`);
    }
    console.error(error);
    throw new common_1.InternalServerErrorException(`Ocurrió un error al ${operation} ${entityName}.`);
}
//# sourceMappingURL=exception-handler.helper.js.map