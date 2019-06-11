import { fixture, assert } from '@open-wc/testing';
import { IronMeta } from '@polymer/iron-meta/iron-meta.js';
import { AmfLoader } from './amf-loader.js';
import './test-element.js';

describe('Base URI test', function() {
  async function basicFixture() {
    return (await fixture(`<test-element></test-element>`));
  }

  describe('Base URI test', () => {
    let element;
    let model;
    let server;
    let endpoint;

    before(async () => {
      model = await AmfLoader.load();
    });

    beforeEach(async () => {
      element = await basicFixture();
      element.amfModel = model;
      server = element._computeServer(model);
      const webApi = element._computeWebApi(model);
      endpoint = element._computeEndpointByPath(webApi, '/files');
    });

    afterEach(() => {
      new IronMeta({key: 'ApiBaseUri'}).value = undefined;
    });

    it('_getAmfBaseUri returns server\'s base uri', () => {
      const result = element._getAmfBaseUri(server);
      assert.equal(result, 'https://api.mulesoft.com/{version}');
    });

    const noSchemeServer = {
      '@id': 'file://test/demo-api/demo-api.raml#/web-api/https%3A%2F%2Fapi.mulesoft.com%2F%7Bversion%7D',
      '@type': [
        'http://raml.org/vocabularies/http#Server',
        'http://raml.org/vocabularies/document#DomainElement'
      ],
      'http://a.ml/vocabularies/http#url': [
        {
          '@value': 'api.mulesoft.com/test'
        }
      ]
    };

    it('_getAmfBaseUri uses protocols with the base uri', () => {
      const result = element._getAmfBaseUri(noSchemeServer, ['http']);
      assert.equal(result, 'http://api.mulesoft.com/test');
    });

    it('_getAmfBaseUri uses AMF encoded protocols with the base uri', () => {
      const result = element._getAmfBaseUri(noSchemeServer);
      assert.equal(result, 'https://api.mulesoft.com/test');
    });

    it('_getBaseUri() returns baseUri argument if set', () => {
      const value = 'https://api.domain.com';
      const result = element._getBaseUri(value, server);
      assert.equal(result, value);
    });

    it('_getBaseUri() returns baseUri argument IronMeta', () => {
      const value = 'https://meta.com/base';
      new IronMeta({key: 'ApiBaseUri'}).value = value;
      const result = element._getBaseUri(undefined, server);
      assert.equal(result, value);
    });

    it('_getBaseUri() prefers baseUri over IronMeta', () => {
      const value = 'https://api.domain.com';
      new IronMeta({key: 'ApiBaseUri'}).value = 'https://meta.com/base';
      const result = element._getBaseUri(value, server);
      assert.equal(result, value);
    });

    it('_computeEndpointUri() computes APIs encoded URI', () => {
      const result = element._computeEndpointUri(server, endpoint);
      assert.equal(result, 'https://api.mulesoft.com/{version}/files');
    });

    it('_computeEndpointUri() computes URI for altered baseUri', () => {
      const result = element._computeEndpointUri(server, endpoint, 'https://domain.com');
      assert.equal(result, 'https://domain.com/files');
    });

    it('_computeEndpointUri() computes URI for altered baseUri withouth scheme', () => {
      const result = element._computeEndpointUri(server, endpoint, 'domain.com');
      assert.equal(result, 'https://domain.com/files');
    });

    it('_ensureUrlScheme() adds scheme for url from AMF model', () => {
      const result = element._ensureUrlScheme('domain.com');
      assert.equal(result, 'https://domain.com');
    });

    it('_ensureUrlScheme() adds scheme for url from passed argument', () => {
      const result = element._ensureUrlScheme('domain.com', ['ftp']);
      assert.equal(result, 'ftp://domain.com');
    });

    it('_ensureUrlScheme() adds default scheme', () => {
      element.amfModel = undefined;
      const result = element._ensureUrlScheme('domain.com');
      assert.equal(result, 'http://domain.com');
    });
  });
});
