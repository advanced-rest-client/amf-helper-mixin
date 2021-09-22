import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer } from '../../index.js';

/** @typedef {import('../../src/amf').Server} Server */

describe('AmfSerializer', () => {
  describe('server()', () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    /** @type Server[] */
    let servers;
    before(async () => {
      api = await AmfLoader.load(true, 'oas-3-api');
      serializer = new AmfSerializer(api);
      servers = AmfLoader.lookupServers(api);
    })

    it('returns a server object', () => {
      const result = serializer.server(servers[3]);
      assert.typeOf(result, 'object', 'returns an object');
      assert.include(result.types, serializer.ns.aml.vocabularies.apiContract.Server, 'has the server type');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('has the id', () => {
      const result = serializer.server(servers[3]);
      assert.typeOf(result.id, 'string');
    });

    it('has the url', () => {
      const result = serializer.server(servers[3]);
      assert.equal(result.url, 'https://{username}.gigantic-server.com:{port}/{basePath}');
    });

    it('has the variables', () => {
      const result = serializer.server(servers[3]);
      assert.typeOf(result.variables, 'array', 'has the variables property');
      assert.lengthOf(result.variables, 3, 'has all variables');
      const [v1] = result.variables;
      assert.typeOf(v1, 'object', 'the variable is an object');
      assert.include(v1.types, serializer.ns.aml.vocabularies.apiContract.Parameter, 'has the Parameter type');
    });
  });
});
