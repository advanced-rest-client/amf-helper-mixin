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
      
    });
  });
});
