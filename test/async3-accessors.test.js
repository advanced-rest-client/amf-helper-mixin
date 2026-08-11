import { assert, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit-element';
import { AmfHelperMixin } from '../src/AmfHelperMixin.js';

class TestHelper extends AmfHelperMixin(LitElement) {}
window.customElements.define('test-helper-async3', TestHelper);

/** Fetch a fixture model from this repo's apis dir (see test/AmfLoader.js convention). */
async function loadModel(file) {
  const url = `${window.location.protocol}//${window.location.host}/base/apis/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Unable to download ${file}`);
  }
  return res.json();
}

describe('AsyncAPI 3.0 shared accessors', () => {
  let helper;
  let amf;
  before(async () => {
    helper = await fixture(html`<test-helper-async3></test-helper-async3>`);
    amf = await loadModel('async30-compact.json');
    helper.amf = amf;
  });

  /** Find the flattened async operation (action === "send") and its endpoint. */
  function findSendOperation() {
    const graph = helper.amf;
    const nodes = [];
    const walk = (n) => {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { n.forEach(walk); return; }
      nodes.push(n);
      Object.values(n).forEach(walk);
    };
    walk(graph);
    const endpoint = nodes.find((n) =>
      (n['@type'] || []).some((t) => String(t).includes('apiContract#EndPoint')) &&
      n[helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.channelMessages)]);
    const operation = nodes.find((n) =>
      (n['@type'] || []).some((t) => String(t).includes('apiContract#Operation')) &&
      helper._getValue(n, helper.ns.aml.vocabularies.apiContract.action) === 'send');
    return { operation, endpoint };
  }

  it('_computeOperationMethod returns the action for a 3.0 op', () => {
    const { operation } = findSendOperation();
    assert.equal(helper._computeOperationMethod(operation), 'send');
  });

  it('_computeOperationMessages returns the operationMessages array', () => {
    const { operation, endpoint } = findSendOperation();
    const msgs = helper._computeOperationMessages(operation, endpoint);
    assert.isArray(msgs);
    assert.isAtLeast(msgs.length, 1);
  });

  it('_operationColorMethod maps send/receive and passes others through', () => {
    assert.equal(helper._operationColorMethod('send'), 'publish');
    assert.equal(helper._operationColorMethod('receive'), 'subscribe');
    assert.equal(helper._operationColorMethod('get'), 'get');
    assert.equal(helper._operationColorMethod(undefined), undefined);
  });

  it('_computeOperationMethod returns undefined for null op', () => {
    assert.equal(helper._computeOperationMethod(undefined), undefined);
  });

  describe('_computeOperationMessages edge cases', () => {
    it('falls back to the endpoint channelMessages when operationMessages is absent', () => {
      const { apiContract } = helper.ns.aml.vocabularies;
      const operationWithoutMessages = {
        '@id': 'test://op-no-operation-messages',
        '@type': [apiContract.Operation],
      };
      const endpointWithChannelMessages = {
        '@id': 'test://endpoint-with-channel-messages',
        '@type': [apiContract.EndPoint],
        [apiContract.channelMessages]: [{ '@id': 'test://message-from-channel' }],
      };
      const msgs = helper._computeOperationMessages(operationWithoutMessages, endpointWithChannelMessages);
      assert.isArray(msgs);
      assert.lengthOf(msgs, 1);
      assert.equal(msgs[0]['@id'], 'test://message-from-channel');
    });

    it('returns undefined when neither operationMessages nor endpoint channelMessages are present', () => {
      const { apiContract } = helper.ns.aml.vocabularies;
      const operationWithoutMessages = {
        '@id': 'test://op-no-messages-anywhere',
        '@type': [apiContract.Operation],
      };
      assert.equal(helper._computeOperationMessages(operationWithoutMessages), undefined);

      const endpointWithoutChannelMessages = {
        '@id': 'test://endpoint-without-channel-messages',
        '@type': [apiContract.EndPoint],
      };
      assert.equal(
        helper._computeOperationMessages(operationWithoutMessages, endpointWithoutChannelMessages),
        undefined
      );
    });
  });
});

describe('AsyncAPI 2.x _computeOperationMethod branch', () => {
  let helper2;
  before(async () => {
    helper2 = await fixture(html`<test-helper-async3></test-helper-async3>`);
    helper2.amf = await loadModel('async-api.json');
  });

  it('returns the apiContract#method value for a 2.x publish/subscribe op', () => {
    const graph = helper2.amf;
    const nodes = [];
    const walk = (n) => {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { n.forEach(walk); return; }
      nodes.push(n);
      Object.values(n).forEach(walk);
    };
    walk(graph);
    const operation = nodes.find((n) =>
      (n['@type'] || []).some((t) => String(t).includes('apiContract#Operation')) &&
      helper2._getValue(n, helper2.ns.aml.vocabularies.apiContract.method));
    assert.ok(operation, 'fixture must contain an operation with apiContract#method');
    const method = helper2._getValue(operation, helper2.ns.aml.vocabularies.apiContract.method);
    assert.include(['publish', 'subscribe'], method, 'sanity-check the fixture value');
    assert.equal(helper2._computeOperationMethod(operation), method);
  });
});
