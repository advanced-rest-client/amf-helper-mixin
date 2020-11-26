import { LitElement } from 'lit-element';
import { AmfHelperMixin } from '../amf-helper-mixin.js';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async function(compact, modelFile) {
  /* eslint-disable-next-line no-param-reassign */
  modelFile = modelFile || 'demo-api';
  const file = `/${  modelFile  }${compact ? '-compact' : ''  }.json`;
  /* eslint-disable-next-line no-restricted-globals */
  const url = `${location.protocol  }//${  location.host  }/base/test/${  file}`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
      } catch (ex) {
        reject(ex);
        return;
      }
      resolve(data);
    });
    xhr.addEventListener('error', () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};

AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint, operation);
  const opKey = helper._getAmfKey(helper.ns.w3.hydra.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, `${helper.ns.w3.hydra.core  }method`) === operation);
};
