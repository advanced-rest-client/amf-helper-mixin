import { assert, fixture, html } from '@open-wc/testing';
import './test-element.js';

/** @typedef {import('./test-element').TestElement} TestElement */

/**
 * OAS 3.1/3.2 top-level webhooks compile to `apiContract#EndPoint` nodes that
 * are byte-identical to regular endpoints; the only distinction is that the
 * WebAPI root references them via the `apiContract#webhooks` predicate instead
 * of `apiContract#endpoint`. There is no operation-level flag.
 *
 * These tests use an inline expanded AMF model (no `@context`) so they are
 * independent of the model generator — a webhook fixture is an artifact of
 * `npm run build:models` and is git-ignored, so it must never gate this oracle.
 */
describe('AmfHelperMixin webhooks (OAS 3.1/3.2)', () => {
  const DOC = 'http://a.ml/vocabularies/document#Document';
  const ENCODES = 'http://a.ml/vocabularies/document#encodes';
  const WEBAPI = 'http://a.ml/vocabularies/apiContract#WebAPI';
  const ENDPOINT = 'http://a.ml/vocabularies/apiContract#endpoint';
  const WEBHOOKS = 'http://a.ml/vocabularies/apiContract#webhooks';
  const ENDPOINT_T = 'http://a.ml/vocabularies/apiContract#EndPoint';
  const OPERATION_T = 'http://a.ml/vocabularies/apiContract#Operation';
  const SUPPORTED_OP = 'http://a.ml/vocabularies/apiContract#supportedOperation';
  const PATH = 'http://a.ml/vocabularies/apiContract#path';
  const METHOD = 'http://a.ml/vocabularies/apiContract#method';
  const CALLBACK = 'http://a.ml/vocabularies/apiContract#callback';
  const NAME = 'http://a.ml/vocabularies/core#name';

  const REST_OP_ID = 'amf://id#11';
  const WEBHOOK_OP_ID = 'amf://id#21';

  /**
   * Builds a Document whose WebAPI has one regular endpoint (`/pets` GET) and
   * one top-level webhook (`newPet` POST).
   */
  function buildWebhookModel() {
    return {
      '@type': [DOC],
      [ENCODES]: [{
        '@id': 'amf://id#1',
        '@type': [WEBAPI],
        [ENDPOINT]: [{
          '@id': 'amf://id#10',
          '@type': [ENDPOINT_T],
          [PATH]: [{ '@value': '/pets' }],
          [SUPPORTED_OP]: [{
            '@id': REST_OP_ID,
            '@type': [OPERATION_T],
            [METHOD]: [{ '@value': 'get' }],
          }],
        }],
        [WEBHOOKS]: [{
          '@id': 'amf://id#20',
          '@type': [ENDPOINT_T],
          [PATH]: [{ '@value': 'newPet' }],
          [NAME]: [{ '@value': 'newPet' }],
          [SUPPORTED_OP]: [{
            '@id': WEBHOOK_OP_ID,
            '@type': [OPERATION_T],
            [METHOD]: [{ '@value': 'post' }],
          }],
        }],
      }],
    };
  }

  /**
   * Builds a Document whose only endpoint carries a per-operation callback and
   * has NO top-level `apiContract#webhooks`. Used to prove `_computeWebhooks`
   * keys on the top-level predicate only and never matches callbacks.
   */
  function buildCallbackOnlyModel() {
    return {
      '@type': [DOC],
      [ENCODES]: [{
        '@id': 'amf://id#1',
        '@type': [WEBAPI],
        [ENDPOINT]: [{
          '@id': 'amf://id#10',
          '@type': [ENDPOINT_T],
          [PATH]: [{ '@value': '/subscribe' }],
          [SUPPORTED_OP]: [{
            '@id': 'amf://id#11',
            '@type': [OPERATION_T],
            [METHOD]: [{ '@value': 'post' }],
            [CALLBACK]: [{
              '@id': 'amf://id#12',
              [NAME]: [{ '@value': 'onData' }],
            }],
          }],
        }],
      }],
    };
  }

  /**
   * @param {any} amf
   * @returns {Promise<TestElement>}
   */
  async function modelFixture(amf) {
    return fixture(html`<test-element .amf="${amf}"></test-element>`);
  }

  let element;
  let model;

  beforeEach(async () => {
    model = buildWebhookModel();
    element = await modelFixture(model);
  });

  describe('_computeWebhooks()', () => {
    it('returns the top-level webhook collection', () => {
      const webApi = element._computeApi(model);
      const result = element._computeWebhooks(webApi);
      assert.isArray(result, 'result is an array');
      assert.lengthOf(result, 1, 'has the single webhook');
      assert.equal(result[0]['@id'], 'amf://id#20');
    });

    it('returns [] when there is no webApi', () => {
      const result = element._computeWebhooks(undefined);
      assert.deepEqual(result, []);
    });

    it('keys on top-level webhooks only, never matching per-operation callbacks', () => {
      const callbackModel = buildCallbackOnlyModel();
      const webApi = element._computeApi(callbackModel);
      const result = element._computeWebhooks(webApi);
      assert.isNotOk(result, 'no webhooks are derived from a callback-only API');
    });
  });

  describe('regression: webhooks do not leak into endpoint/gRPC surfaces', () => {
    it('(a) _isGrpcApi(webhookModel) is still false', () => {
      assert.isFalse(element._isGrpcApi(model));
    });

    it('(b) _computeEndpoints count is unchanged (webhooks excluded)', () => {
      const webApi = element._computeApi(model);
      const endpoints = element._computeEndpoints(webApi);
      assert.lengthOf(endpoints, 1, 'only the /pets endpoint is counted');
      assert.equal(endpoints[0]['@id'], 'amf://id#10');
    });

    it('_computeEndpointByPath does not resolve a webhook path', () => {
      const webApi = element._computeApi(model);
      const result = element._computeEndpointByPath(webApi, 'newPet');
      assert.isUndefined(result, 'webhook path is not reachable as an endpoint');
    });
  });

  describe('resolvers fall back to webhooks (endpoints first)', () => {
    it('(c) _computeMethodEndpoint resolves a webhook op @id via fallback', () => {
      const webApi = element._computeApi(model);
      const endpoint = element._computeMethodEndpoint(webApi, WEBHOOK_OP_ID);
      assert.ok(endpoint, 'an endpoint is returned');
      assert.equal(endpoint['@id'], 'amf://id#20', 'the webhook endpoint is returned');
    });

    it('_computeMethodEndpoint still resolves a regular endpoint op first', () => {
      const webApi = element._computeApi(model);
      const endpoint = element._computeMethodEndpoint(webApi, REST_OP_ID);
      assert.equal(endpoint['@id'], 'amf://id#10');
    });

    it('_computeEndpointModel finds a webhook endpoint by @id via fallback', () => {
      const webApi = element._computeApi(model);
      const result = element._computeEndpointModel(webApi, 'amf://id#20');
      assert.equal(result['@id'], 'amf://id#20');
    });

    it('_computeEndpointModel resolves a regular endpoint by @id first', () => {
      const webApi = element._computeApi(model);
      const result = element._computeEndpointModel(webApi, 'amf://id#10');
      assert.equal(result['@id'], 'amf://id#10');
    });

    it('_computeMethodModel resolves a webhook operation via the endpoint fallback', () => {
      const webApi = element._computeApi(model);
      const op = element._computeMethodModel(webApi, WEBHOOK_OP_ID);
      assert.ok(op, 'the webhook operation is resolved');
      assert.equal(op['@id'], WEBHOOK_OP_ID);
    });
  });
});
