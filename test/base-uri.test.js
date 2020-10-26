import { fixture, assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import './test-element.js';

describe('Base URI test', () => {
  async function basicFixture() {
    return fixture(`<test-element></test-element>`);
  }

  describe('Base URI test', () => {
    let element;
    let model;
    let server;
    let filesEndpoint;
    let mailEndpoint;

    before(async () => {
      model = await AmfLoader.load();
    });

    beforeEach(async () => {
      element = await basicFixture();
      element.amf = model;
      server = element._computeServer(model);
      const webApi = element._computeWebApi(model);
      filesEndpoint = element._computeEndpointByPath(webApi, '/files');
      mailEndpoint = element._computeEndpointByPath(webApi, '/mail');
    });

    it('_getAmfBaseUri returns servers base uri', () => {
      const result = element._getAmfBaseUri(server);
      assert.equal(result, 'https://api.mulesoft.com/{version}');
    });

    const noSchemeServerV1 = {
      '@id': 'file://test/demo-api/demo-api.raml#/web-api/https%3A%2F%2Fapi.mulesoft.com%2F%7Bversion%7D',
      '@type': ['http://raml.org/vocabularies/http#Server', 'http://raml.org/vocabularies/document#DomainElement'],
      'http://a.ml/vocabularies/http#url': [
        {
          '@value': 'api.mulesoft.com/test'
        }
      ]
    };

    const noSchemeServerV2 = {
      '@id': 'file://test/demo-api/demo-api.raml#/web-api/https%3A%2F%2Fapi.mulesoft.com%2F%7Bversion%7D',
      '@type': [
        'http://raml.org/vocabularies/apiContract#Server',
        'http://raml.org/vocabularies/document#DomainElement'
      ],
      'http://a.ml/vocabularies/core#urlTemplate': [
        {
          '@value': 'api.mulesoft.com/test'
        }
      ]
    };

    const noSchemeServer = (elem) => {
      if (elem._modelVersion === 1) {
        return noSchemeServerV1;
      }
      return noSchemeServerV2;
    };

    it('_getAmfBaseUri() uses protocols with the base uri', () => {
      const result = element._getAmfBaseUri(noSchemeServer(element), ['http']);
      assert.equal(result, 'http://api.mulesoft.com/test');
    });

    it('_getAmfBaseUri() uses AMF encoded protocols with the base uri', () => {
      const result = element._getAmfBaseUri(noSchemeServer(element));
      assert.equal(result, 'https://api.mulesoft.com/test');
    });

    it('_getBaseUri() returns baseUri argument if set', () => {
      const value = 'https://api.domain.com';
      const result = element._getBaseUri(value, server);
      assert.equal(result, value);
    });

    it('_computeEndpointUri() computes APIs encoded URI', () => {
      const result = element._computeEndpointUri(server, filesEndpoint);
      assert.equal(result, 'https://api.mulesoft.com/{version}/files');
    });

    it('_computeEndpointUri() computes URI for altered baseUri', () => {
      const result = element._computeEndpointUri(server, filesEndpoint, 'https://domain.com');
      assert.equal(result, 'https://domain.com/files');
    });

    it('_computeEndpointUri() computes URI for altered baseUri withouth scheme', () => {
      const result = element._computeEndpointUri(server, filesEndpoint, 'domain.com');
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
      element.amf = undefined;
      const result = element._ensureUrlScheme('domain.com');
      assert.equal(result, 'http://domain.com');
    });

    it('_computeUri() computes APIs encoded URI', () => {
      const result = element._computeUri(filesEndpoint, { server });
      assert.equal(result, 'https://api.mulesoft.com/{version}/files');
    });

    it('_computeUri() computes version', () => {
      const result = element._computeUri(filesEndpoint, { server, version: 'v1.0.0' });
      assert.equal(result, 'https://api.mulesoft.com/v1.0.0/files');
    });

    it('_computeUri() computes URI for altered baseUri', () => {
      const result = element._computeUri(filesEndpoint, { server, baseUri: 'https://domain.com' });
      assert.equal(result, 'https://domain.com/files');
    });

    it('_computeUri() computes URI for altered baseUri withouth scheme', () => {
      const result = element._computeUri(filesEndpoint, { server, baseUri: 'domain.com' });
      assert.equal(result, 'https://domain.com/files');
    });

    it('_computeUri() computes URI without optional parameters', () => {
      const result = element._computeUri(filesEndpoint);
      assert.equal(result, '/files');
    });

    it('_computeUri() ignores base URI computation', () => {
      const result = element._computeUri(filesEndpoint, { server, baseUri: 'https://domain.com', ignoreBase: true });
      assert.equal(result, '/files');
    });

    it('_computeUri() add queryParameters when defined in method', () => {
      const getMail = AmfLoader.lookupOperation(model, '/mail', 'get');
      const result = element._computeUri(mailEndpoint, { server, method: getMail });
      assert.equal(result, 'https://api.mulesoft.com/{version}/mail?box=foo');
    });
  });
});
