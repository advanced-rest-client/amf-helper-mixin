export const AmfLoader = {};
AmfLoader.load = async function(opts) {
  opts = opts || {};
  const file = opts.isCompact ? 'demo-api-compact.json' : 'demo-api.json';
  const url = location.protocol + '//' + location.host + '/test/'+ file;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
      } catch (e) {
        reject(e);
        return;
      }
      resolve(data);
    });
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};
