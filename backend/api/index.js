const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const express = require('express');

let server;  // cache the server between invocations

const bootstrap = async () => {
  const app = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));
  nestApp.setGlobalPrefix('api');         // opcional, si quieres prefijo
  await nestApp.init();
  return app;
};

module.exports = serverless(async (req, res) => {
  if (!server) {
    const app = await bootstrap();
    server = serverless(app);
  }
  return server(req, res);
});
