import { assert, fixture, html } from '@open-wc/testing';
import { AmfHelperMixin } from '../src/AmfHelperMixin.js';
import { ns } from '../src/Namespace.js';

class TestElement extends AmfHelperMixin(class extends HTMLElement {}) {}
window.customElements.define('operationkind-test-element', TestElement);

describe('_computeOperationKind', () => {
  let el;
  beforeEach(async () => {
    el = await fixture(html`<operationkind-test-element></operationkind-test-element>`);
  });

  it('returns the operationKind value when present', () => {
    const op = { [ns.aml.vocabularies.apiContract.operationKind]: [{ '@value': 'query' }] };
    assert.equal(el._computeOperationKind(op), 'query');
  });

  it('defaults to standard when the field is absent', () => {
    assert.equal(el._computeOperationKind({}), 'standard');
  });

  it('defaults to standard for a falsy operation', () => {
    assert.equal(el._computeOperationKind(undefined), 'standard');
  });
});
