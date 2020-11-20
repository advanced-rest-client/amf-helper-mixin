/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { ns } from './Namespace.js';

/** @typedef {import('./Namespace').ns} Namespace */

/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */

/**
 * Common functions used by AMF components to compute AMF values.
 *
 * ## Updating API's base URI
 *
 * (Only applies when using `_computeUri()` function)
 *
 * By default the component render the documentation as it is defined
 * in the AMF model. Sometimes, however, you may need to replace the base URI
 * of the API with something else. It is useful when the API does not
 * have base URI property defined (therefore this component render relative
 * paths instead of URIs) or when you want to manage different environments.
 *
 * To update base URI value update the `baseUri` property.
 *
 * When the component constructs the final URI for the endpoint it does the following:
 * - if `baseUri` is set it uses this value as a base uri for the endpoint
 * - else if `amf` is set then it computes base uri value from main
 * model document
 * Then it concatenates computed base URI with `endpoint`'s path property.
 *
 * @param {*} base
 * @return {*}
 * @mixin
 */
export const AmfHelperMixin = (base) => class extends base {
  static get properties() {
    return {
      /**
       * Generated AMF json/ld model form the API spec.
       * The element assumes the object of the first array item to be a
       * type of `"http://raml.org/vocabularies/document#Document`
       * on AMF vocabulary.
       *
       * It is only usefult for the element to resolve references.
       *
       * @type {Object|Array<Object>}
       */
      amf: { type: Object }
    };
  }

  /**
   * A namespace for AMF model.
   * @return {Namespace}
   */
  get ns() {
    return ns;
  }

  get amf() {
    return this._amf;
  }

  set amf(value) {
    const old = this._amf;
    if (old === value) {
      return;
    }
    // Cached keys cannot be static as this element can be using in the sane
    // document with different AMF models
    this.__cachedKeys = {};
    this._amf = value;
    this.__amfChanged(value);
    if (this.requestUpdate) {
      this.requestUpdate('amf', old);
    }
  }

  /**
   * This is an abstract method to be implemented by the components.
   * If, instead, the component uses `amf` setter you must use `super.amf` to
   * set the value.
   * @param {Array|Object} amf Current AMF model. Can be undefined.
   * @abstract
   */
  /* eslint-disable-next-line no-unused-vars */
  __amfChanged(amf) {}

  /**
   * Returns compact model key for given value.
   * @param {string} property AMF orioginal property
   * @return {string} Compact model property name or the same value if
   * value not found in the context.
   */
  _getAmfKey(property) {
    if (!property) {
      return undefined;
    }
    let {amf} = this;
    if (!amf) {
      return property;
    }
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    if (!this.__cachedKeys) {
      this.__cachedKeys = {};
    }
    const ctx = amf['@context'];
    if (!ctx || !property) {
      return property;
    }
    const cache = this.__cachedKeys;
    if (property in cache) {
      return cache[property];
    }
    /* eslint-disable-next-line no-param-reassign */
    property = String(property);
    const hashIndex = property.indexOf('#');
    const hashProperty = property.substr(0, hashIndex + 1);
    const keys = Object.keys(ctx);
    for (let i = 0, len = keys.length; i < len; i++) {
      const k = keys[i];
      if (ctx[k] === property) {
        cache[property] = k;
        return k;
      } if (hashIndex === -1 && property.indexOf(ctx[k]) === 0) {
        const result = property.replace(ctx[k], `${k  }:`);
        cache[property] = result;
        return result;
      } if (ctx[k] === hashProperty) {
        const result = `${k  }:${  property.substr(hashIndex + 1)}`;
        cache[property] = result;
        return result;
      }
    }
    return property;
  }

  /**
   * Ensures that the model is AMF object.
   *
   * @param {Object|Array} amf AMF json/ld model
   * @return {Object|undefined} API spec
   */
  _ensureAmfModel(amf) {
    if (!amf) {
      return undefined;
    }
    if (Array.isArray(amf)) {
      /* eslint-disable-next-line no-param-reassign */
      [amf] = amf;
    }
    if (this._hasType(amf, ns.aml.vocabularies.document.Document)) {
      return amf;
    }
    return undefined;
  }

  /**
   * Ensures that the value is an array.
   * It returns undefined when there's no value.
   * It returns the same array if the value is already an array.
   * It returns new array of the item is not an array.
   *
   * @param {Array|any} value An item to test
   * @return {Array|undefined}
   */
  _ensureArray(value) {
    if (!value) {
      return undefined;
    }
    if (value instanceof Array) {
      return value;
    }
    return [value];
  }

  /**
   * Gets a signle scalar value from a model.
   * @param {Object} model Amf model to extract the value from.
   * @param {string} key Model key to search for the value
   * @return {string|number|boolean|undefined|null} Value for key
   */
  _getValue(model, key) {
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    let data = model && model[key];
    if (!data) {
      // This includes "undefined", "false", "null" and "0"
      return data;
    }
    if (Array.isArray(data)) {
      /* eslint-disable-next-line no-param-reassign */
      [data] = data;
    }
    if (!data) {
      return undefined;
    }
    const type = typeof data;
    if (['string', 'number', 'boolean', 'undefined'].indexOf(type) !== -1) {
      return data;
    }
    return data['@value'];
  }

  /**
   * Gets values from a model as an array of `@value` properties.
   * @param {Object} model Amf model to extract the value from.
   * @param {string} key Model key to search for the value
   * @return {Array<string|number|boolean|null>|undefined} Value for key
   */
  _getValueArray(model, key) {
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    const data = model && this._ensureArray(model[key]);
    if (!data || !(data instanceof Array)) {
      return undefined;
    }
    return data.map((item) => item['@value'] || item);
  }

  /**
   * Checks if a model has a type.
   * @param {Object} model Model to test
   * @param {string} type Type name
   * @return {boolean} True if model has a type.
   */
  _hasType(model, type) {
    const types = this._ensureArray(model && model['@type']);
    if (!types || !types.length) {
      return false;
    }
    const key = this._getAmfKey(type);
    for (let i = 0; i < types.length; i++) {
      if (types[i] === key) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a shape has a property.
   * @param {Object} shape The shape to test
   * @param {string} key Property name to test
   * @return {boolean}
   */
  _hasProperty(shape, key) {
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    return !!(shape && key && key in shape);
  }

  /**
   * Computes array value of a property in a model (shape).
   *
   * @param {Object} shape AMF shape object
   * @param {string} key Property name
   * @return {Array<string|number|boolean|null|Object>|undefined}
   */
  _computePropertyArray(shape, key) {
    if (!shape) {
      return undefined;
    }
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    const data = this._ensureArray(shape && shape[key]);
    if (!data || !(data instanceof Array)) {
      return undefined;
    }
    return data;
  }

  /**
   * Computes a value of a property in a model (shape).
   * It takes first value of a property, if exists.
   *
   * @param {Object} shape AMF shape object
   * @param {string} key Property name
   * @return {string|number|boolean|null|Object|undefined}
   */
  _computePropertyObject(shape, key) {
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    const data = this._computePropertyArray(shape, key);
    return data && data[0];
  }

  /**
   * Tests if a passed argumet exists.
   *
   * @param {string|Object|number} value A value to test
   * @return {boolean}
   */
  _computeHasStringValue(value) {
    return !!value || value === 0;
  }

  /**
   * Computes if passed argument is an array and has a value.
   * It does not check for type or value of the array items.
   * @param {Array} value Value to test
   * @return {boolean}
   */
  _computeHasArrayValue(value) {
    return !!(value instanceof Array && value.length);
  }

  /**
   * Computes description for a shape.
   * @param {Object} shape AMF shape
   * @return {string} Description value.
   */
  _computeDescription(shape) {
    return /** @type string */ (this._getValue(shape, this.ns.schema.desc));
  }

  /**
   * Computes a list of headers
   * @param {Object} shape
   * @return {Array<Object>|undefined}
   */
  _computeHeaders(shape) {
    return (this._computePropertyArray(shape, this.ns.aml.vocabularies.apiContract.header));
  }

  /**
   * Computes a list of query parameters
   * @param {Object} shape
   * @return {Array<Object>|undefined}
   */
  _computeQueryParameters(shape) {
    return this._computePropertyArray(shape, this.ns.aml.vocabularies.apiContract.parameter);
  }

  /**
   * In OAS URI parmaeters can be defined on an operation level under `uriParameter` proeprty.
   * Normally `_computeQueryParameters()` function would be used to extract parameters from an endpoint.
   * This is a fallback option to test when an API is OAS.
   * @param {Object} shape Method or Expects model
   * @return {Array<Object>}
   */
  _computeUriParameters(shape) {
    if (!shape) {
      return undefined;
    }
    const operationKey = this.ns.aml.vocabularies.apiContract.Operation;
    const parameterKey = this.ns.aml.vocabularies.apiContract.uriParameter;
    if (this._hasType(shape, operationKey)) {
      /* eslint-disable-next-line no-param-reassign */
      shape = this._computeExpects(shape);
    }
    return this._computePropertyArray(shape, parameterKey);
  }

  /**
   * Computes a list of responses
   * @param {Object} shape
   * @return {Array<Object>|undefined}
   */
  _computeResponses(shape) {
    return this._computePropertyArray(shape, this.ns.aml.vocabularies.apiContract.response);
  }

  /**
   * Computes value for `serverVariables` property.
   *
   * @param {Object} server AMF API model for Server.
   * @return {Array<Object>|undefined} Variables if defined.
   */
  _computeServerVariables(server) {
    return this._computePropertyArray(server, this.ns.aml.vocabularies.apiContract.variable);
  }

  /**
   * Computes value for `endpointVariables` property.
   *
   * @param {Object} endpoint Endpoint model
   * @param {Object=} method Optional method to be used to llokup the parameters from
   * This is used for OAS model which can defined path parameters on a method level.
   * @return {Array<Object>|undefined} Parameters if defined.
   */
  _computeEndpointVariables(endpoint, method) {
    let result = this._computeQueryParameters(endpoint);
    if (!result && method) {
      result = this._computeUriParameters(method);
    }
    return result;
  }

  /**
   * Computes value for the `payload` property
   *
   * @param {Object} expects Current value of `expects` property.
   * @return {Array<Object>|undefined} Payload model if defined.
   */
  _computePayload(expects) {
    return this._computePropertyArray(expects, this.ns.aml.vocabularies.apiContract.payload);
  }

  /**
   * Computes value for `returns` property
   *
   * @param {Object} method AMF `supportedOperation` model
   * @return {Array<Object>|undefined}
   */
  _computeReturns(method) {
    return this._computePropertyArray(method, this.ns.aml.vocabularies.apiContract.returns);
  }

  /**
   * Computes value for `security` property
   *
   * @param {Object} method AMF `supportedOperation` model
   * @return {Array<Object>|undefined}
   */
  _computeSecurity(method) {
    return this._computePropertyArray(method, this.ns.aml.vocabularies.security.security);
  }

  /**
   * Computes value for `hasCustomProperties` property.
   *
   * @param {Object} shape AMF `supportedOperation` model
   * @return {boolean}
   */
  _computeHasCustomProperties(shape) {
    return this._hasProperty(shape, this.ns.aml.vocabularies.document.customDomainProperties);
  }

  /**
   * Computes API version from the AMF model.
   *
   * @param {Object|Array<Object>} amf
   * @return {string}
   */
  _computeApiVersion(amf) {
    const api = this._computeApi(amf);
    if (!api) {
      return undefined;
    }
    return /** @type string */ (this._getValue(api, this.ns.aml.vocabularies.core.version));
  }

  /**
   * Computes model's `encodes` property.
   *
   * @param {Array<Object>|Object} model AMF data model
   * @return {Array<Object>} List of encodes
   */
  _computeEncodes(model) {
    if (!model) {
      return undefined;
    }
    if (Array.isArray(model)) {
      /* eslint-disable-next-line no-param-reassign */
      [model] = model;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.encodes);
    const data = model[key];
    if (data) {
      return data instanceof Array ? data[0] : data;
    }
    return undefined;
  }

  /**
   * Computes list of declarations in the AMF api model.
   *
   * @param {Array<Object>|Object} model AMF json/ld model for an API
   * @return {Array<Object>} List of declarations
   */
  _computeDeclares(model) {
    if (!model) {
      return undefined;
    }
    if (Array.isArray(model)) {
      /* eslint-disable-next-line no-param-reassign */
      [model] = model;
    }
    if (!model) {
      return undefined;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.declares);
    const data = this._ensureArray(model[key]);
    return data instanceof Array ? data : undefined;
  }

  /**
   * Computes list of references in the AMF api model.
   *
   * @param {Array<Object>|Object} model AMF json/ld model for an API
   * @return {Array<Object>} List of declarations
   */
  _computeReferences(model) {
    if (!model) {
      return undefined;
    }
    if (Array.isArray(model)) {
      /* eslint-disable-next-line no-param-reassign */
      [model] = model;
    }
    if (!model) {
      return undefined;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.references);
    const data = this._ensureArray(model[key]);
    return data instanceof Array ? data : undefined;
  }

  /**
   * Computes AMF's `http://schema.org/WebAPI` model
   *
   * @param {Array<Object>|Object} model AMF json/ld model for an API
   * @return {Object} Web API declaration.
   */
  _computeWebApi(model) {
    const enc = this._computeEncodes(model);
    if (!enc) {
      return undefined;
    }
    if (this._hasType(enc, this.ns.schema.webApi)) {
      return enc;
    }
    return undefined;
  }

  /**
   * Computes AMF's `http://schema.org/API` model
   *
   * @param {Array<Object>|Object} model AMF json/ld model for an API
   * @return {Object} API declaration.
   */
  _computeApi(model) {
    const enc = this._computeEncodes(model);
    if (!enc) {
      return undefined;
    }
    if (this._hasType(enc, this.ns.aml.vocabularies.apiContract.API)) {
      return enc;
    }
    return undefined;
  }

  /**
   * Returns whether an AMF node is a WebAPI node
   * 
   * @param {Array<Object>|Object} model  AMF json/ld model for an API
   * @return {Boolean}
   */
  _isWebAPI(model) {
    const enc = this._computeEncodes(model);
    if (!enc) {
      return false;
    }
    return this._hasType(enc, this.ns.schema.webApi);
  }

  /**
   * Returns whether an AMF node is an AsyncAPI node
   * 
   * @param {Array<Object>|Object} model  AMF json/ld model for an API
   * @return {Boolean}
   */
  _isAsyncAPI(model) {
    const enc = this._computeEncodes(model);
    if (!enc) {
      return false;
    }
    return this._hasType(enc, this.ns.aml.vocabularies.apiContract.AsyncAPI);
  }

  /**
   * Returns whether an AMF node is an API node
   * 
   * @param {Array<Object>|Object} model  AMF json/ld model for an API
   * @return {Boolean}
   */
  _isAPI(model) {
    const enc = this._computeEncodes(model);
    if (!enc) {
      return false;
    }
    return this._hasType(enc, this.ns.aml.vocabularies.apiContract.API);
  }

  /**
   * Computes value for `server` property that is later used with other computations.
   *
   * @param {Array<Object>|Object} model AMF model for an API
   * @return {Object|undefined} The server model
   */
  _computeServer(model) {
    const api = this._computeApi(model);
    if (!api) {
      return undefined;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.server);
    const srv = this._ensureArray(api[key]);
    return srv ? srv[0] : undefined;
  }

  /**
   * Determines whether a partial model is valid for reading servers from
   * Current valid values:
   * - Operation
   * - Endpoint
   * @param {Object} model The partial model to evaluate
   * @return {boolean} Whether the model's type is part of the array of valid node types from which
   * to read servers
   * @private
   */
  _isValidServerPartial(model) {
    if (Array.isArray(model)) {
      /* eslint-disable-next-line no-param-reassign */
      [model] = model;
    }
    if (!model) {
      return false;
    }
    const oKey = this.ns.aml.vocabularies.apiContract.Operation;
    const eKey = this.ns.aml.vocabularies.apiContract.EndPoint;
    const allowedPartialModelTypes = [this._getAmfKey(oKey), this._getAmfKey(eKey)];
    const types = model['@type'];
    for (const type of types) {
      if (allowedPartialModelTypes.indexOf(type) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {Object} options
   * @param {string=} options.endpointId Optional endpoint to look for the servers in
   * @param {string=} options.methodId Optional method to look for the servers in
   * @return {Array<Object>} List of servers for method, if defined, or endpoint, if defined, or root level
   */
  _getServers({ endpointId, methodId }){
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    let api = this._computeApi(amf);
    if (Array.isArray(api)) {
      [api] = api;
    }
    if (!api) {
      if (this._isValidServerPartial(amf)) {
        api = amf;
      } else {
        return undefined;
      }
    }

    const serverKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.server);

    const getRootServers = () => {
      return this._getValueArray(api, serverKey);
    };
    const getEndpointServers = () => {
      const endpoint = this._computeEndpointModel(api, endpointId);
      const servers = this._getValueArray(endpoint, serverKey);
      if (servers) {
        return servers;
      }
      return getRootServers();
    };
    const getMethodServers = () => {
      const method = this._computeMethodModel(api, methodId);
      const servers = this._getValueArray(method, serverKey);
      if (servers) {
        return servers;
      }
      return getEndpointServers();
    };

    if (methodId) {
      return getMethodServers();
    } if (endpointId) {
      return getEndpointServers();
    }
    return getRootServers();
  }

  /**
   * Compute values for `server` property based on node an optional selected id.
   *
   * @param {Object} options
   * @param {String=} options.endpointId Optional endpoint id, required if method is provided
   * @param {String=} options.methodId Optional method id
   * @param {String=} options.id Optional selected server id
   * @return {Array<Object>|undefined} The server list or undefined if node has no servers
   */
  _getServer({ endpointId, methodId, id }) {
    const servers = this._getServers({ endpointId, methodId });
    return servers ? servers.filter((srv) => this._getValue(srv, '@id') === id) : undefined;
  }

  /**
   * Computes endpoint's URI based on `amf` and `endpoint` models.
   *
   * @param {Object} server Server model of AMF API.
   * @param {Object} endpoint Endpoint model
   * @param {string=} baseUri Current value of `baseUri` property
   * @param {string=} version API current version
   * @return {string} Endpoint's URI
   * @deprecated Use `_computeUri()` instead
   */
  _computeEndpointUri(server, endpoint, baseUri, version) {
    let baseValue = this._getBaseUri(baseUri, server) || '';
    if (baseValue && baseValue[baseValue.length - 1] === '/') {
      baseValue = baseValue.substr(0, baseValue.length - 1);
    }
    baseValue = this._ensureUrlScheme(baseValue);
    const path = this._getValue(endpoint, this.ns.aml.vocabularies.apiContract.path);
    let result = baseValue + (path || '');
    if (version && result) {
      result = result.replace('{version}', version);
    }
    return result;
  }

  /**
   * Computes endpoint's URI based on `endpoint` model.
   *
   * @param {Object} endpoint Model for the endpoint
   * @param {Object} opts Configuration options
   * @param {Object=} opts.server Model for current server, if available.
   * @param {string=} opts.baseUri Base URI to be used with the endpoint's paht.
   * Note, base URI is ignored when `ignoreBase` is set
   * @param {string=} opts.version Current version of the API. It is used to replace
   * `{version}` from the URI template.
   * @param {boolean=} [opts.ignoreBase = false] Whether or not to ignore rendering
   * @param {string[]=} [opts.protocols] List of available protocols
   * of the base URI with path.
   * @return {string} The base uri for the endpoint.
   */
  _computeUri(endpoint, { server, baseUri, version, ignoreBase=false, protocols, ignorePath = false } = {}) {
    let baseValue = '';
    if (ignoreBase === false) {
      baseValue = this._getBaseUri(baseUri, server, protocols) || '';
      if (baseValue && baseValue[baseValue.length - 1] === '/') {
        baseValue = baseValue.substr(0, baseValue.length - 1);
      }
      baseValue = this._ensureUrlScheme(baseValue, protocols);
    }
    let result = baseValue
    if (!ignorePath) {
      result = this._appendPath(result, endpoint);
    }
    if (version && result) {
      result = result.replace('{version}', version);
    }
    return result;
  }

  /**
   * Appends endpoint's path to url
   * @param {string} url
   * @param {Object} endpoint
   * @return {string}
   */
  _appendPath(url, endpoint) {
    const path = this._getValue(endpoint, this.ns.aml.vocabularies.apiContract.path);
    return url + (path || '');
  }

  /**
   * Computes base URI value from either `baseUri` or `amf` value (in this order).
   *
   * @param {string} baseUri Value of `baseUri` property
   * @param {Object} server AMF API model for Server.
   * @param {Array<string>=} protocols List of supported protocols
   * @return {string} Base uri value. Can be empty string.
   */
  _getBaseUri(baseUri, server, protocols) {
    if (baseUri) {
      return baseUri;
    }
    return this._getAmfBaseUri(server, protocols) || '';
  }

  /**
   * Computes base URI from AMF model.
   *
   * @param {Object} server AMF API model for Server.
   * @param {?Array<string>} protocols Listy of supporte dprotocols. If not
   * provided and required to compute the url it uses `amf` to compute
   * protocols
   * @return {string|undefined} Base uri value if exists.
   */
  _getAmfBaseUri(server, protocols) {
    const key = this.ns.aml.vocabularies.core.urlTemplate;
    let value = /** @type string */ (this._getValue(server, key));
    value = this._ensureUrlScheme(value, protocols);
    return value;
  }

  /**
   * A function that makes sure that the URL has a scheme definition.
   * If no supported protocols information is available it assumes `http`.
   *
   * @param {String} value A url value
   * @param {Array<string>=} protocols List of supported by the API protocols
   * An array of string like: `['HTTP', 'HTTPS']`. It lowercase the value.
   * If not set it tries to read supported protocols value from `amf`
   * property.
   * @return {string} Url with scheme.
   */
  _ensureUrlScheme(value, protocols) {
    if (value && typeof value === 'string') {
      if (value.indexOf('http') !== 0) {
        if (!protocols || !protocols.length) {
          /* eslint-disable-next-line no-param-reassign */
          protocols = this._computeProtocols(this.amf);
        }
        if (protocols && protocols.length) {
          const protocol = protocols[0].toLowerCase();
          if (!value.startsWith(protocol)) {
            /* eslint-disable-next-line no-param-reassign */
            value = `${protocol}://${value}`;
          }
        } else {
          /* eslint-disable-next-line no-param-reassign */
          value = `http://${  value}`;
        }
      }
    }
    return value;
  }

  /**
   * Computes supported protocols by the API.
   *
   * @param {Object|Array} model AMF data model
   * @return {Array<string>|undefined}
   */
  _computeProtocols(model) {
    const api = this._computeApi(model);
    if (!api) {
      return undefined;
    }
    return /** @type {Array<string>} */ (this._getValueArray(api, this.ns.aml.vocabularies.apiContract.scheme));
  }

  /**
   * Computes value for the `expects` property.
   *
   * @param {Object} method AMF `supportedOperation` model
   * @return {Object}
   */
  _computeExpects(method) {
    const operationKey = this.ns.aml.vocabularies.apiContract.Operation;
    const expectsKey = this.ns.aml.vocabularies.apiContract.expects;
    if (this._hasType(method, operationKey)) {
      const key = this._getAmfKey(expectsKey);
      const expects = this._ensureArray(method[key]);
      if (expects) {
        return expects instanceof Array ? expects[0] : expects;
      }
    }
    return undefined;
  }

  /**
   * Tries to find an example value (whether it's default value or from an
   * example) to put it into snippet's values.
   *
   * @param {Object} item A http://raml.org/vocabularies/http#Parameter property
   * @return {string|undefined}
   */
  _computePropertyValue(item) {
    const exKey = this.ns.aml.vocabularies.apiContract.examples;
    const schemaKey = this.ns.aml.vocabularies.shapes.schema;
    const rawKey = this.ns.aml.vocabularies.document.raw;
    const skey = this._getAmfKey(schemaKey);
    let schema = item && item[skey];
    if (!schema) {
      return undefined;
    }
    if (Array.isArray(schema)) {
      [schema] = schema;
    }
    let value = this._getValue(schema, this.ns.w3.shacl.defaultValue);
    if (!value) {
      const examplesKey = this._getAmfKey(exKey);
      let example = schema[examplesKey];
      if (example) {
        if (example instanceof Array) {
          [example] = example;
        }
        value = this._getValue(example, rawKey);
      }
    }
    return /** @type string */ (value);
  }

  /**
   * Computes list of endpoints from a WebApi model.
   * @param {Object} webApi
   * @return {Array<Object>|undefined} An array of endpoints.
   */
  _computeEndpoints(webApi) {
    if (!webApi) {
      return [];
    }
    const endpointKey = this.ns.aml.vocabularies.apiContract.endpoint;
    const key = this._getAmfKey(endpointKey);
    return this._ensureArray(webApi[key]);
  }

  /**
   * Computes model for an endpoint documentation.
   *
   * @param {Object} webApi Current value of `webApi` property
   * @param {string} id Selected shape ID
   * @return {Object} An endponit definition
   */
  _computeEndpointModel(webApi, id) {
    const endpoints = this._computeEndpoints(webApi);
    if (!endpoints) {
      return undefined;
    }
    return endpoints.find((item) => item['@id'] === id);
  }

  /**
   * Computes model for an endpoint documentation using it's path.
   *
   * @param {Object} webApi Current value of `webApi` property
   * @param {string} path Endpoint path
   * @return {Object|undefined} An endponit definition
   */
  _computeEndpointByPath(webApi, path) {
    if (!path || !webApi) {
      return undefined;
    }
    const endpoints = this._computeEndpoints(webApi);
    if (!endpoints) {
      return undefined;
    }
    const pathKey = this.ns.aml.vocabularies.apiContract.path;
    for (let i = 0; i < endpoints.length; i++) {
      const ePath = this._getValue(endpoints[i], pathKey);
      if (ePath === path) {
        return endpoints[i];
      }
    }
    return undefined;
  }

  /**
   * Computes method for the method documentation.
   *
   * @param {Object} webApi Current value of `webApi` property
   * @param {string} selected Selected shape
   * @return {Object} A method definition
   */
  _computeMethodModel(webApi, selected) {
    const methods = this.__computeMethodsListForMethod(webApi, selected);
    if (!methods) {
      return undefined;
    }
    return methods.find((item) => item['@id'] === selected);
  }

  /**
   * Computes list of operations in an endpoint
   * @param {Object} webApi The WebApi AMF model
   * @param {string} id Endpoint ID
   * @return {Array<Object>} List of SupportedOperation objects
   */
  _computeOperations(webApi, id) {
    const endpoint = this._computeEndpointModel(webApi, id);
    if (!endpoint) {
      return [];
    }
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    return this._ensureArray(endpoint[opKey]);
  }

  /**
   * Computes an endpoint for a method.
   * @param {Object} webApi The WebApi AMF model
   * @param {string} methodId Method id
   * @return {Object|undefined} An endpoint model of undefined.
   */
  _computeMethodEndpoint(webApi, methodId) {
    if (!webApi || !methodId) {
      return undefined;
    }
    const endpoints = this._computeEndpoints(webApi);
    if (!endpoints) {
      return undefined;
    }
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    for (let i = 0, len = endpoints.length; i < len; i++) {
      const endpoint = endpoints[i];
      let methods = endpoint[opKey];
      if (!methods) {
        continue;
      }
      if (!(methods instanceof Array)) {
        methods = [methods];
      }
      for (let j = 0, jLen = methods.length; j < jLen; j++) {
        if (methods[j]['@id'] === methodId) {
          return endpoint;
        }
      }
    }
    return undefined;
  }

  /**
   * Computes a list of methods for an endpoint that contains a method with
   * given id.
   *
   * @param {Object} webApi WebApi model
   * @param {string} methodId Method id.
   * @return {Array<Object>|undefined} A list of sibling methods or undefined.
   */
  __computeMethodsListForMethod(webApi, methodId) {
    const endpoint = this._computeMethodEndpoint(webApi, methodId);
    if (!endpoint) {
      return undefined;
    }
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    return this._ensureArray(endpoint[opKey]);
  }

  /**
   * Computes a type documentation model.
   *
   * @param {Array<Object>} declares Current value of `declares` property
   * @param {Array<Object>} references Current value of `references` property
   * @param {string} selected Selected shape
   * @return {Object} A type definition
   */
  _computeType(declares, references, selected) {
    if ((!declares && !references) || !selected) {
      return undefined;
    }
    // In compact model some IDs are presented in long version (in source maps for examples)
    // This must test for this case as well.
    const compactId = selected.replace('amf://id', '');
    let type = declares && declares.find((item) => item['@id'] === selected || item['@id'] === compactId);
    if (!type && references && references.length) {
      for (let i = 0, len = references.length; i < len; i++) {
        if (!this._hasType(references[i], this.ns.aml.vocabularies.document.Module)) {
          continue;
        }
        type = this._computeReferenceType(references[i], selected);
        if (type) {
          break;
        }
      }
    }
    return type;
  }

  /**
   * Computes a type model from a reference (library for example).
   * @param {Object} reference AMF model for a reference to extract the data from
   * @param {string} selected Node ID to look for
   * @return {Object|undefined} Type definition or undefined if not found.
   */
  _computeReferenceType(reference, selected) {
    const declare = this._computeDeclares(reference);
    if (!declare) {
      return undefined;
    }
    // In compact model some IDs are presented in long version (in source maps for examples)
    // This must test for this case as well.
    const compactId = selected.replace('amf://id#', '');
    let result = declare.find((item) => {
      if (Array.isArray(item)) {
        /* eslint-disable-next-line no-param-reassign */
        [item] = item;
      }
      return item['@id'] === selected || item['@id'] === compactId;
    });
    if (Array.isArray(result)) {
      [result] = result;
    }
    return this._resolve(result);
  }

  /**
   * Computes model for selected security definition.
   *
   * @param {Array<Object>} declares Current value of `declares` property
   * @param {string} selected Selected shape
   * @return {Object|undefined} A security definition
   */
  _computeSecurityModel(declares, selected) {
    if (!declares || !selected) {
      return undefined;
    }
    return declares.find((item) => item['@id'] === selected);
  }

  /**
   * Computes a documentation model.
   *
   * @param {Object} webApi Current value of `webApi` property
   * @param {string} selected Selected shape
   * @return {Object} A method definition
   */
  _computeDocument(webApi, selected) {
    if (!webApi || !selected) {
      return undefined;
    }
    const key = this._getAmfKey(this.ns.schema.doc);
    const docs = this._ensureArray(webApi[key]);
    return docs && docs.find((item) => item['@id'] === selected);
  }

  /**
   * Resolves a reference to an external fragment.
   *
   * @param {Object} shape A shape to resolve
   * @return {Object} Resolved shape.
   */
  _resolve(shape) {
    const {amf} = this;
    if (typeof shape !== 'object' || shape instanceof Array || !amf || shape.__apicResolved) {
      return shape;
    }
    let refKey = this._getAmfKey(this.ns.aml.vocabularies.document.linkTarget);
    let refValue = this._ensureArray(shape[refKey]);
    let refData;
    if (refValue) {
      const rk = refValue[0]['@id'];
      if (rk === shape['@id']) {
        // recursive shape.
        /* eslint-disable-next-line no-param-reassign */
        shape.__apicResolved = true;
        return shape;
      }
      refData = this._getLinkTarget(amf, rk);
    } else {
      refKey = this._getAmfKey(this.ns.aml.vocabularies.document.referenceId);
      refValue = this._ensureArray(shape[refKey]);
      if (refValue) {
        const rk = refValue[0]['@id'];
        if (rk === shape['@id']) {
          // recursive shape.
          /* eslint-disable-next-line no-param-reassign */
          shape.__apicResolved = true;
          return shape;
        }
        refData = this._getReferenceId(amf, rk);
      }
    }
    if (!refData) {
      this._resolveRecursive(shape);
      /* eslint-disable-next-line no-param-reassign */
      shape.__apicResolved = true;
      return shape;
    }
    const copy = { ...refData};
    delete copy['@id'];
    const types = copy['@type'];
    if (types) {
      if (shape['@type']) {
        /* eslint-disable-next-line no-param-reassign */
        shape['@type'] = shape['@type'].concat(types);
      } else {
        /* eslint-disable-next-line no-param-reassign */
        shape['@type'] = types;
      }
      delete copy['@type'];
    }
    this._mergeShapes(shape, copy);
    /* eslint-disable-next-line no-param-reassign */
    shape.__apicResolved = true;
    this._resolveRecursive(shape);
    return shape;
  }

  /**
   * @param {Object} amf References object to search in
   * @param {string} id Id of the shape to resolve
   * @return {Object | undefined} Resolved shape for given reference, undefined otherwise
   */
  _getLinkTarget(amf, id) {
    if (!amf || !id) {
      return undefined;
    }
    let target;
    const declares = this._computeDeclares(amf);
    if (declares) {
      target = this._findById(declares, id);
    }
    if (!target) {
      const references = this._computeReferences(amf);
      target = this._obtainShapeFromReferences(references, id)
    }
    if (!target) {
      return undefined;
    }
    // Declaration may contain references
    target = this._resolve(target);
    return target;
  }

  /**
   * Resolves the shape of a given reference.
   *
   * @param {Object} references References object to search in
   * @param {string} id Id of the shape to resolve
   * @return {Object | undefined} Resolved shape for given reference, undefined otherwise
   */
  _obtainShapeFromReferences(references, id) {
    let target;
    for (let i = 0; i < references.length; i++) {
      const _ref = references[i];
      // case of fragment that encodes the shape
      const encoded = this._computeEncodes(_ref);
      if (encoded && encoded['@id'] === id) {
        target = encoded;
        break;
      }
      // case of a library which declares types
      if (!encoded) {
        target = this._findById(this._computeDeclares(_ref), id);
        if (target) break;
      }
    }
    return target;
  }

  /**
   * Searches a node with a given ID in an array
   *
   * @param {Array<Object>} array Array to search for a given ID
   * @param {string} id Id to search for
   * @return {Object | undefined} Node with the given ID when found, undefined otherwise
   */
  _findById(array, id) {
    if (!array) return undefined;
    let target;
    for (let i = 0; i < array.length; i++) {
      const _current = array[i];
      if (_current && _current['@id'] === id) {
        target = _current;
        break;
      }
    }
    return target;
  }

  _getReferenceId(amf, id) {
    if (!amf || !id) {
      return undefined;
    }
    const refs = this._computeReferences(amf);
    if (!refs) {
      return undefined;
    }
    for (let i = 0; i < refs.length; i++) {
      const _ref = refs[i];
      const enc = this._computeEncodes(_ref);
      if (enc) {
        if (enc['@id'] === id) {
          return enc;
        }
      }
    }
    return undefined;
  }

  _resolveRecursive(shape) {
    Object.keys(shape).forEach((key) => {
      const currentShape = shape[key];
      if (currentShape instanceof Array) {
        for (let i = 0, len = currentShape.length; i < len; i++) {
          currentShape[i] = this._resolve(currentShape[i]);
        }
      } else if (typeof currentShape === 'object') {
        /* eslint-disable-next-line no-param-reassign */
        shape[key] = this._resolve(currentShape);
      }
    });
  }

  /**
   * Merge two shapes together. If the resulting shape has one of the "special merge" keys,
   * then the special merge function for that key will be used to match that property
   * @param shapeA AMF node
   * @param shapeB AMF node
   * @return {*} Merged AMF node
   * @private
   */
  _mergeShapes(shapeA, shapeB) {
    const merged = { ...shapeA, ...shapeB };
    const specialMerges = [
      { key: this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.sources), merger: this._mergeSourceMapsSources.bind(this) },
    ];
    specialMerges.forEach(({ key, merger }) => {
      if (this._hasProperty(merged, key)) {
        merged[key] = merger(shapeA, shapeB);
      }
    });
    return Object.assign(shapeA, merged);
  }

  /**
   * Obtains source map sources value from two shapes and returns the merged result
   * If neither shape has a sources node, then an empty object will be returned.
   * Result is wrapped in an array as per AMF model standard
   * @param shapeA AMF node
   * @param shapeB AMF node
   * @return {(*|{})[]} Empty object or resulting merge, wrapped in an array
   * @private
   */
  _mergeSourceMapsSources(shapeA, shapeB) {
    const sourcesKey = this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.sources);
    let aSources = shapeA[sourcesKey] || {};
    if (Array.isArray(aSources)) {
      /* eslint-disable prefer-destructuring */
      aSources = aSources[0];
    }
    let bSources = shapeB[sourcesKey] || {};
    if (Array.isArray(bSources)) {
      /* eslint-disable prefer-destructuring */
      bSources = bSources[0];
    }
    return [Object.assign(aSources, bSources)];
  }
};
