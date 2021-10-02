import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer } from '../../index.js';

/** @typedef {import('../../src/types').ApiBase} ApiBase */
/** @typedef {import('../../src/amf').Api} Api */

describe('AmfSerializer', () => {
  describe('Api serialization', () => {
    /** @type Api */
    let petstore;
    /** @type Api */
    let demoApi;
    /** @type Api */
    let asyncApi;
    /** @type AmfSerializer */
    let petstoreSerializer;
    /** @type AmfSerializer */
    let demoSerializer;
    /** @type AmfSerializer */
    let asyncSerializer;
    before(async () => {
      const a1 = await AmfLoader.load(true, 'petstore');
      const a2 = await AmfLoader.load(true, 'arc-demo-api');
      const a3 = await AmfLoader.load(true, 'async-api');
      petstoreSerializer = new AmfSerializer(a1);
      demoSerializer = new AmfSerializer(a2);
      asyncSerializer = new AmfSerializer(a3);
      petstore = petstoreSerializer._computeEncodes(a1);
      demoApi = demoSerializer._computeEncodes(a2);
      asyncApi = asyncSerializer._computeEncodes(a3);
    });

    describe('apiSummary()', () => {
      it('serializes the id', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.typeOf(result.id, 'string', 'has the id');
        assert.equal(result.id, demoApi['@id'], 'has the web api id');
      });

      it('serializes the types', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.typeOf(result.types, 'array', 'has the id');
        assert.equal(result.types.length, demoApi['@type'].length, 'has all types');
      });

      it('serializes empty customDomainProperties', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.typeOf(result.customDomainProperties, 'array', 'has the customDomainProperties');
        assert.lengthOf(result.customDomainProperties, 0, 'has no values');
      });

      it('serializes the sourceMaps', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.typeOf(result.sourceMaps, 'object', 'has the sourceMaps');
      });

      it('serializes the schemes', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.deepEqual(result.schemes, ['HTTP', 'HTTPS']);
      });

      it('has default schemes', () => {
        const result = petstoreSerializer.apiSummary(petstore);
        assert.deepEqual(result.schemes, []);
      });

      it('serializes the accepts', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.deepEqual(result.accepts, ['application/json', 'application/xml']);
      });

      it('has default accepts', () => {
        const result = petstoreSerializer.apiSummary(petstore);
        assert.deepEqual(result.accepts, []);
      });

      it('serializes the contentType', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.deepEqual(result.contentType, ['application/json', 'application/xml']);
      });

      it('has default contentType', () => {
        const result = petstoreSerializer.apiSummary(petstore);
        assert.deepEqual(result.contentType, []);
      });

      it('serializes the documentations', () => {
        const result = petstoreSerializer.apiSummary(petstore);
        assert.typeOf(result.documentations, 'array', 'has the array');
        assert.lengthOf(result.documentations, 1, 'has a single documentation');
      });

      it('serializes the tags', () => {
        const result = petstoreSerializer.apiSummary(petstore);
        assert.typeOf(result.tags, 'array', 'has the tags');
        assert.lengthOf(result.tags, 3, 'has all tags');
        const [tag] = result.tags;
        assert.equal(tag.name, 'pet', 'has the tags definition');
      });

      it('has default tags', () => {
        const result = demoSerializer.apiSummary(demoApi);
        assert.deepEqual(result.tags, []);
      });

      it('serializes the license', () => {
        const result = petstoreSerializer.apiSummary(petstore);
        const { name, url } = result.license;
        assert.equal(name, 'Apache 2.0', 'has the license.name');
        assert.equal(url, 'http://www.apache.org/licenses/LICENSE-2.0.html', 'has the license.url');
      });

      it('serializes the provider', () => {
        const result = petstoreSerializer.apiSummary(petstore);
        const { name, url, email } = result.provider;
        assert.equal(name, 'Swagger IO', 'has the provider.name');
        assert.equal(url, 'swagger.io', 'has the provider.url');
        assert.equal(email, 'apiteam@swagger.io', 'has the provider.email');
      });
    });

    describe('api()', () => {
      it('has the ApiSummary properties', () => {
        const result = demoSerializer.api(demoApi);
        assert.typeOf(result.id, 'string', 'has the id');
        assert.equal(result.id, demoApi['@id'], 'has the web api id');
        assert.deepEqual(result.schemes, ['HTTP', 'HTTPS']);
        assert.deepEqual(result.accepts, ['application/json', 'application/xml']);
      });

      it('has the end points', () => {
        const result = demoSerializer.api(demoApi);
        assert.typeOf(result.endPoints, 'array', 'has the endpoints');
        const [endPoint] = result.endPoints;
        assert.equal(endPoint.path , '/test-parameters/{feature}', 'has the end point definition');
      });

      it('has the servers', () => {
        const result = demoSerializer.api(demoApi);
        assert.typeOf(result.servers, 'array', 'has the servers');
        const [server] = result.servers;
        assert.equal(server.url , 'http://{instance}.domain.com/', 'has the server definition');
      });
    });

    describe('webApi()', () => {
      it('has the ApiSummary properties', () => {
        const result = demoSerializer.webApi(demoApi);
        assert.typeOf(result.id, 'string', 'has the id');
        assert.equal(result.id, demoApi['@id'], 'has the web api id');
        assert.deepEqual(result.schemes, ['HTTP', 'HTTPS']);
        assert.deepEqual(result.accepts, ['application/json', 'application/xml']);
      });

      it('has the end points', () => {
        const result = demoSerializer.webApi(demoApi);
        assert.typeOf(result.endPoints, 'array', 'has the endpoints');
        const [endPoint] = result.endPoints;
        assert.equal(endPoint.path , '/test-parameters/{feature}', 'has the end point definition');
      });

      it('has the servers', () => {
        const result = demoSerializer.webApi(demoApi);
        assert.typeOf(result.servers, 'array', 'has the servers');
        const [server] = result.servers;
        assert.equal(server.url , 'http://{instance}.domain.com/', 'has the server definition');
      });
    });

    describe('asyncApi()', () => {
      it('has the ApiSummary properties', () => {
        const result = demoSerializer.asyncApi(asyncApi);
        assert.typeOf(result.id, 'string', 'has the id');
        assert.equal(result.id, asyncApi['@id'], 'has the web api id');
        assert.equal(result.name, 'Hello world application');
      });

      it('has the end points', () => {
        const result = demoSerializer.asyncApi(asyncApi);
        assert.typeOf(result.endPoints, 'array', 'has the endpoints');
        const [endPoint] = result.endPoints;
        assert.equal(endPoint.path , 'hello', 'has the end point definition');
      });

      it('has the servers', () => {
        const result = demoSerializer.asyncApi(asyncApi);
        assert.typeOf(result.servers, 'array', 'has the servers');
        const [server] = result.servers;
        assert.equal(server.url , 'broker.mycompany.com', 'has the server definition');
      });
    });
  });
});
