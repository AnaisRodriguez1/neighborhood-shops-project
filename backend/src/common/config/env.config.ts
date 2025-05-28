
export const EnvConfiguration = () => ({
    env: process.env.NODE_ENV || 'development',
    mongodb: process.env.MONGODB_URI,
    port: process.env.PORT || 3001,
    defaultLimit: process.env.DEFAULT_LIMIT || 7,
    defaultOffset: process.env.DEFAULT_OFFSET || 0,
    jwtSecret: process.env.JWT_SECRET || 'fallback-jwt-secret-for-development',
});