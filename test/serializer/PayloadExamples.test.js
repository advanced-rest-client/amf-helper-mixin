// As part of the optimisation the examples may be referenced in a link
// shared between different payloads. These test are looking for the 
// right example for the right payload.

import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer } from '../../index.js';

/** @typedef {import('../../src/types').ApiNodeShape} ApiNodeShape */

describe('Payload examples', () => {
  const jsonMime = 'application/json';
  const xmlMime = 'application/xml';

  [true, false].forEach(compact => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await AmfLoader.load(compact);
      serializer = new AmfSerializer(api);
    });

    describe(compact ? 'Compact model' : 'Full model', () => {
      it('returns a RAML example for the JSON mime', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'get', jsonMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 2, 'has both examples from the type and the payload');
        const [ex1, ex2] = examples;

        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
        assert.include(ex2.value, 'id: "R34fg663H9KW9MMSKISI"', 'example #2 is payload defined example (raml)');

        assert.include(ex2.sourceMaps.trackedElement.value, shape['@id'], 'example #2 has tracked value');
      });

      it('returns a RAML example for the XML mime', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'get', xmlMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 2, 'has both examples from the type and the payload');
        const [ex1, ex2] = examples;

        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
        assert.include(ex2.value, 'id: "R34fg663H9KW9MMSKISI"', 'example #2 is payload defined example (raml)');

        assert.include(ex2.sourceMaps.trackedElement.value, shape['@id'], 'example #2 has tracked value');
      });

      it('returns a JSON example for the JSON mime', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'put', jsonMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 2, 'has both examples from the type and the payload');
        const [ex1, ex2] = examples;
        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
        assert.include(ex2.value, '"id": "R34fg663H9KW9MMSKISI"', 'example #2 is payload defined example (json)');

        assert.include(ex2.sourceMaps.trackedElement.value, shape['@id'], 'example #2 has tracked value');
      });

      it('returns a XML example for the XML mime', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'put', xmlMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 2, 'has both examples from the type and the payload');
        const [ex1, ex2] = examples;
        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
        assert.include(ex2.value, '<id>Qawer63J73HJ6khjswuqyq62382jG21s</id>', 'example #2 is payload defined example (xml)');

        assert.include(ex2.sourceMaps.trackedElement.value, shape['@id'], 'example #2 has tracked value');
      });

      it('reuses the same JSON example for the JSON mime', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'post', jsonMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 2, 'has both examples from the type and the payload');
        const [ex1, ex2] = examples;
        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
        assert.include(ex2.value, '"id": "R34fg663H9KW9MMSKISI"', 'example #2 is payload defined example (json)');

        assert.include(ex2.sourceMaps.trackedElement.value, shape['@id'], 'example #2 has tracked value');
      });

      it('reuses the same XML example for the XML mime', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'post', xmlMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 2, 'has both examples from the type and the payload');
        const [ex1, ex2] = examples;
        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
        assert.include(ex2.value, '<id>Qawer63J73HJ6khjswuqyq62382jG21s</id>', 'example #2 is payload defined example (xml)');

        assert.include(ex2.sourceMaps.trackedElement.value, shape['@id'], 'example #2 has tracked value');
      });

      it('works when a single mime is used', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'delete', jsonMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 2, 'has both examples from the type and the payload');
        const [ex1, ex2] = examples;
        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
        assert.include(ex2.value, '"id": "R34fg663H9KW9MMSKISI"', 'example #2 is payload defined example (json)');

        assert.include(ex2.sourceMaps.trackedElement.value, shape['@id'], 'example #2 has tracked value');
      });

      it('serializes type only example when no payload example', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/body-tracking', 'patch', jsonMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 1, 'has only the type example');
        const [ex1] = examples;
        assert.include(ex1.value, 'id: "R34fg663H9KW9MMSKISIhTs1dR7Hss7e"', 'example #1 is type defined example');
      });

      it('adds example without tracking information', async () => {
        const shape = AmfLoader.lookupRequestPayload(api, '/not-shared', 'post', jsonMime);
        const result = serializer.payload(shape);

        const { examples } = /** @type ApiNodeShape */ (result.schema);

        assert.lengthOf(examples, 1, 'has only the payload example');
        const [ex1] = examples;
        assert.include(ex1.value, 'id: 1234567890', 'example #1 is type defined example');
      });
    });
  })
});
