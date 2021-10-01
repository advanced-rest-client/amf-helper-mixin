import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer, ns } from '../../index.js';

/** @typedef {import('../../src/amf').Server} Server */
/** @typedef {import('../../src/types').ApiArrayShape} ApiArrayShape */
/** @typedef {import('../../src/types').ApiNodeShape} ApiNodeShape */
/** @typedef {import('../../src/types').ApiUnionShape} ApiUnionShape */
/** @typedef {import('../../src/types').ApiScalarShape} ApiScalarShape */
/** @typedef {import('../../src/types').ApiScalarNode} ApiScalarNode */
/** @typedef {import('../../src/types').ApiFileShape} ApiFileShape */
/** @typedef {import('../../src/types').ApiRecursiveShape} ApiRecursiveShape */
/** @typedef {import('../../src/types').ApiCustomDomainProperty} ApiCustomDomainProperty */
/** @typedef {import('../../src/types').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('../../src/types').ApiTupleShape} ApiTupleShape */

describe('AmfSerializer', () => {
  describe('APIC-483', () => {
    const fileName = 'APIC-483';
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await AmfLoader.load(true, fileName);
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    it('serializes a TupleShape', () => {
      const expects = AmfLoader.lookupExpects(api, '/banks', 'post');
      const payload = AmfLoader._computePayload(expects)[0];
      const shape = payload[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0];
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      const { examples, properties } = result;

      // serializer recognizes that the this example is referenced to a payload and not to a type.
      assert.lengthOf(examples, 0, 'has the examples');
      assert.lengthOf(properties, 1, 'has the properties');
      const array = /** @type ApiTupleShape  */ (properties[0].range);
      const { types, items } = array;
      assert.include(types, ns.aml.vocabularies.shapes.TupleShape, 'range has the TupleShape');
      assert.lengthOf(items, 1, 'range has the items');
    });
  });
});
