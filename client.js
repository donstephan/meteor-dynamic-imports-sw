const DynamicImportsSw = {};

DynamicImportsSw.load = () => {
  return new Promise((resolve, reject) => {
    if (!navigator || !navigator.serviceWorker) {
      Meteor._debug("Service workers not supported.");
      resolve();
      return;
    }

    navigator.serviceWorker.register('/dynamic-imports-sw.js').then(() => {
      Meteor._debug('Service worker registered');
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
}

export default DynamicImportsSw;