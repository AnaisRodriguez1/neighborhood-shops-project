import { Schema } from "mongoose";
/**
 * Aplica una transformación estándar para todos los esquemas:
 * - Remueve el campo _id y lo reemplaza por id
 * - Elimina __v (versionKey)
 * - Permite que los virtuals se incluyan en la respuesta JSON
 */
export function applyToJSONTransform(schema: Schema) {
    schema.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    });
  }