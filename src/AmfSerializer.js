/* eslint-disable class-methods-use-this */
import { AmfHelperMixin, expandKey, findAmfType, getArrayItems } from "./AmfHelperMixin.js";

/** @typedef {import('./types').ApiParametrizedSecurityScheme} ApiParametrizedSecurityScheme */
/** @typedef {import('./types').ApiRequest} ApiRequest */
/** @typedef {import('./types').ApiSecurityScheme} ApiSecurityScheme */
/** @typedef {import('./types').ApiSecurityRequirement} ApiSecurityRequirement */
/** @typedef {import('./types').ApiTemplatedLink} ApiTemplatedLink */
/** @typedef {import('./types').ApiResponse} ApiResponse */
/** @typedef {import('./types').ApiPayload} ApiPayload */
/** @typedef {import('./types').ApiExample} ApiExample */
/** @typedef {import('./types').ApiParameter} ApiParameter */
/** @typedef {import('./types').ApiOperation} ApiOperation */
/** @typedef {import('./types').ApiEndPoint} ApiEndPoint */
/** @typedef {import('./types').ApiServer} ApiServer */
/** @typedef {import('./types').ApiDocumentation} ApiDocumentation */
/** @typedef {import('./types').SerializedApi} SerializedApi */
/** @typedef {import('./types').ApiShape} ApiShape */
/** @typedef {import('./types').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('./types').ApiAnyShape} ApiAnyShape */
/** @typedef {import('./types').ApiNodeShape} ApiNodeShape */
/** @typedef {import('./types').ApiScalarShape} ApiScalarShape */
/** @typedef {import('./types').ApiUnionShape} ApiUnionShape */
/** @typedef {import('./types').ApiFileShape} ApiFileShape */
/** @typedef {import('./types').ApiDataArrangeShape} ApiDataArrangeShape */
/** @typedef {import('./types').ApiXMLSerializer} ApiXMLSerializer */
/** @typedef {import('./types').ApiDataNode} ApiDataNode */
/** @typedef {import('./types').ApiScalarNode} ApiScalarNode */
/** @typedef {import('./types').ApiObjectNode} ApiObjectNode */
/** @typedef {import('./types').ApiArrayNode} ApiArrayNode */
/** @typedef {import('./types').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('./types').ApiArrayShape} ApiArrayShape */
/** @typedef {import('./types').ApiTupleShape} ApiTupleShape */
/** @typedef {import('./types').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('./types').ApiSecuritySettings} ApiSecuritySettings */
/** @typedef {import('./types').ApiSecurityOAuth1Settings} ApiSecurityOAuth1Settings */
/** @typedef {import('./types').ApiSecurityOAuth2Settings} ApiSecurityOAuth2Settings */
/** @typedef {import('./types').ApiSecurityApiKeySettings} ApiSecurityApiKeySettings */
/** @typedef {import('./types').ApiSecurityHttpSettings} ApiSecurityHttpSettings */
/** @typedef {import('./types').ApiSecurityOpenIdConnectSettings} ApiSecurityOpenIdConnectSettings */
/** @typedef {import('./types').ApiSecurityOAuth2Flow} ApiSecurityOAuth2Flow */
/** @typedef {import('./types').ApiSecuritySettingsUnion} ApiSecuritySettingsUnion */
/** @typedef {import('./types').ApiSecurityScope} ApiSecurityScope */
/** @typedef {import('./types').ApiIriTemplateMapping} ApiIriTemplateMapping */
/** @typedef {import('./types').ApiCallback} ApiCallback */
/** @typedef {import('./types').ApiDomainProperty} ApiDomainProperty */
/** @typedef {import('./types').ApiCustomDomainProperty} ApiCustomDomainProperty */
/** @typedef {import('./types').ApiRecursiveShape} ApiRecursiveShape */
/** @typedef {import('./types').ApiTag} ApiTag */
/** @typedef {import('./types').ApiDataNodeUnion} ApiDataNodeUnion */
/** @typedef {import('./types').ApiDocumentSourceMaps} ApiDocumentSourceMaps */
/** @typedef {import('./types').ApiSynthesizedField} ApiSynthesizedField */
/** @typedef {import('./types').ApiParametrizedTrait} ApiParametrizedTrait */
/** @typedef {import('./types').ApiVariableValue} ApiVariableValue */
/** @typedef {import('./types').ApiAbstractDeclaration} ApiAbstractDeclaration */
/** @typedef {import('./amf').Server} Server */
/** @typedef {import('./amf').Parameter} Parameter */
/** @typedef {import('./amf').Shape} Shape */
/** @typedef {import('./amf').ScalarShape} ScalarShape */
/** @typedef {import('./amf').NodeShape} NodeShape */
/** @typedef {import('./amf').UnionShape} UnionShape */
/** @typedef {import('./amf').FileShape} FileShape */
/** @typedef {import('./amf').SchemaShape} SchemaShape */
/** @typedef {import('./amf').ArrayShape} ArrayShape */
/** @typedef {import('./amf').TupleShape} TupleShape */
/** @typedef {import('./amf').AnyShape} AnyShape */
/** @typedef {import('./amf').DomainElement} DomainElement */
/** @typedef {import('./amf').PropertyShape} PropertyShape */
/** @typedef {import('./amf').DataArrangeShape} DataArrangeShape */
/** @typedef {import('./amf').CreativeWork} CreativeWork */
/** @typedef {import('./amf').Example} Example */
/** @typedef {import('./amf').XMLSerializer} XMLSerializer */
/** @typedef {import('./amf').DataNode} DataNode */
/** @typedef {import('./amf').ScalarNode} ScalarNode */
/** @typedef {import('./amf').ArrayNode} ArrayNode */
/** @typedef {import('./amf').ObjectNode} ObjectNode */
/** @typedef {import('./amf').RecursiveShape} RecursiveShape */
/** @typedef {import('./amf').EndPoint} EndPoint */
/** @typedef {import('./amf').Operation} Operation */
/** @typedef {import('./amf').Callback} Callback */
/** @typedef {import('./amf').Request} Request */
/** @typedef {import('./amf').Response} Response */
/** @typedef {import('./amf').Payload} Payload */
/** @typedef {import('./amf').TemplatedLink} TemplatedLink */
/** @typedef {import('./amf').IriTemplateMapping} IriTemplateMapping */
/** @typedef {import('./amf').ParametrizedSecurityScheme} ParametrizedSecurityScheme */
/** @typedef {import('./amf').SecurityScheme} SecurityScheme */
/** @typedef {import('./amf').SecurityRequirement} SecurityRequirement */
/** @typedef {import('./amf').Settings} Settings */
/** @typedef {import('./amf').OAuth1Settings} OAuth1Settings */
/** @typedef {import('./amf').OAuth2Settings} OAuth2Settings */
/** @typedef {import('./amf').OAuth2Flow} OAuth2Flow */
/** @typedef {import('./amf').Scope} Scope */
/** @typedef {import('./amf').ApiKeySettings} ApiKeySettings */
/** @typedef {import('./amf').HttpSettings} HttpSettings */
/** @typedef {import('./amf').OpenIdConnectSettings} OpenIdConnectSettings */
/** @typedef {import('./amf').Tag} Tag */
/** @typedef {import('./amf').DocumentSourceMaps} DocumentSourceMaps */
/** @typedef {import('./amf').SynthesizedField} SynthesizedField */
/** @typedef {import('./amf').ParametrizedTrait} ParametrizedTrait */
/** @typedef {import('./amf').VariableValue} VariableValue */
/** @typedef {import('./amf').AbstractDeclaration} AbstractDeclaration */

/**
 * A class that takes AMF's ld+json model and outputs JavaScript interface of it.
 */
export class AmfSerializer extends AmfHelperMixin(Object) {
  /**
   * @param {DomainElement=} graph Optional AMF generated graph model.
   */
  constructor(graph) {
    super();
    if (graph) {
      this.amf = graph;
    }
  }

  /**
   * @param {Server} object The AMF Server to serialize.
   * @returns {ApiServer} Serialized Server
   */
  server(object) {
    const url = this._getValue(object, this.ns.aml.vocabularies.core.urlTemplate) || '';
    const result = /** @type ApiServer */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      url,
      variables: [],
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const variables = /** @type Parameter[] */ (object[this._getAmfKey(this.ns.aml.vocabularies.apiContract.variable)]);
    if (Array.isArray(variables) && variables.length) {
      result.variables = variables.map((p) => this.parameter(p));
    }
    const protocol = /** @type string */ (this._getValue(object, this.ns.aml.vocabularies.apiContract.protocol));
    const protocolVersion = /** @type string */ (this._getValue(object, this.ns.aml.vocabularies.apiContract.protocolVersion));
    if (protocol) {
      result.protocol = protocol;
    }
    if (protocolVersion) {
      result.protocolVersion = protocolVersion;
    }
    const security = /** @type SecurityRequirement */ (object[this._getAmfKey(this.ns.aml.vocabularies.security.security)]);
    if (Array.isArray(security) && security.length) {
      result.security = security.map((p) => this.securityRequirement(p));
    }
    return result;
  }

  /**
   * @param {Parameter} object The Parameter to serialize.
   * @returns {ApiParameter} Serialized Parameter
   */
  parameter(object) {
    const result = /** @type ApiParameter */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      payloads: [],
      examples: [],
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const paramName = this._getValue(object, ns.aml.vocabularies.apiContract.paramName);
    if (paramName && typeof paramName === 'string') {
      result.paramName = paramName;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const required = this._getValue(object, ns.aml.vocabularies.apiContract.required);
    if (typeof required === 'boolean') {
      result.required = required;
    }
    const allowEmptyValue = this._getValue(object, ns.aml.vocabularies.apiContract.allowEmptyValue);
    if (typeof allowEmptyValue === 'boolean') {
      result.allowEmptyValue = allowEmptyValue;
    }
    const deprecated = this._getValue(object, ns.aml.vocabularies.document.deprecated);
    if (typeof deprecated === 'boolean') {
      result.deprecated = deprecated;
    }
    const explode = this._getValue(object, ns.aml.vocabularies.apiContract.explode);
    if (typeof explode === 'boolean') {
      result.explode = explode;
    }
    const allowReserved = this._getValue(object, ns.aml.vocabularies.apiContract.allowReserved);
    if (typeof allowReserved === 'boolean') {
      result.allowReserved = allowReserved;
    }
    const style = this._getValue(object, ns.aml.vocabularies.apiContract.style);
    if (style && typeof style === 'string') {
      result.style = style;
    }
    const binding = this._getValue(object, ns.aml.vocabularies.apiContract.binding);
    if (binding && typeof binding === 'string') {
      result.binding = binding;
    }
    const schemas = object[this._getAmfKey(ns.aml.vocabularies.shapes.schema)];
    if (Array.isArray(schemas) && schemas.length) {
      const [schema] = schemas;
      result.schema = this.unknownShape(schema);
    }
    const payloads = object[this._getAmfKey(ns.aml.vocabularies.apiContract.payload)];
    if (Array.isArray(payloads) && payloads.length) {
      result.payloads = payloads.map(p => this.payload(p));
    }
    const examples = object[this._getAmfKey(ns.aml.vocabularies.apiContract.examples)];
    if (Array.isArray(examples) && examples.length) {
      result.examples = examples.map(e => this.example(e));
    }
    return result;
  }

  /**
   * @param {Shape} object 
   * @returns {ApiShapeUnion}
   */
  unknownShape(object) {
    let types = object['@type'];
    if (Array.isArray(types)) {
      types = types.map(this[expandKey].bind(this));
    }
    const { ns } = this;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this.scalarShape(/** @type ScalarShape */ (object));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this.nodeShape(/** @type NodeShape */ (object));
    }
    if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      return this.unionShape(/** @type UnionShape */ (object));
    }
    if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
      return this.fileShape(/** @type FileShape */ (object));
    }
    if (types.includes(ns.aml.vocabularies.shapes.SchemaShape)) {
      return this.schemaShape(/** @type SchemaShape */ (object));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return this.arrayShape(/** @type ArrayShape */ (object));
    }
    if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
      return this.tupleShape(/** @type TupleShape */ (object));
    }
    if (types.includes(ns.aml.vocabularies.shapes.RecursiveShape)) {
      return this.recursiveShape(/** @type RecursiveShape */ (object));
    }
    // recursiveShape
    return this.anyShape(/** @type AnyShape */ (object));
  }

  /**
   * @param {DomainElement} object 
   * @returns {boolean}
   */
  isLink(object) {
    return !!this._getLinkValue(object, this.ns.aml.vocabularies.document.linkTarget);
  }

  /**
   * @param {DomainElement} object 
   * @returns {DomainElement|undefined}
   */
  getLinkTarget(object) {
    const id = this._getLinkValue(object, this.ns.aml.vocabularies.document.linkTarget);
    return this[findAmfType](id);
  }

  /**
   * @param {Shape} object 
   * @returns {ApiShape}
   */
  shape(object) {
    this._resolve(object);
    /** @type string */
    let linkLabel;
    let target = object;
    if (this.isLink(target)) {
      linkLabel = /** @type string */ (this._getValue(target, this.ns.aml.vocabularies.document.linkLabel));
      const id = this._getLinkValue(target, this.ns.aml.vocabularies.document.linkTarget);
      const value = /** @type Shape */ (this[findAmfType](id));
      if (value) {
        target = value;
      }
    }
    const result = /** @type ApiShape */ ({
      id: target['@id'],
      types: target['@type'].map(this[expandKey].bind(this)),
      values: [],
      inherits: [],
      or: [],
      and: [],
      xone: [],
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    if (linkLabel) {
      result.linkLabel = linkLabel;
    }
    const { ns } = this;
    const name = this._getValue(target, ns.w3.shacl.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const displayName = this._getValue(target, ns.aml.vocabularies.core.displayName);
    if (displayName && typeof displayName === 'string') {
      result.displayName = displayName;
    } else {
      const coreName = this._getValue(target, ns.aml.vocabularies.core.name);
      if (coreName && typeof coreName === 'string') {
        result.displayName = coreName;
      }
    }
    const description = this._getValue(target, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const defaultValueStr = this._getValue(target, ns.w3.shacl.defaultValueStr);
    if (defaultValueStr && typeof defaultValueStr === 'string') {
      result.defaultValueStr = defaultValueStr;
    }

    const deprecated = this._getValue(target, ns.aml.vocabularies.shapes.deprecated);
    if (typeof deprecated === 'boolean') {
      result.deprecated = deprecated;
    }
    const readOnly = this._getValue(target, ns.aml.vocabularies.shapes.readOnly);
    if (typeof readOnly === 'boolean') {
      result.readOnly = readOnly;
    }
    const writeOnly = this._getValue(target, ns.aml.vocabularies.shapes.writeOnly);
    if (typeof writeOnly === 'boolean') {
      result.writeOnly = writeOnly;
    }
    const defValue = target[this._getAmfKey(ns.w3.shacl.defaultValue)];
    if (Array.isArray(defValue) && defValue.length) {
      result.defaultValue = this.unknownDataNode(defValue[0]);
    }
    // @TODO:
    // if (Array.isArray(inherits) && inherits.length) {
    //   result.inherits = inherits.map((item) => this.unknownShape(item));
    // }
    const orKey = this._getAmfKey(ns.w3.shacl.or);
    const orGroup = /** @type Shape[] */ (target[orKey]);
    if (Array.isArray(orGroup) && orGroup.length) {
      result.or = orGroup.map((item) => this.unknownShape(item));
    }
    const andKey = this._getAmfKey(ns.w3.shacl.and);
    const andGroup = /** @type Shape[] */ (target[andKey]);
    if (Array.isArray(andGroup) && andGroup.length) {
      result.and = andGroup.map((item) => this.unknownShape(item));
    }
    const xoneKey = this._getAmfKey(ns.w3.shacl.xone);
    const xone = /** @type Shape[] */ (target[xoneKey]);
    if (Array.isArray(xone) && xone.length) {
      result.xone = xone.map((item) => this.unknownShape(item));
    }
    const valuesList = target[this._getAmfKey(ns.w3.shacl.in)];
    if (Array.isArray(valuesList) && valuesList.length) {
      const [values] = valuesList;
      const prefix = this.ns.w3.rdfSchema.toString();
      const prefixCompact = this._getAmfKey(prefix);
      Object.keys(values).forEach((key) => {
        if (key.startsWith(prefix) || key.startsWith(prefixCompact)) {
          let value = values[key];
          if (Array.isArray(value)) {
            [value] = value;
          }
          const processed = this.unknownDataNode(value);
          result.values.push(processed);
        }
      });
    }
    const notKey = this._getAmfKey(ns.w3.shacl.not);
    let not = /** @type Shape */ (target[notKey]);
    if (not) {
      if (Array.isArray(not)) {
        [not] = not;
      }
      result.not = this.unknownShape(not);
    }
    return result;
  }

  /**
   * @param {AnyShape} object
   * @returns {ApiAnyShape}
   */
  anyShape(object) {
    let target = object;
    const result = /** @type ApiAnyShape */ (this.shape(target));
    if (this.isLink(target)) {
      const value = /** @type Shape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    result.examples = [];

    const { ns } = this;
    const examples = target[this._getAmfKey(ns.aml.vocabularies.apiContract.examples)];
    if (Array.isArray(examples) && examples.length) {
      result.examples = examples.map((item) => this.example(item));
    }
    const docs = target[this._getAmfKey(ns.aml.vocabularies.core.documentation)];
    if (Array.isArray(docs) && docs.length) {
      const [documentation] = docs;
      result.documentation = this.documentation(documentation);
    }
    const xml = target[this._getAmfKey(ns.aml.vocabularies.shapes.xmlSerialization)];
    if (Array.isArray(xml) && xml.length) {
      result.xmlSerialization = this.xmlSerializer(xml[0]);
    }
    return result;
  }

  /**
   * @param {ScalarShape} object
   * @returns {ApiScalarShape}
   */
  scalarShape(object) {
    let target = object;
    const result = /** @type ApiScalarShape */ (this.anyShape(target));
    if (this.isLink(target)) {
      const value = /** @type ScalarShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    const { ns } = this;
    const pattern = this._getValue(target, ns.w3.shacl.pattern);
    if (pattern && typeof pattern === 'string') {
      result.pattern = pattern;
    }
    const dataType = this._getLinkValue(target, ns.w3.shacl.datatype);
    if (dataType && typeof dataType === 'string') {
      result.dataType = dataType;
    }
    const format = this._getValue(target, ns.aml.vocabularies.shapes.format);
    if (format && typeof format === 'string') {
      result.format = format;
    }
    const multipleOf = this._getValue(target, ns.aml.vocabularies.shapes.multipleOf);
    if (typeof multipleOf === 'number') {
      result.multipleOf = multipleOf;
    }
    const minInclusive = this._getValue(target, ns.w3.shacl.minInclusive);
    if (typeof minInclusive === 'number') {
      result.minimum = minInclusive;
      result.exclusiveMinimum = false;
    }
    const maxInclusive = this._getValue(target, ns.w3.shacl.maxInclusive);
    if (typeof maxInclusive === 'number') {
      result.maximum = maxInclusive;
      result.exclusiveMaximum = false;
    }
    const minLength = this._getValue(target, ns.w3.shacl.minLength);
    if (typeof minLength === 'number') {
      result.minLength = minLength;
    }
    const maxLength = this._getValue(target, ns.w3.shacl.maxLength);
    if (typeof maxLength === 'number') {
      result.maxLength = maxLength;
    }
    return result;
  }

  /**
   * @param {NodeShape} object The NodeShape to serialize
   * @returns {ApiNodeShape}
   */
  nodeShape(object) {
    let target = object;
    const result = /** @type ApiNodeShape */ (this.anyShape(target));
    if (this.isLink(target)) {
      const value = /** @type NodeShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    const { ns } = this;
    const discriminator = this._getValue(target, ns.aml.vocabularies.shapes.discriminator);
    if (discriminator && typeof discriminator === 'string') {
      result.discriminator = discriminator;
    }
    const discriminatorValue = this._getValue(target, ns.aml.vocabularies.shapes.discriminatorValue);
    if (discriminatorValue && typeof discriminatorValue === 'string') {
      result.discriminatorValue = discriminatorValue;
    }
    const closed = this._getValue(target, ns.w3.shacl.closed);
    if (typeof closed === 'boolean') {
      result.closed = closed;
    }

    result.customShapeProperties = [];
    result.customShapePropertyDefinitions = [];
    result.dependencies = [];
    // todo: not sure what the keys are.
    // if (!minProperties.isNull) {
    //   result.minProperties = minProperties.value();
    // }
    // if (!maxProperties.isNull) {
    //   result.maxProperties = maxProperties.value();
    // }
    // if (Array.isArray(customShapeProperties) && customShapeProperties.length) {
    //   result.customShapeProperties = customShapeProperties.map((item) => item.id);
    // } else {
    //   result.customShapeProperties = [];
    // }
    // if (Array.isArray(customShapePropertyDefinitions) && customShapePropertyDefinitions.length) {
    //   result.customShapePropertyDefinitions = customShapePropertyDefinitions.map((item) => item.id);
    // } else {
    //   result.customShapePropertyDefinitions = [];
    // }
    const properties = /** @type PropertyShape[] */ (target[this._getAmfKey(ns.w3.shacl.property)]);
    if (Array.isArray(properties) && properties.length) {
      result.properties = properties.map((item) => this.propertyShape(item));
    } else {
      result.properties = [];
    }
    // if (Array.isArray(dependencies) && dependencies.length) {
    //   result.dependencies = dependencies.map((item) => item.id);
    // } else {
    //   result.dependencies = [];
    // }
    return result;
  }

  /**
   * @param {PropertyShape} object 
   * @returns {ApiPropertyShape}
   */
  propertyShape(object) {
    let target = object;
    const result = /** @type ApiPropertyShape */ (this.shape(target));
    if (this.isLink(target)) {
      const value = /** @type PropertyShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    const { ns } = this;
    const path = this._getLinkValue(target, ns.w3.shacl.path);
    if (path && typeof path === 'string') {
      result.path = path;
    }
    const minCount = this._getValue(target, ns.w3.shacl.minCount);
    if (typeof minCount === 'number') {
      result.minCount = minCount;
    }
    const maxCount = this._getValue(target, ns.w3.shacl.maxCount);
    if (typeof maxCount === 'number') {
      result.maxCount = maxCount;
    }
    // if (!patternName.isNullOrEmpty) {
    //   result.patternName = patternName.value();
    // }
    
    const ranges = /** @type Shape[] */ (target[this._getAmfKey(ns.aml.vocabularies.shapes.range)]);
    if (Array.isArray(ranges) && ranges.length) {
      const [range] = ranges;
      result.range = this.unknownShape(range);
    }
    return result;
  }

  /**
   * @param {UnionShape} object
   * @returns {ApiUnionShape}
   */
  unionShape(object) {
    const anyOf = /** @type Shape[] */ (object[this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf)]);
    const result = /** @type ApiUnionShape */ (this.anyShape(object));
    if (Array.isArray(anyOf) && anyOf.length) {
      result.anyOf = anyOf.map((shape) => this.unknownShape(shape));
    } else {
      result.anyOf = [];
    }
    return result;
  }

  /**
   * @param {FileShape} object
   * @returns {ApiFileShape}
   */
  fileShape(object) {
    let target = object;
    const result = /** @type ApiFileShape */ (this.anyShape(target));
    if (this.isLink(target)) {
      const value = /** @type FileShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    const { ns } = this;
    const pattern = this._getValue(target, ns.w3.shacl.pattern);
    if (pattern && typeof pattern === 'string') {
      result.pattern = pattern;
    }
    const fileTypes = /** @type string[] */ (this._getValueArray(target, ns.aml.vocabularies.shapes.fileType));
    if (Array.isArray(fileTypes) && fileTypes.length) {
      result.fileTypes = fileTypes;
    }
    const minLength = this._getValue(target, ns.w3.shacl.minLength);
    if (typeof minLength === 'number') {
      result.minLength = minLength;
    }
    const maxLength = this._getValue(target, ns.w3.shacl.maxLength);
    if (typeof maxLength === 'number') {
      result.maxLength = maxLength;
    }
    const minInclusive = this._getValue(target, ns.w3.shacl.minInclusive);
    if (typeof minInclusive === 'number') {
      result.minimum = minInclusive;
      result.exclusiveMinimum = false;
    }
    const maxInclusive = this._getValue(target, ns.w3.shacl.maxInclusive);
    if (typeof maxInclusive === 'number') {
      result.maximum = maxInclusive;
      result.exclusiveMaximum = false;
    }
    const format = this._getValue(target, ns.aml.vocabularies.shapes.format);
    if (format && typeof format === 'string') {
      result.format = format;
    }
    const multipleOf = this._getValue(target, ns.aml.vocabularies.shapes.multipleOf);
    if (typeof multipleOf === 'number') {
      result.multipleOf = multipleOf;
    }
    return result;
  }

  /**
   * @param {SchemaShape} object
   * @returns {ApiSchemaShape}
   */
  schemaShape(object) {
    let target = object;
    const result = /** @type ApiSchemaShape */ (this.anyShape(target));
    if (this.isLink(target)) {
      const value = /** @type SchemaShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    const { ns } = this;
    const mediaType = this._getValue(target, ns.aml.vocabularies.core.mediaType);
    if (mediaType && typeof mediaType === 'string') {
      result.mediaType = mediaType;
    }
    const raw = this._getValue(target, ns.aml.vocabularies.document.raw);
    if (raw && typeof raw === 'string') {
      result.raw = raw;
    }
    return result;
  }

  /**
   * @param {RecursiveShape} object
   * @returns {ApiRecursiveShape}
   */
  recursiveShape(object) {
    let target = object;
    const result = /** @type ApiRecursiveShape */ (this.shape(target));
    if (this.isLink(target)) {
      const value = /** @type RecursiveShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    const { ns } = this;
    const fp = this._getLinkValue(object, ns.aml.vocabularies.shapes.fixPoint);
    if (fp && typeof fp === 'string') {
      result.fixPoint = fp;
    }
    return result;
  }

  /**
   * @param {DataArrangeShape} object
   * @returns {ApiDataArrangeShape}
   */
  dataArrangeShape(object) {
    let target = object;
    const result = /** @type ApiDataArrangeShape */ (this.anyShape(target));
    if (this.isLink(target)) {
      const value = /** @type DataArrangeShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    // const { ns } = this;
    // const { minItems, maxItems, uniqueItems } = object;
    // if (!minItems.isNull) {
    //   result.minItems = minItems.value();
    // }
    // if (!maxItems.isNull) {
    //   result.maxItems = maxItems.value();
    // }
    // if (!uniqueItems.isNull) {
    //   result.uniqueItems = uniqueItems.value();
    // }
    return result;
  }

  /**
   * @param {ArrayShape} object
   * @returns {ApiArrayShape}
   */
  arrayShape(object) {
    let target = object;
    const result = /** @type ApiArrayShape */ (this.dataArrangeShape(target));
    if (this.isLink(target)) {
      const value = /** @type ArrayShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }

    const items = target[this._getAmfKey(this.ns.aml.vocabularies.shapes.items)];
    if (Array.isArray(items) && items.length) {
      const [item] = items;
      result.items = this.unknownShape(item);
    }
    return result;
  }

  /**
   * @param {TupleShape} object
   * @returns {ApiTupleShape}
   */
  tupleShape(object) {
    let target = object;
    const result = /** @type ApiTupleShape */ (this.dataArrangeShape(target));
    if (this.isLink(target)) {
      const value = /** @type TupleShape */ (this.getLinkTarget(target));
      if (value) {
        target = value;
      }
    }
    const items = target[this._getAmfKey(this.ns.aml.vocabularies.shapes.items)];
    if (Array.isArray(items) && items.length) {
      result.items = items.map((shape) => this.unknownShape(shape));
    } else {
      result.items = [];
    }
    // const { items, additionalItems } = target;
    // if (!additionalItems.isNull) {
    //   result.additionalItems = additionalItems.value();
    // }
    return result;
  }

  /**
   * @param {CreativeWork} object The CreativeWork to serialize.
   * @returns {ApiDocumentation} Serialized CreativeWork
   */
  documentation(object) {
    const result = /** @type ApiDocumentation */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const url = this._getLinkValue(object, this.ns.aml.vocabularies.core.url);
    if (url && typeof url === 'string') {
      result.url = url;
    }
    const description = this._getValue(object, this.ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const title = this._getValue(object, this.ns.aml.vocabularies.core.title);
    if (title && typeof title === 'string') {
      result.title = title;
    }
    return result;
  }

  /**
   * @param {Example} object The Example to serialize.
   * @returns {ApiExample} Serialized Example
   */
  example(object) {
    this._resolve(object);
    const result = /** @type ApiExample */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      strict: false,
    });
    const { ns } = this;
    const strict = this._getValue(object, ns.aml.vocabularies.document.strict);
    if (typeof strict === 'boolean') {
      result.strict = strict;
    }
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const displayName = this._getValue(object, ns.aml.vocabularies.core.displayName);
    if (displayName && typeof displayName === 'string') {
      result.displayName = displayName;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const raw = this._getValue(object, ns.aml.vocabularies.document.raw);
    if (raw && typeof raw === 'string') {
      result.value = raw;
    }
    const location = this._getValue(object, ns.aml.vocabularies.document.location);
    if (location && typeof location === 'string') {
      result.location = location;
    }
    // if (!mediaType.isNullOrEmpty) {
    //   result.mediaType = mediaType.value();
    // }
    const structuredValue = object[this._getAmfKey(ns.aml.vocabularies.document.structuredValue)];
    if (Array.isArray(structuredValue) && structuredValue.length) {
      const [value] = structuredValue;
      result.structuredValue = this.unknownDataNode(value);
    }
    return result;
  }

  /**
   * @param {XMLSerializer} object
   * @returns {ApiXMLSerializer}
   */
  xmlSerializer(object) {
    const result = /** @type ApiXMLSerializer */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const xmlAttribute = this._getValue(object, ns.aml.vocabularies.shapes.xmlAttribute);
    if (typeof xmlAttribute === 'boolean') {
      result.attribute = xmlAttribute;
    }
    const wrapped = this._getValue(object, ns.aml.vocabularies.shapes.xmlWrapped);
    if (typeof wrapped === 'boolean') {
      result.wrapped = wrapped;
    }
    const name = this._getValue(object, ns.aml.vocabularies.shapes.xmlName);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const xmlNs = this._getValue(object, ns.aml.vocabularies.shapes.xmlNamespace);
    if (xmlNs && typeof xmlNs === 'string') {
      result.namespace = xmlNs;
    }
    const xmlPrefix = this._getValue(object, ns.aml.vocabularies.shapes.xmlPrefix);
    if (xmlPrefix && typeof xmlPrefix === 'string') {
      result.prefix = xmlPrefix;
    }
    return result;
  }

  /**
   * @param {DataNode} object
   * @returns {ApiDataNodeUnion}
   */
  unknownDataNode(object) {
    let types = object['@type'];
    if (Array.isArray(types)) {
      types = types.map(this[expandKey].bind(this));
    }
    const { ns } = this;
    if (types.includes(ns.aml.vocabularies.data.Scalar)) {
      return this.scalarNode(/** @type ScalarNode */(object));
    }
    if (types.includes(ns.aml.vocabularies.data.Object)) {
      return this.objectNode(/** @type ObjectNode */(object));
    }
    if (types.includes(ns.aml.vocabularies.data.Array)) {
      return this.arrayNode(/** @type ArrayNode */(object));
    }
    return undefined;
  }

  /**
   * @param {DataNode} object
   * @returns {ApiDataNode}
   */
  dataNode(object) {
    const result = /** @type ApiDataNode */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    return result;
  }

  /**
   * @param {ScalarNode} object
   * @returns {ApiScalarNode}
   */
  scalarNode(object) {
    const result = /** @type ApiScalarNode */ (this.dataNode(object));
    const { ns } = this;
    const value = this._getValue(object, ns.aml.vocabularies.data.value);
    if (value && typeof value === 'string') {
      result.value = value;
    }
    const dataType = this._getLinkValue(object, ns.w3.shacl.datatype);
    if (dataType && typeof dataType === 'string') {
      result.dataType = dataType;
    }
    return result;
  }

  /**
   * @param {ObjectNode} object
   * @returns {ApiObjectNode}
   */
  objectNode(object) {
    const result = /** @type ApiObjectNode */ (this.dataNode(object));
    result.properties = {};
    const prefix = this.ns.aml.vocabularies.data.toString();
    const prefixCompact = `${this._getAmfKey(prefix)}:`;
    Object.keys(object).forEach((key) => {
      if (key.startsWith(prefix) || key.startsWith(prefixCompact)) {
        let value = object[key];
        if (Array.isArray(value)) {
          [value] = value;
        }
        const name = key.replace(prefix, '').replace(prefixCompact, '');
        result.properties[name] = this.unknownDataNode(value);
      }
    });
    return result;
  }

  /**
   * @param {ArrayNode} object
   * @returns {ApiArrayNode}
   */
  arrayNode(object) {
    const result = /** @type ApiArrayNode */ (this.dataNode(object));
    result.members = [];
    const members = /** @type DataNode[] */ (this._computePropertyArray(object, this.ns.w3.rdfSchema.member));
    if (Array.isArray(members) && members.length) {
      result.members = members.map((item) => this.unknownDataNode(item));
    }
    return result;
  }

  /**
   * Adds the custom domain properties to the currently processed property, a.k.a annotations.
   * @param {DomainElement} object 
   * @returns {ApiCustomDomainProperty[]} The list of custom domain properties.
   */
  customDomainProperties(object) {
    const result = /** @type ApiCustomDomainProperty[] */ ([]);
    const ids = this._getLinkValues(object, this.ns.aml.vocabularies.document.customDomainProperties);
    if (Array.isArray(ids) && ids.length) {
      ids.forEach((id) => {
        const key = `amf://id${id}`;
        let value = /** @type DomainElement */ (object[id] || object[key]);
        if (!value) {
          return;
        }
        if (Array.isArray(value)) {
          [value] = value;
        }
        const cdp = /** @type ApiCustomDomainProperty */ (this.unknownDataNode(value));
        const extensionName = this._getValue(value, this.ns.aml.vocabularies.core.extensionName);
        if (extensionName && typeof extensionName === 'string') {
          cdp.extensionName = extensionName;
        }
        result.push(cdp);
      });
    }
    return result;
  }

  /**
   * @param {EndPoint} object The EndPoint to serialize.
   * @returns {ApiEndPoint} Serialized EndPoint
   */
  endPoint(object) {
    const result = /** @type ApiEndPoint */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      path: '',
      operations: [],
      parameters: [],
      payloads: [],
      servers: [],
      security: [],
    });
    const { ns } = this;
    const path = this._getValue(object, ns.aml.vocabularies.apiContract.path);
    if (path && typeof path === 'string') {
      result.path = path;
    }
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const summary = this._getValue(object, ns.aml.vocabularies.core.summary);
    if (summary && typeof summary === 'string') {
      result.summary = summary;
    }
    const operations = this[getArrayItems](object, ns.aml.vocabularies.apiContract.supportedOperation);
    if (Array.isArray(operations) && operations.length) {
      result.operations = operations.map(i => this.operation(/** @type Operation */ (i)));
    }
    const parameters = this[getArrayItems](object, ns.aml.vocabularies.apiContract.parameter);
    if (Array.isArray(parameters) && parameters.length) {
      result.parameters = parameters.map(i => this.parameter(i));
    }
    const payloads = this[getArrayItems](object, ns.aml.vocabularies.apiContract.payload);
    if (Array.isArray(payloads) && payloads.length) {
      result.payloads = payloads.map(i => this.payload(/** @type Payload */(i)));
    }
    const servers = this[getArrayItems](object, ns.aml.vocabularies.apiContract.server);
    if (Array.isArray(servers) && servers.length) {
      result.servers = servers.map(i => this.server(i));
    }
    const security = this[getArrayItems](object, ns.aml.vocabularies.security.security);
    if (Array.isArray(security) && security.length) {
      result.security = security.map(i => this.securityRequirement(i));
    }
    return result;
  }

  /**
   * @param {Operation} object The Operation to serialize.
   * @returns {ApiOperation} Serialized Operation
   */
  operation(object) {
    const result = /** @type ApiOperation */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      method: '',
      deprecated: false,
      callbacks: [],
      responses: [],
      servers: [],
      security: [],
      accepts: [],
      schemes: [],
      contentType: [],
      tags: [],
      traits: [],
    });
    const { ns } = this;
    const method = this._getValue(object, ns.aml.vocabularies.apiContract.method);
    if (method && typeof method === 'string') {
      result.method = method;
    }
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const summary = this._getValue(object, ns.aml.vocabularies.apiContract.guiSummary);
    if (summary && typeof summary === 'string') {
      result.summary = summary;
    }
    const deprecated = this._getValue(object, ns.aml.vocabularies.core.deprecated);
    if (typeof deprecated === 'boolean') {
      result.deprecated = deprecated;
    }
    const operationId = this._getValue(object, ns.aml.vocabularies.apiContract.operationId);
    if (operationId && typeof operationId === 'string') {
      result.operationId = operationId;
    }
    const accepts = /** @type string[] */ (this._getValueArray(object, ns.aml.vocabularies.apiContract.accepts));
    if (Array.isArray(accepts)) {
      result.accepts = accepts;
    }
    const schemes = /** @type string[] */ (this._getValueArray(object, ns.aml.vocabularies.apiContract.scheme));
    if (Array.isArray(schemes)) {
      result.schemes = schemes;
    }
    const contentType = /** @type string[] */ (this._getValueArray(object, ns.aml.vocabularies.apiContract.contentType));
    if (Array.isArray(contentType)) {
      result.contentType = contentType;
    }

    let expects = object[this._getAmfKey(ns.aml.vocabularies.apiContract.expects)];
    if (expects) {
      if (Array.isArray(expects)) {
        [expects] = expects;
      }
      result.request = this.request(expects);
    }
    let documentation = object[this._getAmfKey(ns.aml.vocabularies.core.documentation)];
    if (documentation) {
      if (Array.isArray(documentation)) {
        [documentation] = documentation;
      }
      result.documentation = this.documentation(documentation);
    }
    const responses = object[this._getAmfKey(ns.aml.vocabularies.apiContract.returns)];
    if (Array.isArray(responses)) {
      result.responses = responses.map(r => this.response(r));
    }
    const callbacks = object[this._getAmfKey(ns.aml.vocabularies.apiContract.callback)];
    if (Array.isArray(callbacks)) {
      result.callbacks = callbacks.map(c => this.callback(c));
    }
    const servers = object[this._getAmfKey(ns.aml.vocabularies.apiContract.server)];
    if (Array.isArray(servers)) {
      result.servers = servers.map(s => this.server(s));
    }
    const security = object[this._getAmfKey(ns.aml.vocabularies.security.security)];
    if (Array.isArray(security)) {
      result.security = security.map(s => this.securityRequirement(s));
    }
    const tags = object[this._getAmfKey(ns.aml.vocabularies.apiContract.tag)];
    if (Array.isArray(tags) && tags.length) {
      result.tags = tags.map(s => this.tag(s));
    }
    const traits = object[this._getAmfKey(ns.aml.vocabularies.document.extends)];
    if (Array.isArray(traits) && traits.length) {
      result.traits = traits.map(t => this.parametrizedTrait(t));
    }
    return result;
  }

  /**
   * @param {Tag} object 
   * @returns {ApiTag}
   */
  tag(object) {
    const result = /** @type ApiTag */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      name: '',
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    return result;
  }

  /**
   * @param {Callback} object
   * @returns {ApiCallback}
   */
  callback(object) {
    const result = /** @type ApiCallback */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const expression = this._getValue(object, ns.aml.vocabularies.apiContract.expression);
    if (expression && typeof expression === 'string') {
      result.expression = expression;
    }
    let endpoint = object[this._getAmfKey(ns.aml.vocabularies.apiContract.endpoint)];
    if (endpoint) {
      if (Array.isArray(endpoint)) {
        [endpoint] = endpoint;
      }
      result.endpoint = this.endPoint(endpoint);
    }
    return result;
  }

  /**
   * @param {Request} object The API request to serialize.
   * @returns {ApiRequest} Serialized API request
   */
  request(object) {
    const result = /** @type ApiRequest */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      required: false,
      headers: [],
      queryParameters: [],
      payloads: [],
      uriParameters: [],
      cookieParameters: [],
    });
    const { ns } = this;
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const required = this._getValue(object, ns.aml.vocabularies.apiContract.required);
    if (required && typeof required === 'boolean') {
      result.required = required;
    }
    let queryString = object[this._getAmfKey(ns.aml.vocabularies.apiContract.queryString)];
    if (queryString) {
      if (Array.isArray(queryString)) {
        [queryString] = queryString;
      }
      result.queryString = this.unknownShape(queryString);
    }
    const headers = this[getArrayItems](object, ns.aml.vocabularies.apiContract.header);
    if (Array.isArray(headers) && headers.length) {
      result.headers = headers.map(p => this.parameter(p));
    }
    const queryParameters = this[getArrayItems](object, ns.aml.vocabularies.apiContract.parameter);
    if (Array.isArray(queryParameters) && queryParameters.length) {
      result.queryParameters = queryParameters.map(p => this.parameter(p));
    }
    const uriParameters = this[getArrayItems](object, ns.aml.vocabularies.apiContract.uriParameter);
    if (Array.isArray(uriParameters) && uriParameters.length) {
      result.uriParameters = uriParameters.map(p => this.parameter(p));
    }
    const cookieParameters = this[getArrayItems](object, ns.aml.vocabularies.apiContract.cookieParameter);
    if (Array.isArray(cookieParameters) && cookieParameters.length) {
      result.cookieParameters = cookieParameters.map(p => this.parameter(p));
    }
    const payloads = this[getArrayItems](object, ns.aml.vocabularies.apiContract.payload);
    if (Array.isArray(payloads) && payloads.length) {
      result.payloads = payloads.map(p => this.payload(/** @type Payload */ (p)));
    }
    return result;
  }

  /**
   * @param {Response} object The Response to serialize.
   * @returns {ApiResponse} Serialized Response
   */
  response(object) {
    const result = /** @type ApiResponse */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      headers: [],
      payloads: [],
      examples: [],
      links: [],
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const statusCode = this._getValue(object, ns.aml.vocabularies.apiContract.statusCode);
    if (statusCode && typeof statusCode === 'string') {
      result.statusCode = statusCode;
    }
    const headers = this[getArrayItems](object, ns.aml.vocabularies.apiContract.header);
    if (Array.isArray(headers) && headers.length) {
      result.headers = headers.map(p => this.parameter(p));
    }
    const payloads = this[getArrayItems](object, ns.aml.vocabularies.apiContract.payload);
    if (Array.isArray(payloads) && payloads.length) {
      result.payloads = payloads.map(p => this.payload(/** @type Payload */(p)));
    }
    const examples = object[this._getAmfKey(ns.aml.vocabularies.apiContract.examples)];
    if (Array.isArray(examples) && examples.length) {
      result.examples = examples.map(e => this.example(e));
    }
    const links = object[this._getAmfKey(ns.aml.vocabularies.apiContract.link)];
    if (Array.isArray(links) && links.length) {
      result.links = links.map(p => this.templatedLink(p));
    }
    return result;
  }

  /**
   * @param {Payload} object The Payload to serialize.
   * @returns {ApiPayload} Serialized Payload
   */
  payload(object) {
    const result = /** @type ApiPayload */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      examples: [],
      // encoding: [],
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const mediaType = this._getValue(object, ns.aml.vocabularies.core.mediaType);
    if (mediaType && typeof mediaType === 'string') {
      result.mediaType = mediaType;
    }
    let schema = object[this._getAmfKey(ns.aml.vocabularies.shapes.schema)];
    if (schema) {
      if (Array.isArray(schema)) {
        [schema] = schema;
      }
      result.schema = this.unknownShape(schema);
    }
    const examples = object[this._getAmfKey(ns.aml.vocabularies.apiContract.examples)];
    if (Array.isArray(examples) && examples.length) {
      result.examples = examples.map(e => this.example(e));
    }
    // if (Array.isArray(encoding) && encoding.length) {
    //   result.encoding = encoding.map((p) => p.id);
    // }
    return result;
  }

  /**
   * @param {TemplatedLink} object The TemplatedLink to serialize.
   * @returns {ApiTemplatedLink} Serialized TemplatedLink
   */
  templatedLink(object) {
    const result = /** @type ApiTemplatedLink */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const operationId = this._getValue(object, ns.aml.vocabularies.apiContract.operationId);
    if (operationId && typeof operationId === 'string') {
      result.operationId = operationId;
    }
    let server = object[this._getAmfKey(ns.aml.vocabularies.apiContract.server)];
    if (server) {
      if (Array.isArray(server)) {
        [server] = server;
      }
      result.server = this.server(server);
    }
    let mapping = object[this._getAmfKey(ns.aml.vocabularies.apiContract.mapping)];
    if (mapping) {
      if (Array.isArray(mapping)) {
        [mapping] = mapping;
      }
      result.mapping = this.iriTemplateMapping(mapping);
    }
    // if (!template.isNullOrEmpty) {
    //   result.template = template.value();
    // }
    // if (!requestBody.isNullOrEmpty) {
    //   result.requestBody = requestBody.value();
    // }
    return result;
  }

  /**
   * @param {IriTemplateMapping} object 
   * @returns {ApiIriTemplateMapping}
   */
  iriTemplateMapping(object) {
    const result = /** @type ApiIriTemplateMapping */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const templateVariable = this._getValue(object, ns.aml.vocabularies.apiContract.templateVariable);
    if (templateVariable && typeof templateVariable === 'string') {
      result.templateVariable = templateVariable;
    }
    const linkExpression = this._getValue(object, ns.aml.vocabularies.apiContract.linkExpression);
    if (linkExpression && typeof linkExpression === 'string') {
      result.linkExpression = linkExpression;
    }
    return result;
  }

  /**
   * @param {ParametrizedSecurityScheme} object The ParametrizedSecurityScheme to serialize.
   * @returns {ApiParametrizedSecurityScheme} Serialized ParametrizedSecurityScheme
   */
  parametrizedSecurityScheme(object) {
    const result = /** @type ApiParametrizedSecurityScheme */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    let scheme = object[this._getAmfKey(ns.aml.vocabularies.security.scheme)];
    if (scheme) {
      if (Array.isArray(scheme)) {
        [scheme] = scheme;
      }
      result.scheme = this.securityScheme(scheme);
    }
    let settings = object[this._getAmfKey(ns.aml.vocabularies.security.settings)];
    if (settings) {
      if (Array.isArray(settings)) {
        [settings] = settings;
      }
      result.settings = this.securitySettings(settings);
    }
    return result;
  }

  /**
   * @param {SecurityScheme} object The SecurityScheme to serialize.
   * @returns {ApiSecurityScheme} Serialized SecurityScheme
   */
  securityScheme(object) {
    const result = /** @type ApiSecurityScheme */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      headers: [],
      queryParameters: [],
      responses: [],
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const displayName = this._getValue(object, ns.aml.vocabularies.core.displayName);
    if (displayName && typeof displayName === 'string') {
      result.displayName = displayName;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const type = this._getValue(object, ns.aml.vocabularies.security.type);
    if (type && typeof type === 'string') {
      result.type = type;
    }
    let settings = object[this._getAmfKey(ns.aml.vocabularies.security.settings)];
    if (settings) {
      if (Array.isArray(settings)) {
        [settings] = settings;
      }
      result.settings = this.securitySettings(settings);
    }
    let queryString = object[this._getAmfKey(ns.aml.vocabularies.apiContract.queryString)];
    if (queryString) {
      if (Array.isArray(queryString)) {
        [queryString] = queryString;
      }
      result.queryString = this.unknownShape(queryString);
    }
    const headers = this[getArrayItems](object, ns.aml.vocabularies.apiContract.header);
    if (Array.isArray(headers) && headers.length) {
      result.headers = headers.map(p => this.parameter(p));
    }
    const queryParameters = this[getArrayItems](object, ns.aml.vocabularies.apiContract.parameter);
    if (Array.isArray(queryParameters) && queryParameters.length) {
      result.queryParameters = queryParameters.map(p => this.parameter(p));
    }
    const responses = this[getArrayItems](object, ns.aml.vocabularies.apiContract.response);
    if (Array.isArray(responses) && responses.length) {
      result.responses = responses.map(p => this.response(/** @type Response */ (p)));
    }
    return result;
  }

  /**
   * @param {SecurityRequirement} object The SecurityRequirement to serialize.
   * @returns {ApiSecurityRequirement} Serialized SecurityRequirement
   */
  securityRequirement(object) {
    const result = /** @type ApiSecurityRequirement */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      schemes: [],
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const schemes = /** @type ParametrizedSecurityScheme[] */ (object[this._getAmfKey(ns.aml.vocabularies.security.schemes)]);
    if (Array.isArray(schemes) && schemes.length) {
      result.schemes = schemes.map(p => this.parametrizedSecurityScheme(p));
    }
    return result;
  }

  /**
   * @param {Settings} object 
   * @returns {ApiSecuritySettingsUnion}
   */
  securitySettings(object) {
    const { ns } = this;
    let types = object['@type'];
    if (Array.isArray(types)) {
      types = types.map(this[expandKey].bind(this));
    }
    if (types.includes(ns.aml.vocabularies.security.OAuth1Settings)) {
      return this.oAuth1Settings(/** @type OAuth1Settings */ (object));
    }
    if (types.includes(ns.aml.vocabularies.security.OAuth2Settings)) {
      return this.oAuth2Settings(/** @type OAuth2Settings */ (object));
    }
    if (types.includes(ns.aml.vocabularies.security.ApiKeySettings)) {
      return this.apiKeySettings(/** @type ApiKeySettings */ (object));
    }
    if (types.includes(ns.aml.vocabularies.security.HttpSettings)) {
      return this.httpSettings(/** @type HttpSettings */ (object));
    }
    if (types.includes(ns.aml.vocabularies.security.OpenIdConnectSettings)) {
      return this.openIdConnectSettings(/** @type OpenIdConnectSettings */ (object));
    }
    return this.settings(object);
  }

  /**
   * @param {Settings} object
   * @returns {ApiSecuritySettings}
   */
  settings(object) {
    const result = /** @type ApiSecuritySettings */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    // if (additionalProperties && additionalProperties.id) {
    //   result.additionalProperties = this.unknownDataNode(additionalProperties);
    // }
    return result;
  }

  /**
   * @param {OAuth1Settings} object 
   * @returns {ApiSecurityOAuth1Settings}
   */
  oAuth1Settings(object) {
    const result = /** @type ApiSecurityOAuth1Settings */ (this.settings(object));
    const { ns } = this;
    const authorizationUri = this._getValue(object, ns.aml.vocabularies.security.authorizationUri);
    if (authorizationUri && typeof authorizationUri === 'string') {
      result.authorizationUri = authorizationUri;
    }
    const requestTokenUri = this._getValue(object, ns.aml.vocabularies.security.requestTokenUri);
    if (requestTokenUri && typeof requestTokenUri === 'string') {
      result.requestTokenUri = requestTokenUri;
    }
    const tokenCredentialsUri = this._getValue(object, ns.aml.vocabularies.security.tokenCredentialsUri);
    if (tokenCredentialsUri && typeof tokenCredentialsUri === 'string') {
      result.tokenCredentialsUri = tokenCredentialsUri;
    }
    const signatures = /** @type string[] */ (this._getValueArray(object, ns.aml.vocabularies.security.signature));
    if (Array.isArray(signatures) && signatures.length) {
      result.signatures = signatures;
    } else {
      result.signatures = [];
    }
    return result;
  }

  /**
   * @param {OAuth2Settings} object 
   * @returns {ApiSecurityOAuth2Settings}
   */
  oAuth2Settings(object) {
    const result = /** @type ApiSecurityOAuth2Settings */ (this.settings(object));
    const { ns } = this;
    const grants = /** @type string[] */ (this._getValueArray(object, ns.aml.vocabularies.security.authorizationGrant));
    if (Array.isArray(grants) && grants.length) {
      result.authorizationGrants = grants;
    } else {
      result.authorizationGrants = [];
    }
    const flows = /** @type OAuth2Flow[] */ (object[this._getAmfKey(ns.aml.vocabularies.security.flows)]);
    if (Array.isArray(flows) && flows.length) {
      result.flows = flows.map((p) => this.oAuth2Flow(p));
    } else {
      result.flows = [];
    }
    return result;
  }

  /**
   * @param {OAuth2Flow} object 
   * @returns {ApiSecurityOAuth2Flow}
   */
  oAuth2Flow(object) {
    const result = /** @type ApiSecurityOAuth2Flow */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      scopes: [],
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const authorizationUri = this._getValue(object, ns.aml.vocabularies.security.authorizationUri);
    if (authorizationUri && typeof authorizationUri === 'string') {
      result.authorizationUri = authorizationUri;
    }
    const accessTokenUri = this._getValue(object, ns.aml.vocabularies.security.accessTokenUri);
    if (accessTokenUri && typeof accessTokenUri === 'string') {
      result.accessTokenUri = accessTokenUri;
    }
    const flow = this._getValue(object, ns.aml.vocabularies.security.flow);
    if (flow && typeof flow === 'string') {
      result.flow = flow;
    }
    const refreshUri = this._getValue(object, ns.aml.vocabularies.security.refreshUri);
    if (refreshUri && typeof refreshUri === 'string') {
      result.refreshUri = refreshUri;
    }
    const scopes = object[this._getAmfKey(ns.aml.vocabularies.security.scope)];
    if (Array.isArray(scopes) && scopes.length) {
      result.scopes = scopes.map((p) => this.scope(p));
    }
    return result;
  }

  /**
   * @param {Scope} object 
   * @returns {ApiSecurityScope}
   */
  scope(object) {
    const result = /** @type ApiSecurityScope */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    return result;
  }

  /**
   * @param {ApiKeySettings} object 
   * @returns {ApiSecurityApiKeySettings}
   */
  apiKeySettings(object) {
    const result = /** @type ApiSecurityApiKeySettings */ (this.settings(object));
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const inParam = this._getValue(object, ns.aml.vocabularies.security.in);
    if (inParam && typeof inParam === 'string') {
      result.in = inParam;
    }
    return result;
  }

  /**
   * @param {HttpSettings} object 
   * @returns {ApiSecurityHttpSettings}
   */
  httpSettings(object) {
    const result = /** @type ApiSecurityHttpSettings */ (this.settings(object));
    const { ns } = this;
    const scheme = this._getValue(object, ns.aml.vocabularies.security.scheme);
    if (scheme && typeof scheme === 'string') {
      result.scheme = scheme;
    }
    const bearerFormat = this._getValue(object, ns.aml.vocabularies.security.bearerFormat);
    if (bearerFormat && typeof bearerFormat === 'string') {
      result.bearerFormat = bearerFormat;
    }
    return result;
  }

  /**
   * @param {OpenIdConnectSettings} object 
   * @returns {ApiSecurityOpenIdConnectSettings}
   */
  openIdConnectSettings(object) {
    const result = /** @type ApiSecurityOpenIdConnectSettings */ (this.settings(object));
    const { ns } = this;
    const url = this._getValue(object, ns.aml.vocabularies.security.openIdConnectUrl);
    if (url && typeof url === 'string') {
      result.url = url;
    }
    return result;
  }

  /**
   * Serializes source maps, when available.
   * @param {DocumentSourceMaps} object 
   * @returns {ApiDocumentSourceMaps|undefined}
   */
  sourceMap(object) {
    const { ns } = this;
    let sm = object[this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources)];
    if (!sm) {
      return undefined;
    }
    if (Array.isArray(sm)) {
      [sm] = sm;
    }
    const result = /** @type ApiDocumentSourceMaps */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
    });
    const sf = sm[this._getAmfKey(ns.aml.vocabularies.docSourceMaps.synthesizedField)];
    if (Array.isArray(sf) && sf.length) {
      result.synthesizedField = sf.map(i => this.synthesizedField(i))
    }
    const lexical = sm[this._getAmfKey(ns.aml.vocabularies.docSourceMaps.lexical)];
    if (Array.isArray(lexical) && lexical.length) {
      result.lexical = lexical.map(i => this.synthesizedField(i))
    }
    const te = sm[this._getAmfKey(ns.aml.vocabularies.docSourceMaps.trackedElement)];
    if (Array.isArray(te) && te.length) {
      result.trackedElement = te.map(i => this.synthesizedField(i))
    }
    return result;
  }

  /**
   * @param {SynthesizedField} object 
   * @returns {ApiSynthesizedField}
   */
  synthesizedField(object) {
    const result = /** @type ApiSynthesizedField */ ({
      id: object['@id'],
      element: undefined,
      value: undefined,
    });
    let element = object[this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.element)];
    if (element) {
      if (Array.isArray(element)) {
        [element] = element;
      }
      result.element = element['@value'] || element;
    }
    let value = object[this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.value)];
    if (value) {
      if (Array.isArray(value)) {
        [value] = value;
      }
      result.value = value['@value'] || value;
    }
    return result;
  }

  /**
   * @param {ParametrizedTrait} object 
   * @returns {ApiParametrizedTrait}
   */
  parametrizedTrait(object) {
    const result = /** @type ApiParametrizedTrait */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      variables: [],
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
    });
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    if (name && typeof name === 'string') {
      result.name = name;
    }
    const variables = object[this._getAmfKey(ns.aml.vocabularies.document.variable)];
    if (Array.isArray(variables)) {
      variables.forEach((item) => {
        result.variables.push(this.variableValue(item));
      });
    }
    const targets = object[this._getAmfKey(ns.aml.vocabularies.document.target)];
    if (Array.isArray(targets) && targets.length) {
      const [target] = targets;
      result.target = this.abstractDeclaration(target);
    }
    return result;
  }

  /**
   * @param {VariableValue} object 
   * @returns {ApiVariableValue}
   */
  variableValue(object) {
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    const result = /** @type ApiVariableValue */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      name,
    });
    const values = object[this._getAmfKey(ns.aml.vocabularies.document.value)];
    if (Array.isArray(values)) {
      const [item] = values;
      result.value = this.unknownDataNode(item);
    }
    return result;
  }

  /**
   * @param {AbstractDeclaration} object 
   * @returns {ApiAbstractDeclaration}
   */
  abstractDeclaration(object) {
    const { ns } = this;
    const name = this._getValue(object, ns.aml.vocabularies.core.name);
    const result = /** @type ApiAbstractDeclaration */ ({
      id: object['@id'],
      types: object['@type'].map(this[expandKey].bind(this)),
      customDomainProperties: this.customDomainProperties(object),
      sourceMaps: this.sourceMap(object),
      name,
      variables: [],
    });
    const variables = /** @type string[] */ (this._getValueArray(object, ns.aml.vocabularies.document.variable));
    if (Array.isArray(variables)) {
      result.variables = variables;
    }
    const description = this._getValue(object, ns.aml.vocabularies.core.description);
    if (description && typeof description === 'string') {
      result.description = description;
    }
    const dataNode = object[this._getAmfKey(ns.aml.vocabularies.document.dataNode)];
    if (Array.isArray(dataNode)) {
      const [item] = dataNode;
      result.dataNode = this.unknownDataNode(item);
    }
    return result;
  }
}
