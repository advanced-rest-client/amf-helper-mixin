import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import './test-element.js';
// In OAS path parameters can be defined on an operation level. This is in conflict
// with RAML which only allows variables on the endpoint level.
// This tests for reading parameters from an endpoint that are locates on the
// method level.
describe('SE-12957', function() {
  async function basicFixture(amf) {
    return await fixture(html`<test-element
      .amf="${amf}"></test-element>`);
  }

  const apiFile = 'SE-12957';

  [
    ['Compact model V1', true],
    ['Regular model V1', false]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      let amf;
      before(async () => {
        amf = await AmfLoader.load(compact, apiFile);
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('computes path parameters from AMF Endpoint model', () => {
        const endpopint = AmfLoader.lookupEndpoint(amf, '/api/v1/alarm/{scada-object-key}');
        const method = AmfLoader.lookupOperation(amf, '/api/v1/alarm/{scada-object-key}', 'get');
        const result = element._computeEndpointVariables(endpopint, method);
        assert.typeOf(result, 'array', 'result is array');
        assert.lengthOf(result, 1, 'array has 1 item');
      });

      it('computes query parameters from AMF Expects model', () => {
        const method = AmfLoader.lookupOperation(amf, '/api/v1/alarm/{scada-object-key}', 'get');
        const expects = element._computeExpects(method);
        const result = element._computeQueryParameters(expects);
        assert.typeOf(result, 'array', 'result is array');
        assert.lengthOf(result, 1, 'array has 1 item');
      });
    });
  });
});
