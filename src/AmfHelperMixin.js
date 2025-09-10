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
// @ts-ignore
import { AmfModelExpander, JsonLdOptions, JsonLd } from 'amf-json-ld-lib'
import { ns } from './Namespace.js';

/** @typedef {import('./Namespace').ns} Namespace */
/** @typedef {import('./amf').DomainElement} DomainElement */
/** @typedef {import('./amf').AmfDocument} AmfDocument */
/** @typedef {import('./amf').WebApi} WebApi */
/** @typedef {import('./amf').AsyncApi} AsyncApi */
/** @typedef {import('./amf').Server} Server */
/** @typedef {import('./amf').EndPoint} EndPoint */
/** @typedef {import('./amf').Operation} Operation */
/** @typedef {import('./amf').Shape} Shape */
/** @typedef {import('./amf').Parameter} Parameter */
/** @typedef {import('./amf').Request} Request */
/** @typedef {import('./amf').Response} Response */
/** @typedef {import('./amf').Payload} Payload */
/** @typedef {import('./amf').SecurityRequirement} SecurityRequirement */
/** @typedef {import('./amf').SecurityScheme} SecurityScheme */
/** @typedef {import('./types').ServersQueryOptions} ServersQueryOptions */
/** @typedef {import('./types').ServerQueryOptions} ServerQueryOptions */
/** @typedef {import('./types').ComputeUriOptions} ComputeUriOptions */

export const expandKey = Symbol('expandKey');
export const findAmfType = Symbol('findAmfType');
export const findReferenceObject = Symbol('findReferenceObject');
export const getArrayItems = Symbol('getArrayItems');

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
 * @returns {*}
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
       * It is only useful for the element to resolve references.
       *
       * @type {Object|Array<Object>}
       */
      amf: { type: Object }
    };
  }

  /**
   * A namespace for AMF model.
   * @returns {Namespace}
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
    let expanded;
    if (!value || AmfModelExpander.isInExpandedForm(value)) {
      this._flattenedAmf = undefined;
      expanded = value;
    } else {
      const oldFlattened = this._flattenedAmf;
      if (oldFlattened === value) {
        return;
      }
      this._flattenedAmf = value;
      expanded = this._expand(value);
    }
    // Cached keys cannot be static as this element can be using in the sane
    // document with different AMF models
    this.__cachedKeys = {};
    this._amf = expanded;
    this.__amfChanged(expanded);
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
  __amfChanged(amf) { }

  /**
   * Expands flattened AMF model
   * @param {Object} amf
   */
  _expand(amf) {
    AmfModelExpander.preprocessLegacyRootNodeId(amf)
    const linkEmbeddingFilter = key => !key.endsWith("fixPoint")
    const rootNode = amf['@context'] ? '' : "amf://id";
    const options = JsonLdOptions.apply()
      .withEmbeddedLinks(linkEmbeddingFilter)
      .withCompactedIris()
      .withExpandedStructure()
      .withRootNode(rootNode)
    return JsonLd.process(amf, options)
  }

  /**
   * Returns compact model key for given value.
   * @param {string} property AMF original property
   * @returns {string} Compact model property name or the same value if
   * value not found in the context.
   */
  _getAmfKey(property) {
    if (!property) {
      return undefined;
    }
    let { amf } = this;
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
        const result = property.replace(ctx[k], `${k}:`);
        cache[property] = result;
        return result;
      } if (ctx[k] === hashProperty) {
        const result = `${k}:${property.substr(hashIndex + 1)}`;
        cache[property] = result;
        return result;
      }
    }
    return property;
  }

  /**
   * Ensures that the model is AMF object.
   *
   * @param {any} amf AMF json/ld model
   * @returns {AmfDocument|undefined} API spec
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
   * @returns {Array|undefined}
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
   * Gets a single scalar value from a model.
   * @param {DomainElement} model Amf model to extract the value from.
   * @param {string} key Model key to search for the value
   * @returns {string|number|boolean|undefined|null} Value for key
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
   * @param {DomainElement} model Amf model to extract the value from.
   * @param {string} key Model key to search for the value
   * @returns {Array<string|number|boolean|null>|undefined} Value for key
   */
  _getValueArray(model, key) {
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    const data = model && this._ensureArray(model[key]);
    if (!Array.isArray(data)) {
      return undefined;
    }
    return data.map((item) => item['@value'] || item);
  }

  /**
   * Reads an array from the model.
   *
   * @param {DomainElement} model Amf model to extract the value from.
   * @param {string} key Model key to search for the value
   * @returns {DomainElement[]|undefined} Value for the key
   */
  [getArrayItems](model, key) {
    const k = this._getAmfKey(key);
    const data = model && this._ensureArray(model[k]);
    if (!Array.isArray(data)) {
      return undefined;
    }
    return data;
  }

  /**
   * Reads the value of the `@id` property.
   * @param {DomainElement} model Amf model to extract the value from.
   * @param {string} key Model key to search for the @id
   * @returns {string|undefined}
   */
  _getLinkValue(model, key) {
    const k = this._getAmfKey(key);
    let data = model && model[k];
    if (!data) {
      return undefined;
    }
    if (Array.isArray(data)) {
      [data] = data;
    }
    if (!data) {
      return undefined;
    }
    return data['@id'];
  }

  /**
   * Reads the list of value for the `@id` property.
   * @param {DomainElement} model Amf model to extract the value from.
   * @param {string} key Model key to search for the @id
   * @returns {string[]|undefined}
   */
  _getLinkValues(model, key) {
    const k = this._getAmfKey(key);
    let data = /** @type DomainElement[] */ (model && model[k]);
    if (!data) {
      return undefined;
    }
    if (!Array.isArray(data)) {
      data = [data];
    }
    return data.map(i => i['@id']);
  }

  /**
   * Checks if a model has a type.
   * @param {DomainElement} model Model to test
   * @param {string} type Type name
   * @returns {boolean} True if model has a type.
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
   * @param {DomainElement} shape The shape to test
   * @param {string} key Property name to test
   * @returns {boolean}
   */
  _hasProperty(shape, key) {
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    return !!(shape && key && key in shape);
  }

  /**
   * Computes array value of a property in a model (shape).
   *
   * @param {DomainElement} shape AMF shape object
   * @param {string} key Property name
   * @returns {Array<string|number|boolean|null|Object>|undefined}
   */
  _computePropertyArray(shape, key) {
    if (!shape) {
      return undefined;
    }
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    const data = this._ensureArray(shape && shape[key]);
    if (!data || !Array.isArray(data)) {
      return undefined;
    }
    return data;
  }

  /**
   * Computes a value of a property in a model (shape).
   * It takes first value of a property, if exists.
   *
   * @param {DomainElement} shape AMF shape object
   * @param {string} key Property name
   * @returns {string|number|boolean|null|Object|undefined}
   */
  _computePropertyObject(shape, key) {
    /* eslint-disable-next-line no-param-reassign */
    key = this._getAmfKey(key);
    const data = this._computePropertyArray(shape, key);
    return data && data[0];
  }

  /**
   * Tests if a passed argument exists.
   *
   * @param {string|Object|number} value A value to test
   * @returns {boolean}
   */
  _computeHasStringValue(value) {
    return !!value || value === 0;
  }

  /**
   * Computes if passed argument is an array and has a value.
   * It does not check for type or value of the array items.
   * @param {Array} value Value to test
   * @returns {boolean}
   */
  _computeHasArrayValue(value) {
    return !!(value instanceof Array && value.length);
  }

  /**
   * Computes description for a shape.
   * @param {DomainElement} shape AMF shape
   * @returns {string} Description value.
   */
  _computeDescription(shape) {
    return /** @type string */ (this._getValue(shape, this.ns.schema.desc) || this._getValue(shape, this.ns.aml.vocabularies.core.description));
  }

  /**
   * Computes a list of headers
   * @param {DomainElement} shape
   * @returns {Parameter[]|Parameter|undefined}
   */
  _computeHeaders(shape) {
    return this._computePropertyArray(shape, this.ns.aml.vocabularies.apiContract.header) || this._computeHeaderSchema(shape);
  }

  /**
   * @returns {Array<string|number|boolean|null|Object>|undefined}
  */
  _computeAgents(node) {
    if (!node) {
      node = this.amf;
    }
    return this._getValueArray(
      this._computeNodeAgent(node),
      this._getAmfKey(
        this.ns.aml.vocabularies.data.agent
      ))
  }

  /**
   * @returns {Array<string|number|boolean|null|Object>|undefined}
  */
  _computeAgentPrivacy(node) {
    if (!node) {
      node = this.amf;
    }
    return this._getValueArray(
      this._computeNodeAgent(node),
      this._getAmfKey(
        this.ns.aml.vocabularies.data.privacy
      ))
  }

  _computeNodeAgent(node) {
    return node[
      Object
        .keys(node)
        .find(
          key => key.includes('amf://id#')
        )
    ]
  }

  ensureObject(value) {
    return Array.isArray(value) ? value[0] : value;
  }

  _computeTopics(node) {
    const agents = this._computeAgents(node);
    if (!agents || !agents.length) return [];

    const nameKey = this._getAmfKey(this.ns.aml.vocabularies.core.name);
    const topicKey = this._getAmfKey(this.ns.aml.vocabularies.data.topic);
    const classificationKey = this._getAmfKey(this.ns.aml.vocabularies.data.classificationDescription);
    const instructionsKey = this._getAmfKey(this.ns.aml.vocabularies.data.instructions);
    const dataNameKey = this._getAmfKey(this.ns.aml.vocabularies.data.name);
    const scopeKey = this._getAmfKey(this.ns.aml.vocabularies.data.scope);

    return agents.map(agentRaw => {
      // Get the agent object
      const agentObj = this.ensureObject(agentRaw);
      if (!agentObj || typeof agentObj !== 'object') return null;

      // Extract agent name
      const agentName = this._getValue(agentObj, nameKey);

      // Get topics
      const topics = agentObj[topicKey];
      if (!topics) return { agentName };

      const topicsArray = Array.isArray(topics) ? topics : [topics];

      // Process each topic
      const processedTopics = topicsArray.map(topicRaw => {
        const topicObj = this.ensureObject(topicRaw);
        if (!topicObj || typeof topicObj !== 'object') return null;

        return {
          name: this._getValue(topicObj, nameKey),
          classificationDescription: this._getValueArray(topicObj, classificationKey),
          instructions: this._getValueArray(topicObj, instructionsKey),
          dataName: this._getValueArray(topicObj, dataNameKey),
          scope: this._getValueArray(topicObj, scopeKey)
        };
      }).filter(Boolean); // Remove null entries

      return {
        agentName,
        topics: processedTopics
      };
    }).filter(Boolean); // Remove null entries
  }

  _computeTopicValue(topicObj, key) {
    const data = this._ensureArray(topicObj && topicObj[key]);
    if (!data || !Array.isArray(data)) {
      return undefined;
    }
    return data;
  }

  /**
   *
   * @param {DomainElement} shape
   * @returns {Parameter|undefined}
   */
  _computeHeaderSchema(shape) {
    return this._computePropertyObject(shape, this.ns.aml.vocabularies.apiContract.headerSchema);
  }

  /**
   * Computes a list of query parameters
   * @param {DomainElement} shape
   * @returns {Parameter[]|undefined}
   */
  _computeQueryParameters(shape) {
    return this._computePropertyArray(shape, this.ns.aml.vocabularies.apiContract.parameter);
  }

  /**
   * In OAS URI parameters can be defined on an operation level under `uriParameter` property.
   * Normally `_computeQueryParameters()` function would be used to extract parameters from an endpoint.
   * This is a fallback option to test when an API is OAS.
   * @param {Operation|Request} shape Method or Expects model
   * @returns {Parameter[]}
   */
  _computeUriParameters(shape) {
    if (!shape) {
      return undefined;
    }
    const { apiContract } = this.ns.aml.vocabularies;
    let object = shape;
    if (this._hasType(object, apiContract.Operation)) {
      const typed = /** @type Operation */ (object);
      object = this._computeExpects(typed);
    }
    return this._computePropertyArray(object, apiContract.uriParameter);
  }

  /**
   * Computes a list of responses
   * @param {Operation} shape
   * @returns {Response[]|undefined}
   */
  _computeResponses(shape) {
    return this._computePropertyArray(shape, this.ns.aml.vocabularies.apiContract.response);
  }

  /**
   * Computes value for `serverVariables` property.
   *
   * @param {Server} server AMF API model for Server.
   * @returns {Parameter[]|undefined} Variables if defined.
   */
  _computeServerVariables(server) {
    return this._computePropertyArray(server, this.ns.aml.vocabularies.apiContract.variable);
  }

  /**
   * Computes value for `endpointVariables` property.
   *
   * @param {EndPoint} endpoint Endpoint model
   * @param {Operation=} method Optional method to be used to lookup the parameters from
   * This is used for OAS model which can defined path parameters on a method level.
   * @returns {Parameter[]|undefined} Parameters if defined.
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
   * @param {Request} expects Current value of `expects` property.
   * @returns {Payload[]|undefined} Payload model if defined.
   */
  _computePayload(expects) {
    if (Array.isArray(expects)) {
      let payload = []
      for (const expect of expects) {
        const expectPayload = this._computePropertyArray(expect, this.ns.aml.vocabularies.apiContract.payload)
        if (expectPayload) {
          payload = payload.concat(expectPayload)
        }
      }
      return payload
    }
    return this._computePropertyArray(expects, this.ns.aml.vocabularies.apiContract.payload);
  }

  /**
   * Computes value for `returns` property
   *
   * @param {Operation} method AMF `supportedOperation` model
   * @returns {Response[]|undefined}
   */
  _computeReturns(method) {
    return this._computePropertyArray(method, this.ns.aml.vocabularies.apiContract.returns);
  }

  /**
   * Computes value for `security` property
   *
   * @param {Operation} method AMF `supportedOperation` model
   * @returns {SecurityRequirement[]|undefined}
   */
  _computeSecurity(method) {
    return this._computePropertyArray(method, this.ns.aml.vocabularies.security.security);
  }

  /**
   * Computes value for `hasCustomProperties` property.
   *
   * @param {DomainElement} shape AMF `supportedOperation` model
   * @returns {boolean}
   */
  _computeHasCustomProperties(shape) {
    return this._hasProperty(shape, this.ns.aml.vocabularies.document.customDomainProperties);
  }

  /**
   * Computes API version from the AMF model.
   *
   * @param {AmfDocument} amf
   * @returns {string}
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
   * @param {AmfDocument} model AMF data model
   * @returns {DomainElement|undefined} List of encodes
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
      return Array.isArray(data) ? data[0] : data;
    }
    return undefined;
  }

  /**
   * Computes list of declarations in the AMF api model.
   *
   * @param {AmfDocument} model AMF json/ld model for an API
   * @returns {DomainElement[]|undefined} List of declarations
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
    return Array.isArray(data) ? data : undefined;
  }

  /**
   * Computes list of references in the AMF api model.
   *
   * @param {AmfDocument} model AMF json/ld model for an API
   * @returns {DomainElement[]|undefined} List of declarations
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
   * @param {AmfDocument} model AMF json/ld model for an API
   * @returns {WebApi|undefined} Web API declaration.
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
   * @param {AmfDocument} model AMF json/ld model for an API
   * @returns {AsyncApi|WebApi} API declaration.
   */
  _computeApi(model) {
    const enc = this._computeEncodes(model);
    if (!enc) {
      return undefined;
    }
    if (this._isAPI(model) || this._isWebAPI(model) || this._isAsyncAPI(model)) {
      return enc;
    }
    return undefined;
  }

  /**
   * Returns whether an AMF node is a WebAPI node
   *
   * @param {AmfDocument} model  AMF json/ld model for an API
   * @returns {boolean}
   */
  _isWebAPI(model) {
    const enc = this._computeEncodes(model);
    if (!enc) {
      return false;
    }
    return this._hasType(enc, this.ns.aml.vocabularies.apiContract.WebAPI);
  }

  /**
   * Returns whether an AMF node is an AsyncAPI node
   *
   * @param {AmfDocument} model  AMF json/ld model for an API
   * @returns {boolean}
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
   * @param {AmfDocument} model  AMF json/ld model for an API
   * @returns {boolean}
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
   * @param {AmfDocument} model AMF model for an API
   * @returns {Server|undefined} The server model
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
   * @returns {boolean} Whether the model's type is part of the array of valid node types from which
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
   * @param {ServersQueryOptions=} [options={}] Server query options
   * @returns {Server[]} List of servers for method, if defined, or endpoint, if defined, or root level
   */
  _getServers(options = {}) {
    const { endpointId, methodId } = options;
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

    const getRootServers = () => /** @type Server[] */(this[getArrayItems](api, serverKey));
    const getEndpointServers = () => {
      const endpoint = this._computeEndpointModel(api, endpointId);
      const servers = /** @type Server[] */ (this[getArrayItems](endpoint, serverKey));
      if (servers) {
        return servers;
      }
      return getRootServers();
    };
    const getMethodServers = () => {
      const method = this._computeMethodModel(api, methodId);
      const servers = /** @type Server[] */ (this[getArrayItems](method, serverKey));
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
   * @param {ServerQueryOptions=} options Server query options
   * @returns {Server[]|undefined} The server list or undefined if node has no servers
   */
  _getServer(options = {}) {
    const { endpointId, methodId, id } = options;
    const servers = this._getServers({ endpointId, methodId });
    return servers ? servers.filter((srv) => this._getValue(srv, '@id') === id) : undefined;
  }

  /**
   * Computes endpoint's URI based on `amf` and `endpoint` models.
   *
   * @param {Server} server Server model of AMF API.
   * @param {EndPoint} endpoint Endpoint model
   * @param {string=} baseUri Current value of `baseUri` property
   * @param {string=} version API current version
   * @returns {string} Endpoint's URI
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
   * @param {EndPoint} endpoint Model for the endpoint
   * @param {ComputeUriOptions=} options Configuration options
   * @returns {string} The base uri for the endpoint.
   */
  _computeUri(endpoint, options = {}) {
    const { server, baseUri, version, ignoreBase = false, protocols, ignorePath = false } = options;
    let baseValue = '';
    if (ignoreBase === false) {
      baseValue = this._getBaseUri(baseUri, server, protocols) || '';
      if (baseValue && baseValue[baseValue.length - 1] === '/') {
        baseValue = baseValue.substr(0, baseValue.length - 1);
      }
      baseValue = this._ensureUrlScheme(baseValue, protocols);
    }
    let result = baseValue;
    if (version && result) {
      result = result.replace('{version}', version);
    }
    if (!ignorePath) {
      result = this._appendPath(result, endpoint);
    }
    return result;
  }

  /**
   * Appends endpoint's path to url
   * @param {string} url
   * @param {EndPoint} endpoint
   * @returns {string}
   */
  _appendPath(url, endpoint) {
    const path = this._getValue(endpoint, this.ns.aml.vocabularies.apiContract.path);
    return url + (path || '');
  }

  /**
   * Computes base URI value from either `baseUri` or `amf` value (in this order).
   *
   * @param {string} baseUri Value of `baseUri` property
   * @param {Server} server AMF API model for Server.
   * @param {string[]=} protocols List of supported protocols
   * @returns {string} Base uri value. Can be empty string.
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
   * @param {Server} server AMF API model for Server.
   * @param {string[]=} protocols The list of supported protocols. If not
   * provided and required to compute the url it uses `amf` to compute
   * protocols
   * @returns {string|undefined} Base uri value if exists.
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
   * @param {string} value A url value
   * @param {string[]=} protocols List of supported by the API protocols
   * An array of string like: `['HTTP', 'HTTPS']`. It lowercase the value.
   * If not set it tries to read supported protocols value from `amf`
   * property.
   * @returns {string} Url with scheme.
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
          value = `https://${value}`;
        }
      }
    }
    return value;
  }

  /**
   * Computes supported protocols by the API.
   *
   * @param {AmfDocument} model AMF data model
   * @returns {string[]|undefined}
   */
  _computeProtocols(model) {
    const api = this._computeApi(model);
    if (!api) {
      return undefined;
    }
    return /** @type string[]} */ (this._getValueArray(api, this.ns.aml.vocabularies.apiContract.scheme));
  }

  /**
   * Computes value for the `expects` property.
   *
   * @param {Operation} method AMF `supportedOperation` model
   * @returns {Request}
   */
  _computeExpects(method) {
    const operationKey = this.ns.aml.vocabularies.apiContract.Operation;
    const expectsKey = this.ns.aml.vocabularies.apiContract.expects;
    if (this._hasType(method, operationKey)) {
      const key = this._getAmfKey(expectsKey);
      const expects = this._ensureArray(method[key]);
      if (expects) {
        return Array.isArray(expects) ? expects[0] : expects;
      }
    }
    return undefined;
  }

  /**
   * Computes all values for the `expects` property.
   *
   * @param {Operation} method AMF `supportedOperation` model
   * @returns {Request[]}
   */
  _computeAllExpects(method) {
    const operationKey = this.ns.aml.vocabularies.apiContract.Operation;
    const expectsKey = this.ns.aml.vocabularies.apiContract.expects;
    if (this._hasType(method, operationKey)) {
      const key = this._getAmfKey(expectsKey);
      const expects = this._ensureArray(method[key]);
      if (expects) {
        return Array.isArray(expects) ? expects : [expects];
      }
    }
    return undefined;
  }

  /**
   * Finds an example value (whether it's default value or from an
   * example) to put it into snippet's values.
   *
   * @param {Parameter} item A http://raml.org/vocabularies/http#Parameter property
   * @returns {string|undefined}
   */
  _computePropertyValue(item) {
    const exKey = this.ns.aml.vocabularies.apiContract.examples;
    const schemaKey = this.ns.aml.vocabularies.shapes.schema;
    const rawKey = this.ns.aml.vocabularies.document.raw;
    const sKey = this._getAmfKey(schemaKey);
    let schema = item && item[sKey];
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
   * @param {WebApi} webApi
   * @returns {EndPoint[]|undefined} An array of endpoints.
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
   * @param {WebApi} webApi Current value of `webApi` property
   * @param {string} id Selected shape ID
   * @returns {EndPoint} An endpoint definition
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
   * @param {WebApi} webApi Current value of `webApi` property
   * @param {string} path Endpoint path
   * @returns {EndPoint|undefined} An endpoint definition
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
   * @param {WebApi} webApi Current value of `webApi` property
   * @param {string} selected Selected shape
   * @returns {Operation} A method definition
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
   * @param {WebApi} webApi The WebApi AMF model
   * @param {string} id Endpoint ID
   * @returns {Operation[]} List of SupportedOperation objects
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
   * @param {WebApi} webApi The WebApi AMF model
   * @param {string} methodId Method id
   * @returns {EndPoint|undefined} An endpoint model of undefined.
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
   * @param {WebApi} webApi WebApi model
   * @param {string} methodId Method id.
   * @returns {Operation[]|undefined} A list of sibling methods or undefined.
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
   * @param {DomainElement[]} declares Current value of `declares` property
   * @param {DomainElement[]} references Current value of `references` property
   * @param {string} selected Selected shape
   * @returns {Shape} A type definition
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
   * Finds a type in the model declares and references.
   * @param {string} domainId The domain id of the type (AMF's shape).
   * @returns {Shape|undefined} The AMF shape or undefined when not found.
   */
  [findAmfType](domainId) {
    let { amf } = this;
    if (!amf) {
      return undefined;
    }
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    const declares = this._computeDeclares(amf);
    const compactId = domainId.replace('amf://id', '');
    if (Array.isArray(declares)) {
      const result = declares.find((item) => item['@id'] === domainId || item['@id'] === compactId);
      if (result) {
        return result;
      }
    }
    return this[findReferenceObject](domainId);
  }

  /**
   * Searches for an object in model's references list.
   * It does not resolve the object (useful for handling links correctly).
   *
   * @param {string} domainId The domain of the object to find in the references.
   * @returns {DomainElement|undefined} The domain object or undefined.
   */
  [findReferenceObject](domainId) {
    let { amf } = this;
    if (!amf) {
      return undefined;
    }
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    const references = this._computeReferences(amf);
    if (!Array.isArray(references) || !references.length) {
      return undefined;
    }
    const compactId = domainId.replace('amf://id', '');
    for (let i = 0, len = references.length; i < len; i++) {
      const ref = /** @type AmfDocument */ (references[i]);
      const declares = this._computeDeclares(ref);
      if (!Array.isArray(declares)) {
        continue;
      }
      for (let j = 0, lenDecl = declares.length; j < lenDecl; j++) {
        let declared = declares[j];
        if (Array.isArray(declared)) {
          [declared] = declared;
        }
        if (declared['@id'] === domainId || declared['@id'] === compactId) {
          return declared;
        }
      }
    }
    return undefined;
  }

  /**
   * Computes a type model from a reference (library for example).
   * @param {DomainElement} reference AMF model for a reference to extract the data from
   * @param {string} selected Node ID to look for
   * @returns {Shape|undefined} Type definition or undefined if not found.
   */
  _computeReferenceType(reference, selected) {
    const declare = this._computeDeclares(reference);
    if (!declare) {
      return undefined;
    }
    // In compact model some IDs are presented in long version (in source maps for examples)
    // This must test for this case as well.
    const compactId = selected.replace('amf://id', '');
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
   * @param {DomainElement[]} declares Current value of `declares` property
   * @param {string} selected Selected shape
   * @returns {SecurityScheme|undefined} A security definition
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
   * @param {WebApi} webApi Current value of `webApi` property
   * @param {string} selected Selected shape
   * @returns {DomainElement|undefined}
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
   * @param {any} shape A shape to resolve
   * @returns {any} Resolved shape.
   */
  _resolve(shape) {
    const { amf } = this;
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
      /* eslint-disable-next-line no-param-reassign */
      shape.__apicResolved = true;
      this._resolveRecursive(shape);
      return shape;
    }
    const copy = { ...refData };
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
   * @param {AmfDocument} amf References object to search in
   * @param {string} id Id of the shape to resolve
   * @returns {DomainElement | undefined} Resolved shape for given reference, undefined otherwise
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
   * @param {DomainElement[]} references References object to search in
   * @param {string} id Id of the shape to resolve
   * @returns {DomainElement | undefined} Resolved shape for given reference, undefined otherwise
   */
  _obtainShapeFromReferences(references, id) {
    if (!Array.isArray(references) || !references.length) {
      return undefined;
    }
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
   * @param {DomainElement[]} array Array to search for a given ID
   * @param {string} id Id to search for
   * @returns {DomainElement | undefined} Node with the given ID when found, undefined otherwise
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
   * @param {any} shapeA AMF node
   * @param {any} shapeB AMF node
   * @returns {*} Merged AMF node
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
   * @returns {(*|{})[]} Empty object or resulting merge, wrapped in an array
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

  /**
   * Expands the key property from compacted mode to full mode.
   * @param {string} value The value to process
   * @returns {string} The expanded value.
   */
  [expandKey](value) {
    let { amf } = this;
    if (!value || typeof value !== 'string' || !amf) {
      return value;
    }
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    const ctx = amf['@context'];
    if (!ctx) {
      return value;
    }
    const [root, key] = value.split(':');
    if (!root || !key) {
      return value;
    }
    const prefix = ctx[root];
    if (!prefix) {
      return value;
    }
    return `${prefix}${key}`;
  }
};