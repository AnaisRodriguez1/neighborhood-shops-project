"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyToJSONTransform = applyToJSONTransform;
function applyToJSONTransform(schema) {
    schema.set('toJSON', {
        virtuals: true,
        versionKey: false,
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
        },
    });
}
//# sourceMappingURL=schema-transform.helper.js.map