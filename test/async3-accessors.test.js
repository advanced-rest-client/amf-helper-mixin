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
});
