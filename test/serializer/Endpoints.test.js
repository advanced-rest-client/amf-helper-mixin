import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer, ns } from '../../index.js';

/** @typedef {import('../../src/types').ApiScalarShape} ApiScalarShape */
/** @typedef {import('../../src/types').ApiObjectNode} ApiObjectNode */
/** @typedef {import('../../src/amf').AmfDocument} AmfDocument */

describe('AmfSerializer', () => {
  describe('OAS endpoints', () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await AmfLoader.load(true, 'petstore');
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    it('translates an endpoint', () => {
      const shape = AmfLoader.lookupEndpoint(api, '/pet');
      const result = serializer.endPoint(shape);
      assert.typeOf(result, 'object', 'returns an object');
      assert.include(result.types, serializer.ns.aml.vocabularies.apiContract.EndPoint, 'has the EndPoint type');
      assert.equal(result.path, '/pet', 'has the path');
      assert.typeOf(result.operations, 'array', 'has the operations');
      assert.lengthOf(result.operations, 2, 'has all operations');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('adds the servers property', () => {
      const shape = AmfLoader.lookupEndpoint(api, '/pet');
      const result = serializer.endPoint(shape);
      assert.typeOf(result.servers, 'array', 'has the servers');
      assert.lengthOf(result.servers, 1, 'has a single server');
      assert.include(result.servers[0].types, serializer.ns.aml.vocabularies.apiContract.Server, 'has the Server type');
    });

    it('adds the summary & description property', () => {
      const shape = AmfLoader.lookupEndpoint(api, '/user/{username}');
      const result = serializer.endPoint(shape);
      assert.equal(result.summary, 'Represents a user', 'has the summary');
      assert.typeOf(result.description, 'string', 'has description property');
    });
  });

  describe('RAML endpoints', () => {
    /** @type AmfDocument */
    let demoApi;
    /** @type AmfDocument */
    let arcDemoApi;
    /** @type AmfSerializer */
    let demoSerializer;
    /** @type AmfSerializer */
    let arcDemoSerializer;
    before(async () => {
      demoApi = await AmfLoader.load(true, 'demo-api');
      arcDemoApi = await AmfLoader.load(true, 'arc-demo-api');
      demoSerializer = new AmfSerializer(demoApi);
      arcDemoSerializer = new AmfSerializer(arcDemoApi);
    });

    it('has annotations', () => {
      const shape = AmfLoader.lookupEndpoint(demoApi, '/annotations');
      const result = demoSerializer.endPoint(shape);
      assert.typeOf(result.customDomainProperties, 'array', 'has the array');
      assert.lengthOf(result.customDomainProperties, 1, 'has the annotation');
      const [item] = result.customDomainProperties;
      assert.equal(item.name, 'clearanceLevel', 'has the name');
      const typed = /** @type ApiObjectNode */ (item.extension);
      assert.typeOf(typed.properties, 'object', 'has the properties');
      assert.lengthOf(Object.keys(typed.properties), 2, 'has all properties');
    });

    it('has parameters', () => {
      const shape = AmfLoader.lookupEndpoint(demoApi, '/{groupId}/{assetId}/{version}');
      const result = demoSerializer.endPoint(shape);
      const { parameters } = result;
      assert.typeOf(parameters, 'array', 'has the array');
      assert.lengthOf(parameters, 3, 'has the parameters');
      const [p1, p2, p3] = parameters;
      assert.include(p1.types, demoSerializer.ns.aml.vocabularies.apiContract.Parameter, 'p1 has the type');
      assert.include(p2.types, demoSerializer.ns.aml.vocabularies.apiContract.Parameter, 'p2 has the type');
      assert.include(p3.types, demoSerializer.ns.aml.vocabularies.apiContract.Parameter, 'p3 has the type');
      assert.equal(p1.name, 'assetId', 'p1 has the name');
      assert.equal(p2.name, 'groupId', 'p2 has the name');
      assert.equal(p3.name, 'version', 'p3 has the name');
      assert.equal(p1.paramName, 'assetId', 'p1 has the paramName');
      assert.equal(p2.paramName, 'groupId', 'p2 has the paramName');
      assert.equal(p3.paramName, 'version', 'p3 has the paramName');
      assert.isTrue(p1.required, 'p1 has the required');
      assert.isTrue(p2.required, 'p2 has the required');
      assert.isTrue(p3.required, 'p3 has the required');
      assert.equal(p1.binding, 'path', 'p1 has the binding');
      assert.equal(p2.binding, 'path', 'p2 has the binding');
      assert.equal(p3.binding, 'path', 'p3 has the binding');
      assert.typeOf(p1.schema, 'object', 'p1 has the schema');
      assert.typeOf(p2.schema, 'object', 'p2 has the schema');
      assert.typeOf(p3.schema, 'object', 'p3 has the schema');
      assert.equal(/** @type ApiScalarShape */(p1.schema).dataType, demoSerializer.ns.w3.xmlSchema.string, 'p1.schema has the dataType');
      assert.equal(/** @type ApiScalarShape */(p2.schema).dataType, demoSerializer.ns.w3.xmlSchema.string, 'p2.schema has the dataType');
      assert.equal(/** @type ApiScalarShape */(p3.schema).dataType, demoSerializer.ns.aml.vocabularies.shapes.number, 'p3.schema has the dataType');
    });

    it('adds resource type definition', () => {
      const shape = AmfLoader.lookupEndpoint(demoApi, '/files/{fileId}');
      const result = demoSerializer.endPoint(shape);
      const { operations } = result;
      const get = operations.find(o => o.method === 'get');
      const param = get.request.queryParameters.find(p => p.paramName === 'access_token');
      assert.ok(param);
    });

    it('adds a resource type extension', () => {
      const shape = AmfLoader.lookupEndpoint(arcDemoApi, '/products');
      const result = arcDemoSerializer.endPoint(shape);
      const { extends: extensions } = result;
      assert.typeOf(extensions, 'array', 'has the extensions array');
      assert.lengthOf(extensions, 1, 'has a single extension');
      
      const [type] = extensions;
      
      assert.typeOf(type.id, 'string', 'has the id');
      assert.typeOf(type.types, 'array', 'has the types');
      assert.include(type.types, ns.aml.vocabularies.apiContract.ParametrizedResourceType, 'has the type in the types');
      assert.equal(type.name, 'RequestErrorResponse', 'has the name');
      assert.typeOf(type.target, 'object', 'has the target definition');
    });

    it('adds a trait extension', () => {
      const shape = AmfLoader.lookupEndpoint(arcDemoApi, '/orgs/{orgId}');
      const result = arcDemoSerializer.endPoint(shape);
      const { extends: extensions } = result;
      assert.typeOf(extensions, 'array', 'has the extensions array');
      assert.lengthOf(extensions, 1, 'has a single extension');
      
      const [type] = extensions;
      
      assert.typeOf(type.id, 'string', 'has the id');
      assert.typeOf(type.types, 'array', 'has the types');
      assert.include(type.types, ns.aml.vocabularies.apiContract.ParametrizedTrait, 'has the type in the types');
      assert.equal(type.name, 'RateLimited', 'has the name');
      assert.typeOf(type.target, 'object', 'has the target definition');
    });

    it('adds both a trait and a resource type extensions', () => {
      const shape = AmfLoader.lookupEndpoint(arcDemoApi, '/people');
      const result = arcDemoSerializer.endPoint(shape);
      const { extends: extensions } = result;
      assert.typeOf(extensions, 'array', 'has the extensions array');
      assert.lengthOf(extensions, 2, 'has both extensions');

      const type = extensions.find(e => e.types.includes(ns.aml.vocabularies.apiContract.ParametrizedResourceType));
      const trait = extensions.find(e => e.types.includes(ns.aml.vocabularies.apiContract.ParametrizedTrait));
      
      assert.ok(type, 'has the resource type');
      assert.ok(trait, 'has the trait');
    });
  });
});
