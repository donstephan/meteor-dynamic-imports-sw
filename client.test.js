import { Tinytest } from "meteor/tinytest";
import DynamicImportsSw from "./client";

Tinytest.addAsync('load', (test, onComplete) => {
  DynamicImportsSw.load().then(() => {
    onComplete()
  }).catch((e) => {
    test.exception(e);
  })
});

Tinytest.addAsync('test webapp', (test, onComplete) => {
  fetch("/hello").then((res) => {
    onComplete();
  }).catch((e) => {
    test.exception(e);
  })
});

Tinytest.addAsync('load echo', (test, onComplete) => {
  import("./imports.test/echo").then((module) => {
    let res = module.default("test")
    test.equal(res, "test");
    onComplete();
  }).catch((e) => {
    test.exception(e);
  });
});