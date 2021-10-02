import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer } from '../../index.js';

/** @typedef {import('../../src/amf').Server} Server */

describe('AmfSerializer', () => {
  [true, false].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      describe('server()', () => {
        let api;
        /** @type AmfSerializer */
        let serializer;
        /** @type Server[] */
        let servers;
    
        describe('OAS 3', () => {
          before(async () => {
            api = await AmfLoader.load(compact, 'oas-3-api');
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

          it('has the description', () => {
            const result = serializer.server(servers[1]);
            assert.equal(result.description, 'Staging server');
          });
        });
        
        describe('Async API', () => {
          before(async () => {
            api = await AmfLoader.load(compact, 'async-api');
            serializer = new AmfSerializer(api);
            servers = AmfLoader.lookupServers(api);
          });

          it('returns the server object', () => {
            const result = serializer.server(servers[0]);
            assert.typeOf(result, 'object', 'returns an object');
            assert.include(result.types, serializer.ns.aml.vocabularies.apiContract.Server, 'has the server type');
            assert.typeOf(result.sourceMaps, 'object', 'has source maps');
          });

          it('has the protocol info', () => {
            const result = serializer.server(servers[0]);
            assert.equal(result.protocol, 'amqp', 'has the protocol');
            assert.equal(result.protocolVersion, '1.0.0', 'has the protocolVersion');
          });

          it('has the security', () => {
            const result = serializer.server(servers[0]);
            assert.typeOf(result.security, 'array', 'has the security');
            assert.lengthOf(result.security, 1, 'has all security');
            const [security] = result.security;
            assert.lengthOf(security.schemes, 1, 'has the security.schema');            
          });
        });
      });
    });
  });
});
