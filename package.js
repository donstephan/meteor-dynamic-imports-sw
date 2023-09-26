Package.describe({
  name: 'meteor-dynamic-imports-sw',
  version: '1.0.0',
  summary: 'Service worker for dynamic imports',
  git: 'https://github.com/donstephan/meteor-dynamic-imports-sw',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('2.6');
  api.use('ecmascript');
  api.use('webapp');
  api.mainModule('./client.js', 'client');
  api.mainModule('./server.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('meteor-dynamic-imports-sw');
  api.use("dynamic-import");
  api.addFiles("./client.test.js", "client");
  api.addFiles("./server.test.js", "server");
});
