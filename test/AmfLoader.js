import { AmfHelperMixin } from '../amf-helper-mixin.js';

/** @typedef {import('../src/amf').EndPoint} EndPoint */
/** @typedef {import('../src/amf').Operation} Operation */
/** @typedef {import('../src/amf').Server} Server */
/** @typedef {import('../src/amf').AmfDocument} AmfDocument */
/** @typedef {import('../src/amf').Shape} Shape */
/** @typedef {import('../src/amf').Request} Request */
/** @typedef {import('../src/amf').Response} Response */
/** @typedef {import('../src/amf').Payload} Payload */
/** @typedef {import('../src/amf').SecurityRequirement} SecurityRequirement */

export class AmfHelper extends AmfHelperMixin(Object) {
  /**
   * 
   * @param {boolean} compact 
   * @param {string=} fileName 
   * @returns {Promise<AmfDocument>}
   */
  async load(compact, fileName = 'demo-api') {
    const suffix = compact ? '-compact' : '';
    const file = `${fileName}${suffix}.json`;
    const url = `${window.location.protocol}//${window.location.host}/base/apis/${file}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Unable to download API data model');
    }
    return response.json();
  }

  /**
   * @param {any} model 
   * @param {string=} endpointId 
   * @param {string=} methodId 
   * @returns {Server[]}
   */
  lookupServers(model, endpointId, methodId) {
    this.amf = model;
    return this._getServers({ endpointId, methodId });
  }

  /**
   * @param {any} model
   * @param {string} path
   * @return {EndPoint}
   */
  lookupEndpoint(model, path) {
    this.amf = model;
    const webApi = this._computeApi(model);
    return this._computeEndpointByPath(webApi, path);
  }

  /**
   * @param {Object} model
   * @param {string} path
   * @param {string} operation
   * @return {Operation}
   */
  lookupOperation(model, path, operation) {
    const endPoint = this.lookupEndpoint(model, path);
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = this._ensureArray(endPoint[opKey]);
    return ops.find((item) => this._getValue(item, this.ns.aml.vocabularies.apiContract.method) === operation);
  }

  /**
   * @param {Object} model
   * @param {string} path
   * @param {string} operation
   * @return {Request}
   */
  lookupExpects(model, path, operation) {
    const op = this.lookupOperation(model, path, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${path} and method ${operation}`);
    }
    let expects = op[this._getAmfKey(this.ns.aml.vocabularies.apiContract.expects)];
    if (!expects) {
      throw new Error(`Operation has no "expects" value.`);
    }
    if (Array.isArray(expects)) {
      [expects] = expects;
    }
    return expects;
  }

  /**
   * @param {Object} model
   * @param {string} path
   * @param {string} operation
   * @return {Response[]}
   */
  lookupReturns(model, path, operation) {
    const op = this.lookupOperation(model, path, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${path} and method ${operation}`);
    }
    let returns = op[this._getAmfKey(this.ns.aml.vocabularies.apiContract.returns)];
    if (!returns) {
      throw new Error(`Operation has no "returns" value.`);
    }
    if (!Array.isArray(returns)) {
      returns = [returns];
    }
    return returns;
  }

  /**
   * Lookups a shape object from the declares array
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {Shape}
   */
  lookupDeclaredShape(model, name) {
    this.amf = model;
    const items = this._computeDeclares(model);
    return items.find((item) => {
      const typed = /** @type Shape */ (item);
      const objectName = this._getValue(typed, this.ns.w3.shacl.name);
      return objectName === name;
    });
  }

  /**
   * @param {Object} model
   * @param {string} path
   * @param {string} operation
   * @return {SecurityRequirement[]}
   */
  lookupOperationSecurity(model, path, operation) {
    const op = this.lookupOperation(model, path, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${path} and method ${operation}`);
    }
    let security = op[this._getAmfKey(this.ns.aml.vocabularies.security.security)];
    if (!security) {
      throw new Error(`Operation has no "security" value.`);
    }
    if (!Array.isArray(security)) {
      security = [security];
    }
    return security;
  }

  /**
   * @param {Object} model
   * @param {string} path
   * @param {string} operation
   * @return {Payload[]}
   */
  lookupRequestPayloads(model, path, operation) {
    const request = this.lookupExpects(model, path, operation);
    const payload = this._computePayload(request);
    if (!payload || !payload.length) {
      throw new Error(`Operation ${operation} of endpoint ${payload} has no request payload.`);
    }
    return payload;
  }

  /**
   * @param {Object} model
   * @param {string} path
   * @param {string} operation
   * @param {string} mime
   * @return {Payload}
   */
  lookupRequestPayload(model, path, operation, mime) {
    const payloads = this.lookupRequestPayloads(model, path, operation);
    const payload = payloads.find(i => this._getValue(i, this.ns.aml.vocabularies.core.mediaType) === mime);
    if (!payload) {
      throw new Error(`Operation ${operation} of endpoint ${payload} has no request payload for ${mime}.`);
    }
    return payload;
  }
}

export const AmfLoader = new AmfHelper();
