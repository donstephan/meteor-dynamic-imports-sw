import { Tinytest } from "meteor/tinytest";
import { WebApp } from "meteor/webapp";
import DynamicImportsSw from "./server";

WebApp.connectHandlers.use('/hello', (req, res, next) => {
  res.writeHead(200);
  res.end("world");
});

Tinytest.addAsync('configure', (test, onComplete) => {
  DynamicImportsSw.configure({
    cacheKey: "test"
  });

  onComplete()
});