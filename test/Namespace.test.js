import { assert } from '@open-wc/testing';
import { ns } from '../src/Namespace.js';

describe('Namespace security vocabulary', () => {
  it('defines deviceAuthorizationUri (OAS 3.2 device flow)', () => {
    assert.equal(
      ns.aml.vocabularies.security.deviceAuthorizationUri,
      'http://a.ml/vocabularies/security#deviceAuthorizationUri'
    );
  });
});

describe('Namespace apiContract vocabulary', () => {
  it('defines operationKind (OAS 3.2 operation source container)', () => {
    assert.equal(
      ns.aml.vocabularies.apiContract.operationKind,
      'http://a.ml/vocabularies/apiContract#operationKind'
    );
  });
});
