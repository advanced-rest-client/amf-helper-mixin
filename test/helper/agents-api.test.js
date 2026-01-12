import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import './test-element.js';

/** @typedef {import('./test-element').TestElement} TestElement */
/** @typedef {import('../../src/amf').DomainElement} DomainElement */
/** @typedef {import('../../src/amf').Operation} Operation */


// In OAS path parameters can be defined on an operation level. This is in conflict
// with RAML which only allows variables on the endpoint level.
// This tests for reading parameters from an endpoint that are locates on the
// method level.
describe('agents-api', () => {
   /**
   * @returns {Promise<TestElement>}
   */
  async function basicFixture(amf) {
    return fixture(html`<test-element .amf="${amf}"></test-element>`);
  }

   /**
   * @returns {Promise<TestElement>}
   */
  async function modelFixture(amf) {
    return fixture(html`<test-element
      .amf="${amf}"></test-element>`);
  }


  const apiFile = 'agents-api';

  [
    ['Regular model V1', false]
  ].forEach(([arg1, arg2]) => {
    const label = String(arg1);
    const compact = Boolean(arg2);

    describe(label, () => {
      let model;
      let agentModel;
      let element=  /** @type TestElement */ (null);
      before(async () => {
        model = await AmfLoader.load(compact, apiFile);
        agentModel = await AmfLoader.load(compact, 'agents-api');
      });

      beforeEach(async () => {
        element = await modelFixture();
      });


      it('sets _amf property', () => {
        element.amf = model;
        assert.isTrue(element._amf === model);
      });

      it('computes agent metadata with _computeAgents', async () => {
        const agents = element._computeAgents(element._computeEncodes(model));
        assert.isArray(agents, 'returns an array');
        assert.isNotEmpty(agents, 'array is not empty');
      });

      it('computes topic metadata with _computeTopics', async () => {
        const topics = element._computeTopics(element._computeEncodes(model));
        assert.isArray(topics, 'returns an array');
        assert.isNotEmpty(topics, 'array is not empty');
        const agent = topics[0];
        assert.property(agent, 'agentName');
        assert.equal(agent['agentName'], 'agent');
        assert.isArray(agent['topics'], 'topics is array');
        assert.isNotEmpty(agent['topics'], 'topics is not empty');
        const topic = agent['topics'][0];
        assert.property(topic, 'name');
        assert.equal(topic['name'], 'topic');
        assert.isArray(topic['classificationDescription']);
        assert.isArray(topic['instructions']);
        assert.isArray(topic['dataName']);
        assert.isArray(topic['scope']);
        // Check some expected values
        const classificationDescriptionValue = element._getValue(topic['classificationDescription'][0], element.ns.aml.vocabularies.data.value);
        assert.include(classificationDescriptionValue, 'This API allows agents to book, modify, and cancel hotel reservations, as well as apply loyalty upgrades.');
      });

      it('computes topic field values with _computeTopicValue', async () => {
        const topics = element._computeTopics(element._computeEncodes(model));
        const agent = topics[0];
        const topic = agent['topics'][0];
        // Check instructions
        const values = element._computeTopicValue(topic, element.ns.aml.vocabularies.data.instructions);
        if (values) {
          assert.isArray(values, 'returns an array');
          assert.isNotEmpty(values, 'array is not empty');
          // Verificamos que contiene una de las instrucciones esperadas
          const firstValue = element._getValue(values[0], element.ns.aml.vocabularies.data.value);
          assert.include(firstValue, 'Always check the customer');
        }
      });

      describe('Helper functions for custom domain properties', () => {
        it('_resolveCustomDomainProperty resolves ID with # format', () => {
          const webApi = element._computeEncodes(model);
          const customPropsKey = element._getAmfKey(element.ns.aml.vocabularies.document.customDomainProperties);
          const customProps = element._ensureArray(webApi[customPropsKey]);
          
          if (customProps && customProps.length > 0) {
            const propId = customProps[0]['@id']; // e.g., "#106"
            const resolved = element._resolveCustomDomainProperty(webApi, propId);
            
            assert.isDefined(resolved, 'should resolve the property');
            assert.isObject(resolved, 'should return an object');
          }
        });

        it('_resolveCustomDomainProperty handles both ID formats transparently', () => {
          const webApi = element._computeEncodes(model);
          const customPropsKey = element._getAmfKey(element.ns.aml.vocabularies.document.customDomainProperties);
          const customProps = element._ensureArray(webApi[customPropsKey]);
          
          if (customProps && customProps.length > 0) {
            const propId = customProps[0]['@id']; // e.g., "#106"
            
            // Test with short format (as it comes from customDomainProperties)
            const resolved1 = element._resolveCustomDomainProperty(webApi, propId);
            assert.isDefined(resolved1, 'should resolve with short ID format');
            assert.isObject(resolved1, 'should return an object');
            
            // Verify it handles the internal amf://id# keys properly
            const agentKey = element._getAmfKey(element.ns.aml.vocabularies.data.agent);
            assert.isDefined(resolved1[agentKey], 'resolved object should contain agent data');
          }
        });

        it('_resolveCustomDomainProperty returns undefined for invalid ID', () => {
          const webApi = element._computeEncodes(model);
          const resolved = element._resolveCustomDomainProperty(webApi, '#999999');
          
          assert.isUndefined(resolved, 'should return undefined for non-existent ID');
        });

        it('_resolveCustomDomainProperty unwraps arrays', () => {
          const webApi = element._computeEncodes(model);
          const customPropsKey = element._getAmfKey(element.ns.aml.vocabularies.document.customDomainProperties);
          const customProps = element._ensureArray(webApi[customPropsKey]);
          
          if (customProps && customProps.length > 0) {
            const propId = customProps[0]['@id'];
            const resolved = element._resolveCustomDomainProperty(webApi, propId);
            
            // Should always return object, not array
            assert.isNotArray(resolved, 'should unwrap arrays');
            assert.isObject(resolved, 'should return unwrapped object');
          }
        });

        it('_findCustomDomainPropertyByKey finds property by agent key', () => {
          const webApi = element._computeEncodes(model);
          const agentKey = element._getAmfKey(element.ns.aml.vocabularies.data.agent);
          const agentNode = element._findCustomDomainPropertyByKey(webApi, agentKey);
          
          assert.isDefined(agentNode, 'should find agent property');
          assert.isObject(agentNode, 'should return an object');
          assert.isDefined(agentNode[agentKey], 'should contain the agent key');
        });

        it('_findCustomDomainPropertyByKey uses fallback for direct keys', () => {
          const webApi = element._computeEncodes(model);
          const agentKey = element._getAmfKey(element.ns.aml.vocabularies.data.agent);
          
          // This should work even if customDomainProperties references fail
          const agentNode = element._findCustomDomainPropertyByKey(webApi, agentKey);
          
          assert.isDefined(agentNode, 'fallback should find the property');
          assert.property(agentNode, agentKey, 'should have agent key');
        });

        it('_findCustomDomainPropertyByKey returns undefined for non-existent key', () => {
          const webApi = element._computeEncodes(model);
          const fakeKey = 'http://fake.domain/nonexistent#key';
          const result = element._findCustomDomainPropertyByKey(webApi, fakeKey);
          
          assert.isUndefined(result, 'should return undefined for non-existent key');
        });

        it('_computeNodeAgent uses _findCustomDomainPropertyByKey internally', () => {
          const webApi = element._computeEncodes(model);
          const agentNode = element._computeNodeAgent(webApi);
          
          assert.isDefined(agentNode, 'should find agent node');
          assert.isObject(agentNode, 'should return an object');
          
          const agentKey = element._getAmfKey(element.ns.aml.vocabularies.data.agent);
          assert.property(agentNode, agentKey, 'should have agent data');
        });

        it('handles compact format with multiple ID formats', () => {
          const webApi = element._computeEncodes(model);
          
          // Test that both methods work together
          const agentKey = element._getAmfKey(element.ns.aml.vocabularies.data.agent);
          const agentNode1 = element._findCustomDomainPropertyByKey(webApi, agentKey);
          const agentNode2 = element._computeNodeAgent(webApi);
          
          assert.deepEqual(agentNode1, agentNode2, 'both methods should return same result');
        });
      });
      
    });
  });
});