# Depedencias instaladas

Decoradores de NEST 
```
npm install --save @nestjs/passport passport 
```
JWT (No lo hacemos de manera local, lo hacemos mediante JWT)
```
npm install --save @nestjs/jwt passport-jwt
npm install --save-dev @types/passport-jwt
```

## En los imports de auth.module.ts
Agregamos PassportModule de @nestjs/passport

## Configuración de estrategia
Definir una estrategia personalizada (por ejemplo, `jwt.strategy.ts`) y usar `PassportModule.registerAsync` si es necesario:

```typescript
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ ConfigModule],
      inject: [ConfigService],
      useFactory: ( configService : ConfigService ) => {
        return{
          secret: configService.get('JWT_SECRET'),
          signOptions:{
            expiresIn:'2h'
          }
        }
      }
    })
```
## ¿Cuándo usar `registerAsync`?
- Asegurarme que mis variables de entorno esten previamente configuradas antes de definirlas
- Si mi configuracion del modulo depende de algun servicio externo o endpoint o configuracion en la nube y se encesita esto antes de yo definirlo

## Strategies Personalizada
```javascript
jwt.strategy.ts
```
Definido en qué posición espero el JWT, y qué tipo de Token (En este caso en Auth como Bearer Token) y en la firma estará el id de mongo del user.

## Decorador Personalizado
## Guard Personalizado
Esto verifica el rol del usuario en una ruta y lo deja pasar si es válido
