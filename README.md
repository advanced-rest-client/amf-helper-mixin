# DEPRECATED

This component is being deprecated. The code base has been moved to [amf-components](https://github.com/advanced-rest-client/amf-components) module. This module will be archived when [PR 1](https://github.com/advanced-rest-client/amf-components/pull/1) is merged.

-----

Common functions used by AMF components to compute AMF values.
This mixin is safe to use in both Polymer and LitElement projects as well as pure web components.

[![Published on NPM](https://img.shields.io/npm/v/@api-components/amf-helper-mixin.svg)](https://www.npmjs.com/package/@api-components/amf-helper-mixin)

[![Tests and publishing](https://github.com/advanced-rest-client/amf-helper-mixin/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/amf-helper-mixin/actions/workflows/deployment.yml)

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

## Updating API's base URI

(Only applies when using `_computeUri()` function)

By default the component render the documentation as it is defined
in the AMF model. Sometimes, however, you may need to replace the base URI
of the API with something else. It is useful when the API does not
have base URI property defined (therefore this component render relative
paths instead of URIs) or when you want to manage different environments.

To update base URI value update the `baseUri` property.

When the component constructs the final URI for the endpoint it does the following:

- if the `baseUri` is set it uses this value as a base URI for the endpoint
- else if `amf` is set then it computes base URI value from main model document
Then it concatenates computed base URI with `endpoint`'s path property.

## Using AMF keys

The mixin has AMF's model namespace defined under `ns` property. Use this
structure to request AMF key (for example when calling `_getAmfKey()`).
AMF keys may change over time. This way it allows to manage the keys change easier
as the components don't have to change, just this mixin.

**don't do this**

```javascript
const key = this._getAmfKey(this.ns.aml.vocabularies.document + 'encodes');
const key = shape[this.ns.aml.vocabularies.document + 'encodes'];
```

**do this**

```javascript
const key = this._getAmfKey(this.ns.aml.vocabularies.document.encodes);
const value = model[key];
// acceptable only if AMF model is not compact.
const value = model[this.ns.aml.vocabularies.document.encodes];
```

## Installation

```bash
npm i @api-components/amf-helper-mixin
```

## Usage

```javascript
import { LitElement } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

class AmfHelperImpl extends AmfHelperMixin(LitElement) {
  static get properties() {
    return {
      myProp: { type: String }
    };
  }
}
```

## Development

```sh
git clone https://github.com/@advanced-rest-client/amf-helper-mixin
cd amf-helper-mixin
npm install
```

### Running the tests

```sh
npm test
```

## Deployment

Create a PR to the master branch. Once the master branch has a new commit the `.github/workflows/deployment.yaml` script runs which will publish the release to GitHub and to NPM. Note, you need to manually set a new version of the package.
