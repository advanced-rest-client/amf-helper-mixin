import { assert, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from './amf-loader.js';
import './test-element.js';

/** @typedef {import('./test-element').TestElement} TestElement */

describe('AmfHelperMixin', () => {
  /**
   * @returns {Promise<TestElement>}
   */
  async function basicFixture() {
    return fixture(`<test-element></test-element>`);
  }

  /**
   * @returns {Promise<TestElement>}
   */
  async function modelFixture(amf) {
    return fixture(html`<test-element
      .amf="${amf}"></test-element>`);
  }

  [
    ['Compact model', true],
    ['Regular model', false]
  ].forEach(([label, compact]) => {
    describe(String(label), () => {
      const asyncApi = 'async-api';
      let element = /** @type TestElement */ (null);
      let model;
      let asyncModel;

      before(async () => {
        model = await AmfLoader.load(compact);
        asyncModel = await AmfLoader.load(compact, asyncApi);
      });

      describe('amf setter/getter', () => {
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('sets _amf property', () => {
          element.amf = model;
          assert.isTrue(element._amf === model);
        });
      });

      describe('ns getter', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('returns an object', () => {
          assert.typeOf(element.ns, 'object');
        });

        it('returns namespace', () => {
          assert.include(element.ns.aml.vocabularies.apiContract.key, 'apiContract#');
        });
      });

      describe('__amfChanged()', () => {
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('calls the function when amf property change', () => {
          const spy = sinon.spy(element, '__amfChanged');
          element.amf = model;
          assert.isTrue(spy.args[0][0] === model);
        });

        it('calls the function only once', () => {
          const spy = sinon.spy(element, '__amfChanged');
          element.amf = model;
          element.amf = model;
          assert.equal(spy.callCount, 1);
        });
      });

      describe('_getAmfKey()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined when no argument', () => {
          const result = element._getAmfKey(undefined);
          assert.isUndefined(result);
        });

        it('Returns passed property when no amf', () => {
          element.amf = undefined;
          const result = element._getAmfKey(element.ns.schema.desc);
          assert.equal(result, element.ns.schema.desc);
        });

        it('Returns value for property', () => {
          const result = element._getAmfKey(element.ns.schema.desc);
          if (compact) {
            assert.equal(result.split(':')[1], 'description');
          } else {
            assert.equal(result, element.ns.schema.desc);
          }
        });
      });

      describe('_ensureAmfModel()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._ensureAmfModel());
        });

        it('Returns model for array model value', () => {
          const result = element._ensureAmfModel(model);
          assert.typeOf(result, 'object');
        });

        it('Returns model for object model value', () => {
          const result = element._ensureAmfModel(model[0]);
          assert.typeOf(result, 'object');
        });

        it('Returns undefined when no type', () => {
          const result = element._ensureAmfModel([{}]);
          assert.isUndefined(result);
        });

        it('Namespace property is set', () => {
          assert.typeOf(element.ns, 'object');
        });
      });

      describe('AMF keys namespace', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Exposes namespace object', () => {
          assert.typeOf(element.ns, 'object');
        });

        it('ns has all keys', () => {
          const keys = Object.keys(element.ns);
          const compare = ['aml', 'raml', 'w3', 'schema'];
          assert.deepEqual(keys, compare);
        });

        it('aml properties are set', () => {
          const r = element.ns.aml;
          assert.equal(r.key, 'http://a.ml/');
          assert.typeOf(r.vocabularies, 'object');
        });

        it('aml cannot be changed', () => {
          assert.throws(() => {
            // @ts-ignore
            element.ns.aml = 'test';
          });
        });

        it('raml property is amf', () => {
          const r = element.ns.raml;
          const a = element.ns.aml;
          assert.equal(r, a);
        });

        it('aml.vocabularies properties are set', () => {
          const v = element.ns.aml.vocabularies;
          const key = 'http://a.ml/vocabularies/';
          assert.equal(v.key, key, 'key is set');
          assert.typeOf(v.document, 'object', 'document is set');
          assert.equal(v.document.toString(), `${key}document#`, 'document namespace as string is the key');
          assert.equal(v.document.key, `${key}document#`, 'document key is set');
          assert.typeOf(v.core, 'object', 'core is set');
          assert.equal(v.core.toString(), `${key}core#`, 'core namespace as string is the key');
          assert.equal(v.core.key, `${key}core#`, 'core key is set');
          assert.typeOf(v.apiContract, 'object', 'apiContract is set');
          assert.equal(v.apiContract.toString(), `${key}apiContract#`, 'apiContract namespace as string is the key');
          assert.equal(v.apiContract.key, `${key}apiContract#`, 'apiContract.key is set');
          assert.typeOf(v.security, 'object', 'security is set');
          assert.equal(v.security.toString(), `${key}security#`, 'security namespace as string is the key');
          assert.equal(v.security.key, `${key}security#`, 'security.key is set');
          assert.typeOf(v.shapes, 'object', 'shapes is set');
          assert.equal(v.shapes.toString(), `${key}shapes#`, 'shapes namespace as string is the key');
          assert.equal(v.shapes.key, `${key}shapes#`, 'shapes.key is set');
          assert.typeOf(v.data, 'object', 'data is set');
          assert.equal(v.data.toString(), `${key}data#`, 'data namespace as string is the key');
          assert.equal(v.data.key, `${key}data#`, 'data.key is set');
        });

        it('vocabularies cannot be changed', () => {
          assert.throws(() => {
            // @ts-ignore
            element.ns.aml.vocabularies = 'test';
          });
        });

        it('w3 properties are set', () => {
          const r = element.ns.w3;
          const {key} = r;
          assert.equal(r.key, 'http://www.w3.org/', 'key is set');
          assert.typeOf(r.rdfSyntax, 'object', 'rdfSyntax is set');
          assert.equal(r.rdfSyntax.toString(), `${key}1999/02/22-rdf-syntax-ns#`, 'rdfSyntax namespace as string is the key');
          assert.equal(r.rdfSyntax.key, `${key}1999/02/22-rdf-syntax-ns#`, 'rdfSyntax.key is set');
          assert.typeOf(r.rdfSchema, 'object', 'rdfSchema is set');
          assert.equal(r.rdfSchema.toString(), `${key}2000/01/rdf-schema#`, 'rdfSchema namespace as string is the key');
          assert.equal(r.rdfSchema.key, `${key}2000/01/rdf-schema#`, 'rdfSchema.key is set');
          assert.typeOf(r.hydra, 'object', 'hydra is set');
          assert.equal(r.hydra.toString(), `${key}ns/hydra/`, 'hydra namespace as string is the key');
          assert.equal(r.hydra.key, `${key}ns/hydra/`, 'hydra.key is set');
          assert.typeOf(r.xmlSchema, 'object', 'xmlSchema is set');
          assert.equal(r.xmlSchema.toString(), `${key}2001/XMLSchema#`, 'xmlSchema namespace as string is the key');
          assert.equal(r.xmlSchema.key, `${key}2001/XMLSchema#`, 'xmlSchema.key is set');
          assert.typeOf(r.shacl, 'object', 'shacl is set');
          assert.equal(r.shacl.toString(), `${key}ns/shacl#`, 'shacl namespace as string is the key');
          assert.equal(r.shacl.key, `${key}ns/shacl#`, 'shacl.key is set');
        });

        it('w3 cannot be changed', () => {
          assert.throws(() => {
            // @ts-ignore
            element.ns.w3 = 'test';
          });
        });

        it('hydra properties are set', () => {
          const h = element.ns.w3.hydra;
          const key = 'http://www.w3.org/ns/hydra/';
          assert.equal(h.toString(), key, 'the namespace as string is the key');
          assert.equal(h.key, key);
          assert.equal(h.core, element.ns.aml.vocabularies.apiContract);
          // @ts-ignore
          assert.equal(h.supportedOperation, 'http://a.ml/vocabularies/apiContract#supportedOperation');
        });

        it('hydra cannot be changed', () => {
          assert.throws(() => {
            // @ts-ignore
            element.ns.w3.hydra = 'test';
          });
        });

        it('shacl properties are set', () => {
          const s = element.ns.w3.shacl;
          const key = 'http://www.w3.org/ns/shacl#';
          assert.equal(s.key, key, 'key is set');
          [
            'in',
            'defaultValue',
            'defaultValueStr',
            'pattern',
            'minInclusive',
            'maxInclusive',
            'multipleOf',
            'minLength',
            'maxLength',
            'fileType',
            'and',
            'property',
            'name',
            'raw',
            'datatype',
            'minCount',
            'Shape',
            'NodeShape',
            'SchemaShape',
            'PropertyShape',
            'xone',
            'not',
            'or',
          ].forEach((name) => {
            assert.equal(s[name], key + name, `${name  } is set`);
          });
        });

        it('shacl cannot be changed', () => {
          assert.throws(() => {
            // @ts-ignore
            element.ns.w3.shacl = 'test';
          });
        });

        it('schema properties are set', () => {
          const s = element.ns.schema;
          const {key} = element.ns.aml.vocabularies.core;
          assert.equal(s.key, key, 'key is set');
          assert.equal(s.name, `${key}name`, 'name is set');
          assert.equal(s.desc, `${key}description`);
          assert.equal(s.doc, `${key}documentation`);
          assert.equal(s.webApi, `${element.ns.aml.vocabularies.apiContract.key  }WebAPI`);
          assert.equal(s.creativeWork, `${key}CreativeWork`);
          ['displayName', 'title'].forEach((name) => {
            assert.equal(s[name], key + name);
          });
        });

        it('schema cannot be changed', () => {
          assert.throws(() => {
            // @ts-ignore
            element.ns.schema = 'test';
          });
        });
      });

      describe('vocabularies.document namespace', () => {
        const key = 'http://a.ml/vocabularies/document#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['Module', `${key}Module`],
          ['Document', `${key}Document`],
          ['SecuritySchemeFragment', `${key}SecuritySchemeFragment`],
          ['UserDocumentation', `${key}UserDocumentation`],
          ['DataType', `${key}DataType`],
          ['NamedExamples', `${key}NamedExamples`],
          ['DomainElement', `${key}DomainElement`],
          ['customDomainProperties', `${key}customDomainProperties`],
          ['encodes', `${key}encodes`],
          ['declares', `${key}declares`],
          ['references', `${key}references`],
          ['examples', `${key}examples`],
          ['linkTarget', `${key}link-target`],
          ['referenceId', `${key}reference-id`],
          ['structuredValue', `${key}structuredValue`],
          ['raw', `${key}raw`],
          ['extends', `${key}extends`],
          ['value', `${key}value`],
          ['name', `${key}name`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.document[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.security namespace', () => {
        const key = 'http://a.ml/vocabularies/security#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['ParametrizedSecurityScheme', `${key}ParametrizedSecurityScheme`],
          ['SecuritySchemeFragment', `${key}SecuritySchemeFragment`],
          ['SecurityScheme', `${key}SecurityScheme`],
          ['OAuth1Settings', `${key}OAuth1Settings`],
          ['OAuth2Settings', `${key}OAuth2Settings`],
          ['Scope', `${key}Scope`],
          ['Settings', `${key}Settings`],
          ['HttpSettings', `${key}HttpSettings`],
          ['ApiKeySettings', `${key}ApiKeySettings`],
          ['OpenIdConnectSettings', `${key}OpenIdConnectSettings`],
          ['security', `${key}security`],
          ['scheme', `${key}scheme`],
          ['settings', `${key}settings`],
          ['name', `${key}name`],
          ['type', `${key}type`],
          ['scope', `${key}scope`],
          ['accessTokenUri', `${key}accessTokenUri`],
          ['authorizationUri', `${key}authorizationUri`],
          ['authorizationGrant', `${key}authorizationGrant`],
          ['flows', `${key}flows`],
          ['flow', `${key}flow`],
          ['signature', `${key}signature`],
          ['tokenCredentialsUri', `${key}tokenCredentialsUri`],
          ['requestTokenUri', `${key}requestTokenUri`],
          ['securityRequirement', `${key}SecurityRequirement`],
          ['openIdConnectUrl', `${key}openIdConnectUrl`],
          ['bearerFormat', `${key}bearerFormat`],
          ['in', `${key}in`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.security[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.core namespace', () => {
        const key = 'http://a.ml/vocabularies/core#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['CreativeWork', `${key}CreativeWork`],
          ['version', `${key}version`],
          ['urlTemplate', `${key}urlTemplate`],
          ['displayName', `${key}displayName`],
          ['title', `${key}title`],
          ['name', `${key}name`],
          ['description', `${key}description`],
          ['documentation', `${key}documentation`],
          ['version', `${key}version`],
          ['provider', `${key}provider`],
          ['email', `${key}email`],
          ['url', `${key}url`],
          ['termsOfService', `${key}termsOfService`],
          ['license', `${key}license`],
          ['mediaType', `${key}mediaType`],
          ['extensionName', `${key}extensionName`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.core[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.apiContract namespace', () => {
        const key = 'http://a.ml/vocabularies/apiContract#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['Payload', `${key}Payload`],
          ['Request', `${key}Request`],
          ['Response', `${key}Response`],
          ['EndPoint', `${key}EndPoint`],
          ['Parameter', `${key}Parameter`],
          ['Operation', `${key}Operation`],
          ['WebAPI', `${key}WebAPI`],
          ['AsyncAPI', `${key}AsyncAPI`],
          ['API', `${key}API`],
          ['UserDocumentationFragment', `${key}UserDocumentationFragment`],
          ['Example', `${key}Example`],
          ['Server', `${key}Server`],
          ['ParametrizedResourceType', `${key}ParametrizedResourceType`],
          ['ParametrizedTrait', `${key}ParametrizedTrait`],
          ['TemplatedLink', `${key}TemplatedLink`],
          ['IriTemplateMapping', `${key}IriTemplateMapping`],
          ['Callback', `${key}Callback`],
          ['header', `${key}header`],
          ['parameter', `${key}parameter`],
          ['paramName', `${key}paramName`],
          ['uriParameter', `${key}uriParameter`],
          ['variable', `${key}variable`],
          ['payload', `${key}payload`],
          ['path', `${key}path`],
          ['url', `${key}url`],
          ['scheme', `${key}scheme`],
          ['endpoint', `${key}endpoint`],
          ['queryString', `${key}queryString`],
          // ['mediaType', key + 'mediaType'],
          ['accepts', `${key}accepts`],
          ['guiSummary', `${key}guiSummary`],
          ['binding', `${key}binding`],
          ['response', `${key}response`],
          ['returns', `${key}returns`],
          ['expects', `${key}expects`],
          ['examples', `${key}examples`],
          ['supportedOperation', `${key}supportedOperation`],
          ['statusCode', `${key}statusCode`],
          ['method', `${key}method`],
          ['required', `${key}required`],
          ['callback', `${key}callback`],
          ['expression', `${key}expression`],
          ['link', `${key}link`],
          ['linkExpression', `${key}linkExpression`],
          ['templateVariable', `${key}templateVariable`],
          ['mapping', `${key}mapping`],
          ['operationId', `${key}operationId`],
          ['protocol', `${key}protocol`],
          ['protocolVersion', `${key}protocolVersion`],
          ['Message', `${key}Message`],
          ['contentType', `${key}contentType`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.apiContract[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.shapes namespace', () => {
        const key = 'http://a.ml/vocabularies/shapes#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['ScalarShape', `${key}ScalarShape`],
          ['ArrayShape', `${key}ArrayShape`],
          ['UnionShape', `${key}UnionShape`],
          ['NilShape', `${key}NilShape`],
          ['FileShape', `${key}FileShape`],
          ['AnyShape', `${key}AnyShape`],
          ['SchemaShape', `${key}SchemaShape`],
          ['MatrixShape', `${key}MatrixShape`],
          ['TupleShape', `${key}TupleShape`],
          ['DataTypeFragment', `${key}DataTypeFragment`],
          ['RecursiveShape', `${key}RecursiveShape`],
          ['range', `${key}range`],
          ['items', `${key}items`],
          ['anyOf', `${key}anyOf`],
          ['fileType', `${key}fileType`],
          ['number', `${key}number`],
          ['integer', `${key}integer`],
          ['long', `${key}long`],
          ['double', `${key}double`],
          ['boolean', `${key}boolean`],
          ['float', `${key}float`],
          ['nil', `${key}nil`],
          ['dateTimeOnly', `${key}dateTimeOnly`],
          ['password', `${key}password`],
          ['schema', `${key}schema`],
          ['xmlSerialization', `${key}xmlSerialization`],
          ['xmlName', `${key}xmlName`],
          ['xmlAttribute', `${key}xmlAttribute`],
          ['xmlWrapped', `${key}xmlWrapped`],
          ['readOnly', `${key}readOnly`],
          ['deprecated', `${key}deprecated`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.shapes[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.data namespace', () => {
        const key = 'http://a.ml/vocabularies/data#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['Scalar', `${key}Scalar`],
          ['Object', `${key}Object`],
          ['Array', `${key}Array`],
          ['value', `${key}value`],
          ['description', `${key}description`],
          ['required', `${key}required`],
          ['displayName', `${key}displayName`],
          ['minLength', `${key}minLength`],
          ['maxLength', `${key}maxLength`],
          ['default', `${key}default`],
          ['multipleOf', `${key}multipleOf`],
          ['minimum', `${key}minimum`],
          ['maximum', `${key}maximum`],
          ['enum', `${key}enum`],
          ['pattern', `${key}pattern`],
          ['items', `${key}items`],
          ['format', `${key}format`],
          ['example', `${key}example`],
          ['examples', `${key}examples`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.data[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.docSourceMaps namespace', () => {
        const key = 'http://a.ml/vocabularies/document-source-maps#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['sources', `${key}sources`],
          ['element', `${key}element`],
          ['value', `${key}value`],
          ['declaredElement', `${key}declared-element`],
          ['trackedElement', `${key}tracked-element`],
          ['parsedJsonSchema', `${key}parsed-json-schema`],
          ['lexical', `${key}lexical`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.docSourceMaps[property];
            assert.equal(result, value);
          });
        });
      });

      describe('w3.shacl namespace', () => {
        const key = 'http://www.w3.org/ns/shacl#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['Shape', `${key}Shape`],
          ['NodeShape', `${key}NodeShape`],
          ['SchemaShape', `${key}SchemaShape`],
          ['PropertyShape', `${key}PropertyShape`],
          ['in', `${key}in`],
          ['defaultValue', `${key}defaultValue`],
          ['defaultValueStr', `${key}defaultValueStr`],
          ['pattern', `${key}pattern`],
          ['minInclusive', `${key}minInclusive`],
          ['maxInclusive', `${key}maxInclusive`],
          ['multipleOf', `${key}multipleOf`],
          ['minLength', `${key}minLength`],
          ['maxLength', `${key}maxLength`],
          ['fileType', `${key}fileType`],
          ['and', `${key}and`],
          ['property', `${key}property`],
          ['name', `${key}name`],
          ['raw', `${key}raw`],
          ['datatype', `${key}datatype`],
          ['minCount', `${key}minCount`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.w3.shacl[property];
            assert.equal(result, value);
          });
        });
      });

      describe('w3.xmlSchema namespace', () => {
        const key = 'http://www.w3.org/2001/XMLSchema#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['boolean', `${key}boolean`],
          ['string', `${key}string`],
          ['number', `${key}number`],
          ['integer', `${key}integer`],
          ['long', `${key}long`],
          ['double', `${key}double`],
          ['float', `${key}float`],
          ['nil', `${key}nil`],
          ['dateTime', `${key}dateTime`],
          ['time', `${key}time`],
          ['date', `${key}date`],
          ['base64Binary', `${key}base64Binary`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.w3.xmlSchema[property];
            assert.equal(result, value);
          });
        });
      });

      describe('w3.rdfSyntax namespace', () => {
        const key = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['member', `${key}member`],
          ['Seq', `${key}Seq`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.w3.rdfSyntax[property];
            assert.equal(result, value);
          });
        });
      });

      describe('w3.rdfSchema namespace', () => {
        const key = 'http://www.w3.org/2000/01/rdf-schema#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['member', `${key}member`],
          ['Seq', `${key}Seq`],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.w3.rdfSchema[property];
            assert.equal(result, value);
          });
        });
      });

      describe('_getValue()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._getValue(undefined, undefined));
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._getValue(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._getValue({}, undefined));
        });

        it('Returns undefined if no key in object', () => {
          assert.isUndefined(
            element._getValue(
              {
                a: [],
                b: []
              },
              'c'
            )
          );
        });

        it('Returns undefined if no value in value array', () => {
          assert.isUndefined(
            element._getValue(
              {
                a: []
              },
              'a'
            )
          );
        });

        it('Returns the value', () => {
          assert.equal(
            element._getValue(
              {
                a: [
                  {
                    '@value': 'test'
                  }
                ]
              },
              'a'
            ),
            'test'
          );
        });

        it('Returns primitive value from compact model', () => {
          assert.equal(
            element._getValue(
              {
                a: 'test'
              },
              'a'
            ),
            'test'
          );
        });
      });

      describe('_getValueArray()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._getValueArray(undefined, undefined));
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._getValueArray(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._getValueArray({}, undefined));
        });

        it('Returns undefined if no key in object', () => {
          assert.isUndefined(
            element._getValueArray(
              {
                a: [],
                b: []
              },
              'c'
            )
          );
        });

        it('Returns empty array if no value in value array', () => {
          assert.deepEqual(
            element._getValueArray(
              {
                a: []
              },
              'a'
            ),
            []
          );
        });

        it('Returns the values', () => {
          assert.deepEqual(
            element._getValueArray(
              {
                a: [
                  {
                    '@value': 'test'
                  },
                  {
                    '@value': 'test2'
                  }
                ]
              },
              'a'
            ),
            ['test', 'test2']
          );
        });

        it('Returns values for non object values', () => {
          assert.deepEqual(
            element._getValueArray(
              {
                a: ['test', 'test2']
              },
              'a'
            ),
            ['test', 'test2']
          );
        });
      });

      describe('_hasType()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns false if no arguments', () => {
          assert.isFalse(element._hasType(undefined, undefined));
        });

        it('Returns false if no model argument', () => {
          assert.isFalse(element._hasType(undefined, 'test'));
        });

        it('Returns false if no key argument', () => {
          assert.isFalse(element._hasType({}, undefined));
        });

        it('Returns false if type does not match', () => {
          assert.isFalse(
            element._hasType(
              {
                '@type': ['a', 'b']
              },
              'c'
            )
          );
        });

        it('Returns true if type does match', () => {
          assert.isTrue(
            element._hasType(
              {
                '@type': ['a', 'b', 'c']
              },
              'c'
            )
          );
        });
      });

      describe('_hasProperty()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns false if no arguments', () => {
          assert.isFalse(element._hasProperty(undefined, undefined));
        });

        it('Returns false if no model argument', () => {
          assert.isFalse(element._hasProperty(undefined, 'test'));
        });

        it('Returns false if no key argument', () => {
          assert.isFalse(element._hasProperty({}, undefined));
        });

        it('Returns false if type does not have property', () => {
          assert.isFalse(
            element._hasProperty(
              {
                a: 'test',
                b: 'test'
              },
              'c'
            )
          );
        });

        it('Returns true if have a property', () => {
          assert.isTrue(
            element._hasProperty(
              {
                a: 'test',
                b: 'test',
                c: 'test'
              },
              'c'
            )
          );
        });
      });

      describe('_computePropertyArray()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._computePropertyArray(undefined, undefined));
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computePropertyArray(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._computePropertyArray({}, undefined));
        });

        it('Returns array', () => {
          assert.deepEqual(
            element._computePropertyArray(
              {
                test: ['a', 'b', 'c']
              },
              'test'
            ),
            ['a', 'b', 'c']
          );
        });
      });

      describe('_computePropertyObject()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._computePropertyObject(undefined, undefined));
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computePropertyObject(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._computePropertyObject({}, undefined));
        });

        it('Returns bolean value', () => {
          assert.isTrue(
            element._computePropertyObject(
              {
                test: [true]
              },
              'test'
            )
          );

          assert.isFalse(
            element._computePropertyObject(
              {
                test: [false]
              },
              'test'
            )
          );
        });

        it('Returns null value', () => {
          assert.equal(
            element._computePropertyObject(
              {
                test: [null]
              },
              'test'
            ),
            null
          );
        });

        it('Returns string value', () => {
          assert.equal(
            element._computePropertyObject(
              {
                test: ['test-value']
              },
              'test'
            ),
            'test-value'
          );
        });

        it('Returns number value', () => {
          assert.equal(
            element._computePropertyObject(
              {
                test: [123]
              },
              'test'
            ),
            123
          );
        });

        it('Returns 0 value', () => {
          assert.equal(
            element._computePropertyObject(
              {
                test: [0]
              },
              'test'
            ),
            0
          );
        });
      });

      describe('_computeHasStringValue()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns false if no argument', () => {
          assert.isFalse(element._computeHasStringValue(undefined));
        });

        it('Returns false if empty string', () => {
          assert.isFalse(element._computeHasStringValue(''));
        });

        it('Returns true if not empty string', () => {
          assert.isTrue(element._computeHasStringValue('a'));
        });

        it('Returns true if an object', () => {
          assert.isTrue(element._computeHasStringValue({ a: 'b' }));
        });

        it('Returns true if a number', () => {
          assert.isTrue(element._computeHasStringValue(125));
          assert.isTrue(element._computeHasStringValue(0));
        });
      });

      describe('_computeHasStringValue()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns false if no argument', () => {
          assert.isFalse(element._computeHasStringValue(undefined));
        });

        it('Returns false if empty string', () => {
          assert.isFalse(element._computeHasStringValue(''));
        });

        it('Returns true if not empty string', () => {
          assert.isTrue(element._computeHasStringValue('a'));
        });

        it('Returns true if an object', () => {
          assert.isTrue(element._computeHasStringValue({ a: 'b' }));
        });

        it('Returns true if a number', () => {
          assert.isTrue(element._computeHasStringValue(125));
          assert.isTrue(element._computeHasStringValue(0));
        });
      });

      describe('_computeHasArrayValue()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns false if no argument', () => {
          assert.isFalse(element._computeHasArrayValue(undefined));
        });

        it('Returns false if empty array', () => {
          assert.isFalse(element._computeHasArrayValue([]));
        });

        it('Returns false if not array', () => {
          // @ts-ignore
          assert.isFalse(element._computeHasArrayValue('a'));
        });

        it('Returns true if array has items', () => {
          assert.isTrue(element._computeHasStringValue(['a']));
        });
      });

      describe('_computeDescription()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeDescription(undefined));
        });

        it('Returns undefined if empty object', () => {
          assert.isUndefined(element._computeDescription({}));
        });

        it('Returns undefined if no description key', () => {
          assert.isUndefined(
            element._computeDescription({
              a: 'test'
            })
          );
        });

        it('Returns the description', () => {
          const shape = {};
          const key = element._getAmfKey(element.ns.schema.desc);
          shape[key] = [
            {
              '@value': ['test']
            }
          ];
          assert.equal(element._computeDescription(shape), 'test');
        });
      });

      describe('_computeEncodes()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeEncodes(undefined));
        });

        it('Returns undefined if no encodes', () => {
          assert.isUndefined(element._computeEncodes({}));
        });

        it('Returns an array from AMF model', () => {
          const result = element._computeEncodes(model);
          assert.typeOf(result, 'object');
        });
      });

      describe('_computeDeclares()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeDeclares(undefined));
        });

        it('Returns undefined if no declares', () => {
          assert.isUndefined(element._computeDeclares({}));
        });

        it('Returns undefined argument is empty array', () => {
          assert.isUndefined(element._computeDeclares([]));
        });

        it('Returns an array from AMF model', () => {
          const result = element._computeDeclares(model);
          assert.typeOf(result, 'array');
        });

        it('returns all items in the array', () => {
          const result = element._computeDeclares(model);
          assert.lengthOf(result, 14);
        });
      });

      describe('_computeReferences()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeReferences(undefined));
        });

        it('Returns undefined argument is empty array', () => {
          assert.isUndefined(element._computeReferences([]));
        });

        it('Returns undefined if no references', () => {
          assert.isUndefined(element._computeReferences({}));
        });

        it('Returns an array from AMF model', () => {
          const result = element._computeReferences(model);
          assert.typeOf(result, 'array');
        });

        it('Returns all items in the array', () => {
          const result = element._computeReferences(model);
          assert.lengthOf(result, 9);
        });
      });

      describe('_computeWebApi()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeWebApi(undefined));
        });

        it('Returns undefined if no encodes', () => {
          assert.isUndefined(element._computeWebApi({}));
        });

        it('Returns undefined if no WebApi', () => {
          const key = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
          const amfModel = {};
          amfModel[key] = {};
          assert.isUndefined(element._computeWebApi(amfModel));
        });

        it('Returns an object from AMF model', () => {
          const result = element._computeWebApi(model);
          assert.typeOf(result, 'object');
        });

        it('should return undefined for AsyncAPI model', async () => {
          element = await modelFixture(asyncModel);
          assert.isUndefined(element._computeWebApi(asyncModel));
        })
      });

      describe('_computeApi()', () => {
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('should return undefined if no argument', () => {
          assert.isUndefined(element._computeApi());
        });

        it('should return undefined if no encodes', () => {
          assert.isUndefined(element._computeApi({}));
        });

        it('should return undefined if not API', () => {
          const key = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
          const amfModel = {};
          amfModel[key] = {};
          assert.isUndefined(element._computeApi(amfModel));
        });

        describe('WebAPI', () => {
          beforeEach(async () => {
            element = await modelFixture(model);
          });

          it('should return encodes node from AMF model', () => {
            const result = element._computeApi(asyncModel);
            assert.typeOf(result, 'object');
          });

          it('should return encodes if API type is missing but WebAPI type is present', () => {
            const key = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
            const webApiKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.WebAPI);
            const amfModel = {};
            amfModel[key] = {
              '@type': [webApiKey]
            };
            assert.typeOf(element._computeApi(amfModel), 'object');
          });
        });

        describe('AsyncAPI', () => {
          beforeEach(async () => {
            element = await modelFixture(asyncModel);
          });

          it('should return encodes node from AMF model', () => {
            const result = element._computeApi(asyncModel);
            assert.typeOf(result, 'object');
          });

          it('should return encodes if API type is missing but WebAPI type is present', () => {
            const key = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
            const asyncApiKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.AsyncAPI);
            const amfModel = {};
            amfModel[key] = {
              '@type': [asyncApiKey]
            };
            assert.typeOf(element._computeApi(amfModel), 'object');
          });
        });
      });

      describe('_isWebAPI()', () => {
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('should return false if no argument', () => {
          assert.isFalse(element._isWebAPI());
        });

        it('should return false if no encodes', () => {
          assert.isFalse(element._isWebAPI({}));
        });

        it('should return false for AsyncAPI', async () => {
          element = await modelFixture(asyncModel);
          assert.isFalse(element._isWebAPI(asyncModel));
        });

        it('should return true for WebAPI', async () => {
          element = await modelFixture(model);
          assert.isTrue(element._isWebAPI(model));
        });
      });

      describe('_isAsyncAPI()', () => {
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('should return false if no argument', () => {
          assert.isFalse(element._isAsyncAPI());
        });

        it('should return false if no encodes', () => {
          assert.isFalse(element._isAsyncAPI({}));
        });

        it('should return true for AsyncAPI', async () => {
          element = await modelFixture(asyncModel);
          assert.isTrue(element._isAsyncAPI(asyncModel));
        });

        it('should return false for WebAPI', async () => {
          element = await modelFixture(model);
          assert.isFalse(element._isAsyncAPI(model));
        });
      });

      describe('_isAPI()', () => {
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('should return false if no argument', () => {
          assert.isFalse(element._isAPI());
        });

        it('should return false if no encodes', () => {
          assert.isFalse(element._isAPI({}));
        });

        it('should return true for AsyncAPI', async () => {
          element = await modelFixture(asyncModel);
          assert.isTrue(element._isAPI(asyncModel));
        });

        it('should return true for WebAPI', async () => {
          element = await modelFixture(model);
          assert.isTrue(element._isAPI(model));
        });
      });

      describe('_computeServer()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeServer(undefined));
        });

        it('Returns undefined if no encodes', () => {
          assert.isUndefined(element._computeServer({}));
        });

        it('Returns an object from AMF model', () => {
          const result = element._computeServer(model);
          assert.typeOf(result, 'object');
        });
      });

      describe('_getServers()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        describe('RAML', () => {
          describe('root level', () => {
            it('Returns all servers', () => {
              const servers = element._getServers({});
              assert.typeOf(servers, 'array');
              assert.lengthOf(servers, 1);
            });
          });
        });

        describe('OAS', () => {
          let methodId;
          // TODO uncomment this once AMF model has resolved servers on all levels
          // const endpointId = `${compact ? '' : 'amf://id'}#22`;

          before(async () => {
            model = await AmfLoader.load(compact, 'multiple-servers');
            methodId = AmfLoader.lookupOperation(model, '/pets', 'get')['@id'];
          });

          after(async () => {
            model = await AmfLoader.load(compact);
          });

          describe('for operation', () => {
            beforeEach(async () => {
              element = await modelFixture(model);
            });

            it('Returns all servers for method', () => {
              const servers = element._getServers({ methodId });
              assert.typeOf(servers, 'array');
              assert.lengthOf(servers, 2);
            });

            it('Returns all root servers if method not found and endpoint undefined', () => {
              const servers = element._getServers({ methodId: 'foo' });
              assert.typeOf(servers, 'array');
              assert.lengthOf(servers, 2);
            });

            // TODO uncomment this once AMF model has resolved servers on all levels
            /* it('Returns all endpoint servers if method not found and endpoint is defined', () => {
              const servers = element._getServers({ model, methodId: 'foo', endpointId });
              assert.typeOf(servers, 'array');
              assert.lengthOf(servers, 2);
            }); */

            it('Returns undefined if no model', async () => {
              element = await modelFixture();
              assert.isUndefined(element._getServers({}));
            });

            it('Returns all method servers for partial model', () => {
              const operation = { ...AmfLoader.lookupOperation(model, '/pets', 'get') };
              operation['@context'] = (model[0] || model)['@context'];
              element.amf = operation;
              const servers = element._getServers({ methodId });
              assert.typeOf(servers, 'array');
              assert.lengthOf(servers, 2);
            });
          });
        });
      });

      describe('_getServer()', () => {
          describe('RAML', () => {
            beforeEach(async () => {
              element = await modelFixture(model);
            });

            describe('root level', () => {
              it('Returns no servers if id undefined', () => {
                const servers = element._getServer({});
                assert.typeOf(servers, 'array');
                assert.lengthOf(servers, 0);
              });

              it('Returns all matching servers if id is defined', () => {
                const id = element._getServers({})[0]['@id'];
                const servers = element._getServer({ id });
                assert.typeOf(servers, 'array');
                assert.lengthOf(servers, 1);
              });

              it('Returns [] if no matching id', () => {
                const servers = element._getServer({ id: 'foo' });
                assert.typeOf(servers, 'array');
                assert.lengthOf(servers, 0);
              });
            });
          });

        describe('OAS', () => {
          let methodId;

          before(async () => {
            model = await AmfLoader.load(compact, 'multiple-servers');
            const method = AmfLoader.lookupOperation(model, '/pets', 'get');
            methodId = method['@id'];
          });

          after(async () => {
            model = await AmfLoader.load(compact);
          });

          describe('operation', () => {
            it('Returns no servers if id undefined', () => {
              const servers = element._getServer({ methodId });
              assert.typeOf(servers, 'array');
              assert.lengthOf(servers, 0);
            });

            it('Returns all matching servers if id is defined', () => {
              const id = element._getServers({})[0]['@id'];
              const servers = element._getServer({ methodId, id });
              assert.typeOf(servers, 'array');
              assert.lengthOf(servers, 1);
            });
          });
        });
      });

      describe('_computeProtocols()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeProtocols(undefined));
        });

        it('Returns array with values', () => {
          const result = element._computeProtocols(model);
          assert.typeOf(result, 'array');
          assert.deepEqual(result, ['HTTPS']);
        });
      });

      describe('_computeEndpointByPath()', () => {
        // let webApi;
        before(async () => {
          element = await modelFixture(model);
          // webApi = element._computeWebApi(model);
        });

        it('Returns undefined if no model argument', () => {
          const result = element._computeEndpointByPath(undefined, '/test');
          assert.isUndefined(result);
        });

        it('Returns undefined if no path argument', () => {
          const webApi = element._computeWebApi(model);
          const result = element._computeEndpointByPath(webApi, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined if path not found', () => {
          const webApi = element._computeWebApi(model);
          const result = element._computeEndpointByPath(webApi, '/test');
          assert.isUndefined(result);
        });

        it('Returns model for an endpoint', () => {
          const webApi = element._computeWebApi(model);
          const result = element._computeEndpointByPath(webApi, '/changes');
          assert.typeOf(result, 'object');
        });
      });

      describe('_computeEndpoints()', () => {
        let webApi;
        before(async () => {
          element = await modelFixture(model);
          webApi = element._computeWebApi(model);
        });

        it('Returns a list of endpoints', () => {
          const result = element._computeEndpoints(webApi);
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 36);
        });
      });

      describe('_computeExpects()', () => {
        let operation;
        let noExpectsOperation;
        before(async () => {
          element = await modelFixture(model);
          const webApi = element._computeWebApi(model);
          const endpoint = element._computeEndpointByPath(webApi, '/changes/watch');
          const key = element._getAmfKey(element.ns.aml.vocabularies.apiContract.supportedOperation);
          // eslint-disable-next-line prefer-destructuring
          operation = endpoint[key][0];
          // eslint-disable-next-line prefer-destructuring
          noExpectsOperation = endpoint[key][1];
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeExpects(undefined));
        });

        it('Returns undefined if operation does not have "expects"', () => {
          assert.isUndefined(element._computeExpects(noExpectsOperation));
        });

        it('Returns object for an operation', () => {
          const result = element._computeExpects(operation);
          assert.typeOf(result, 'object');
        });
      });

      describe('_computeEndpointModel()', () => {
        let webApi;
        before(async () => {
          element = await modelFixture(model);
          webApi = element._computeWebApi(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._computeEndpointModel(undefined, undefined));
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computeEndpointModel(undefined, 'test'));
        });

        it('Returns undefined if no selected argument', () => {
          assert.isUndefined(element._computeEndpointModel(webApi, undefined));
        });

        it('Returns undefined if selection does not exists', () => {
          assert.isUndefined(element._computeEndpointModel(webApi, 'hello'));
        });

        it('Returns object for endpoint', () => {
          const endpoint = element._computeEndpointByPath(webApi, '/changes/watch');
          const id = endpoint['@id'];
          const result = element._computeEndpointModel(webApi, id);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.aml.vocabularies.apiContract.EndPoint);
          assert.equal(result['@type'][0], type);
        });
      });

      describe('_computeMethodModel()', () => {
        let webApi;
        before(async () => {
          element = await modelFixture(model);
          webApi = element._computeWebApi(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._computeMethodModel(undefined, undefined));
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computeMethodModel(undefined, 'test'));
        });

        it('Returns undefined if no selected argument', () => {
          assert.isUndefined(element._computeMethodModel(webApi, undefined));
        });

        it('Returns undefined if selection does not exists', () => {
          assert.isUndefined(element._computeMethodModel(webApi, 'hello'));
        });

        it('Returns object for method', () => {
          const endpoint = element._computeEndpointByPath(webApi, '/permissionIds/{email}');
          let op = element._computeOperations(webApi, endpoint['@id']);
          if (op instanceof Array) {
            // @ts-ignore
            // eslint-disable-next-line prefer-destructuring
            op = op[0];
          }
          const result = element._computeMethodModel(webApi, op['@id']);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.aml.vocabularies.apiContract.Operation);
          assert.equal(result['@type'][0], type);
        });
      });

      describe('_computeType()', () => {
        let references;
        let declares;
        before(async () => {
          element = await modelFixture(model);
          declares = element._computeDeclares(model);
          references = element._computeReferences(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._computeType(undefined, undefined, undefined));
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computeType(undefined, undefined, 'test'));
        });

        it('Returns undefined if no selected argument', () => {
          assert.isUndefined(element._computeType(declares, references, undefined));
        });

        it('Returns undefined if selection does not exists', () => {
          assert.isUndefined(element._computeType(declares, references, 'not-here'));
        });

        it('Returns type in declarations', () => {
          const id = declares[1]['@id']; // Node shape.
          const result = element._computeType(declares, undefined, id);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
          assert.equal(result['@type'][0], type);
        });

        it('Returns type for non-compact id', () => {
          if (!compact) {
            // This only affects compact model.
            return;
          }
          const id = `amf://id${  declares[1]['@id']}`;
          const result = element._computeType(declares, undefined, id);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
          assert.equal(result['@type'][0], type);
        });

        it('Returns type in references (library)', () => {
          const dKey = element._getAmfKey(element.ns.aml.vocabularies.document.declares);
          const library = references.find((unit) => unit['@type'].find((t) => t.indexOf('Module') !== -1));
          // let ref = references[4][dKey][0];
          let ref = library[dKey][0];
          if (ref instanceof Array) {
            // eslint-disable-next-line prefer-destructuring
            ref = ref[0];
          }
          const id = ref['@id'];
          const result = element._computeType(declares, references, id);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
          assert.equal(result['@type'][0], type);
        });

        it('Returns type in references (library) when no declarations', () => {
          const dKey = element._getAmfKey(element.ns.aml.vocabularies.document.declares);
          const library = references.find((unit) => unit['@type'].find((t) => t.indexOf('Module') !== -1));
          let ref = library[dKey][0];
          if (ref instanceof Array) {
            // eslint-disable-next-line prefer-destructuring
            ref = ref[0];
          }
          const id = ref['@id'];
          const result = element._computeType(undefined, references, id);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
          assert.isTrue(result['@type'].includes(type));
        });
      });

      describe('_getLinkTarget()', () => {
        let schemaId;
        let resolved;
        before(async () => {
          element = await modelFixture(model);
          const declares = element._computeDeclares(model);
          schemaId = declares[0]['@id'];
          resolved = element._getLinkTarget(model, schemaId);
        });

        it('Computes the reference', () => {
          assert.typeOf(resolved, 'object');
        });

        it('Reference is resolved', () => {
          const itemsKey = element._getAmfKey(element.ns.aml.vocabularies.shapes.items);
          const nameKey = element._getAmfKey(element.ns.schema.name);
          const shape = resolved[itemsKey][0];
          assert.equal(shape[nameKey][0]['@value'], 'Pic');
        });

        it('Returns undefined when no amf argument', () => {
          const result = element._getLinkTarget(undefined, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when no id argument', () => {
          const result = element._getLinkTarget(model, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when id is not found', () => {
          const result = element._getLinkTarget(model, 'other-test');
          assert.isUndefined(result);
        });
      });

      describe('_getReferenceId()', () => {
        let refId;
        before(async () => {
          element = await modelFixture(model);
          const refs = element._computeReferences(model);
          const ref = refs.find((unit) => (unit['@type'] || []).find((t) => t.indexOf('ExternalFragment') !== -1));
          const enc = element._computeEncodes(ref);
          refId = enc['@id'];
        });

        it('Computes reference', () => {
          const result = element._getReferenceId(model, refId);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.raml.vocabularies.document.ExternalDomainElement);
          assert.equal(result['@type'][0], type);
        });

        it('Returns undefined when no amf argument', () => {
          const result = element._getReferenceId(undefined, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when no id argument', () => {
          const result = element._getReferenceId(model, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when no references in the model', () => {
          const result = element._getReferenceId({}, undefined);
          assert.isUndefined(result);
        });
      });

      describe('_resolve()', () => {
        let webApi;
        before(async () => {
          element = await modelFixture(model);
          webApi = element._computeWebApi(model);
        });

        it('Resolves link target', () => {
          const endpoint = element._computeEndpointByPath(webApi, '/referenceId');
          const opKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.supportedOperation);
          const exKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.expects);
          const plKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.payload);
          const scKey = element._getAmfKey(element.ns.aml.vocabularies.shapes.schema);
          const nameKey = element._getAmfKey(element.ns.w3.shacl.name);
          const op = element._ensureArray(endpoint[opKey])[0];
          const expects = element._ensureArray(op[exKey])[0];
          const payload = element._ensureArray(expects[plKey])[0];
          const schema = element._ensureArray(payload[scKey])[0];
          const result = element._resolve(schema);
          assert.typeOf(result[nameKey], 'array');
        });

        it('Resolves link target for external fragment', () => {
          const endpoint = element._computeEndpointByPath(webApi, '/external-data-type');
          const opKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.supportedOperation);
          const exKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.expects);
          const plKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.payload);
          const scKey = element._getAmfKey(element.ns.aml.vocabularies.shapes.schema);
          const nameKey = element._getAmfKey(element.ns.w3.shacl.name);
          const op = element._ensureArray(endpoint[opKey])[0];
          const expects = element._ensureArray(op[exKey])[0];
          const payload = element._ensureArray(expects[plKey])[0];
          const schema = element._ensureArray(payload[scKey])[0];
          const result = element._resolve(schema);
          assert.typeOf(result[nameKey], 'array');
        });
      });

      describe('_computeSecurityModel()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined when no declares', () => {
          const result = element._computeSecurityModel(undefined, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when no id', () => {
          const result = element._computeSecurityModel([], undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when id not found', () => {
          const result = element._computeSecurityModel([{ '@id': 'a' }], 'b');
          assert.isUndefined(result);
        });

        it('Returns model for id', () => {
          const result = element._computeSecurityModel([{ '@id': 'a' }], 'a');
          assert.typeOf(result, 'object');
        });
      });

      describe('_computeDocument()', () => {
        let obj;
        beforeEach(async () => {
          element = await modelFixture(model);
          const key = element._getAmfKey(element.ns.schema.doc);
          obj = {};
          obj[key] = [
            {
              '@id': 'a'
            }
          ];
        });

        it('Returns undefined when no webApi', () => {
          const result = element._computeDocument(undefined, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when no id', () => {
          const result = element._computeDocument(obj, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when id not found', () => {
          const result = element._computeDocument(obj, 'b');
          assert.isUndefined(result);
        });

        it('Returns undefined when no documents key', () => {
          const result = element._computeDocument({}, 'b');
          assert.isUndefined(result);
        });

        it('Returns model for id', () => {
          const result = element._computeDocument(obj, 'a');
          assert.typeOf(result, 'object');
        });
      });

      describe('_computePropertyValue()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined when no argument', () => {
          const result = element._computePropertyValue(undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when no schema in argument', () => {
          const result = element._computePropertyValue({});
          assert.isUndefined(result);
        });

        it('Returns default value', () => {
          const {ns} = element;
          const sKey = element._getAmfKey(ns.aml.vocabularies.shapes.schema);
          const dvKey = element._getAmfKey(ns.w3.shacl.defaultValue);
          const obj = {};
          obj[sKey] = {};
          obj[sKey][dvKey] = {
            '@value': 'test-value'
          };
          const result = element._computePropertyValue(obj);
          assert.equal(result, 'test-value');
        });

        it('Returns default value when schema is array', () => {
          const {ns} = element;
          const sKey = element._getAmfKey(ns.aml.vocabularies.shapes.schema);
          const dvKey = element._getAmfKey(ns.w3.shacl.defaultValue);
          const obj = {};
          obj[sKey] = [{}];
          obj[sKey][0][dvKey] = {
            '@value': 'test-value'
          };
          const result = element._computePropertyValue(obj);
          assert.equal(result, 'test-value');
        });

        it('Returns value from example', () => {
          const {ns} = element;
          const sKey = element._getAmfKey(ns.aml.vocabularies.shapes.schema);
          const exKey = element._getAmfKey(ns.aml.vocabularies.apiContract.examples);
          const rKey = element._getAmfKey(ns.aml.vocabularies.document.raw);
          const obj = {};
          obj[sKey] = [{}];
          obj[sKey][0][exKey] = [{}];
          obj[sKey][0][exKey][0][rKey] = [
            {
              '@value': 'test-value'
            }
          ];
          const result = element._computePropertyValue(obj);
          assert.equal(result, 'test-value');
        });
      });

      describe('_computeHeaders()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        describe('spies', () => {
          afterEach(() => {
            // @ts-ignore
            element._computePropertyArray.restore();
          });

          it('Calls _computePropertyArray() with passed shape', () => {
            const spy = sinon.spy(element, '_computePropertyArray');
            const shape = {};
            element._computeHeaders(shape);
            assert.isTrue(spy.called);
            assert.isTrue(spy.args[0][0] === shape);
          });

          it('Calls _computePropertyArray() with proper key', () => {
            const spy = sinon.spy(element, '_computePropertyArray');
            element._computeHeaders({});
            assert.equal(spy.args[0][1], element.ns.aml.vocabularies.apiContract.header);
          });
        });

        it('returns header schema object for async api message', async () => {
          element = await modelFixture(asyncModel);
          const operation = AmfLoader.lookupOperation(asyncModel, 'hello', 'publish');
          const eKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.expects);
          const expects = operation[eKey];
          assert.isDefined(element._computeHeaders(expects[0]));
        });
      });

      describe('_computeQueryParameters()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const shape = {};
          element._computeQueryParameters(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeQueryParameters({});
          assert.equal(spy.args[0][1], element.ns.aml.vocabularies.apiContract.parameter);
        });
      });

      describe('_computeResponses()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const shape = {};
          element._computeResponses(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeResponses({});
          assert.equal(spy.args[0][1], element.ns.aml.vocabularies.apiContract.response);
        });
      });

      describe('_computeServerVariables()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const shape = {};
          element._computeServerVariables(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeServerVariables({});
          assert.equal(spy.args[0][1], element.ns.raml.vocabularies.apiContract.variable);
        });
      });

      describe('_computeServerVariables()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const shape = {};
          element._computeServerVariables(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeServerVariables({});
          assert.equal(spy.args[0][1], element.ns.raml.vocabularies.apiContract.variable);
        });
      });

      describe('_computeEndpointVariables()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computeQueryParameters.restore();
        });

        it('Calls _computeQueryParameters() with passed shape', () => {
          const spy = sinon.spy(element, '_computeQueryParameters');
          const shape = {};
          element._computeEndpointVariables(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });
      });

      describe('_computePayload()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const shape = {};
          element._computePayload(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computePayload({});
          assert.equal(spy.args[0][1], element.ns.raml.vocabularies.apiContract.payload);
        });
      });

      describe('_computeReturns()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const method = {};
          element._computeReturns(method);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === method);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeReturns({});
          assert.equal(spy.args[0][1], element.ns.aml.vocabularies.apiContract.returns);
        });
      });

      describe('_computeSecurity()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const method = {};
          element._computeSecurity(method);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === method);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeSecurity({});
          assert.equal(spy.args[0][1], element.ns.aml.vocabularies.security.security);
        });
      });

      describe('_computeHasCustomProperties()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          // @ts-ignore
          element._hasProperty.restore();
        });

        it('Calls _hasProperty() with passed shape', () => {
          const spy = sinon.spy(element, '_hasProperty');
          const shape = {};
          element._computeHasCustomProperties(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _hasProperty() with proper key', () => {
          const spy = sinon.spy(element, '_hasProperty');
          element._computeHasCustomProperties({});
          assert.equal(spy.args[0][1], element.ns.aml.vocabularies.document.customDomainProperties);
        });
      });

      describe('_computeApiVersion()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('Computes version of the API', () => {
          const result = element._computeApiVersion(model);
          assert.equal(result, 'v2');
        });

        it('Returns undefined when no WebApi', () => {
          const result = element._computeApiVersion({});
          assert.isUndefined(result);
        });
      });

      describe('_ensureArray()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined when no argument', () => {
          const result = element._ensureArray();
          assert.isUndefined(result);
        });

        it('Returns the same array', () => {
          const arr = ['a'];
          const result = element._ensureArray(arr);
          assert.isTrue(result === arr);
        });

        it('Returns array value from not array argument', () => {
          const arr = 'a';
          const result = element._ensureArray(arr);
          assert.deepEqual(result, ['a']);
        });
      });

      describe('_findById()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined when no argument', () => {
          const result = element._findById(undefined, undefined);
          assert.isUndefined(result);
        });

        it('Returns undefined when array does not contain id', () => {
          const arr = [{ '@id': '1'},{ '@id': '2'},{ '@id': '3'},];
          const result = element._findById(arr, '0');
          assert.isUndefined(result);
        });

        it('Returns object when array contains id', () => {
          const arr = [{ '@id': '1'},{ '@id': '2'},{ '@id': '3'},];
          const result = element._findById(arr, '1');
          assert.deepEqual(result, { '@id': '1'});
        });
      });

			describe('_isValidServerPartial()', () => {
				describe('with mock objects', () => {
					describe('not in arrays', () =>{
						it('should return true for endpoint type', () => {
							const endpointKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.EndPoint);
							const shape = { '@type': [endpointKey] };
							assert.isTrue(element._isValidServerPartial(shape));
						});

						it('should return true for method type', () => {
							const methodKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.Operation);
							const shape = { '@type': [methodKey] };
							assert.isTrue(element._isValidServerPartial(shape));
						});

						it('should return false for any other type', () => {
							const otherKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.WebAPI);
							const shape = { '@type': [otherKey] };
							assert.isFalse(element._isValidServerPartial(shape));
						});
					});
					describe('in arrays', () =>{
						it('should return true for endpoint type', () => {
							const endpointKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.EndPoint);
							const shape = { '@type': [endpointKey] };
							assert.isTrue(element._isValidServerPartial([shape]));
						});

						it('should return true for method type', () => {
							const methodKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.Operation);
							const shape = { '@type': [methodKey] };
							assert.isTrue(element._isValidServerPartial([shape]));
						});

						it('should return false for any other type', () => {
							const otherKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.WebAPI);
							const shape = { '@type': [otherKey] };
							assert.isFalse(element._isValidServerPartial([shape]));
						});
					})
				});

				describe('with real nodes', () => {
					it('should return true for endpoint type', () => {
						const endpoint = AmfLoader.lookupEndpoint(model, '/files');
						assert.isTrue(element._isValidServerPartial(endpoint));
					});

					it('should return true for method type', () => {
						const method = AmfLoader.lookupOperation(model, '/files', 'get');
						assert.isTrue(element._isValidServerPartial(method));
					});

					it('should return false for any other type', () => {
						assert.isFalse(element._isValidServerPartial(model));
					});
				})
			});


      describe('_mergeShapes()', () => {
        let sourcesKey;

        before(async () => {
          element = await modelFixture(model);
          sourcesKey = element._getAmfKey(element.ns.aml.vocabularies.docSourceMaps.sources);
        });

        it('should merge two objects together', () => {
          const a = { foo: 'foo', a: 1 };
          const b = { bar: 'bar', a: 2, b: 3 };
          const merged = element._mergeShapes(a, b);
          assert.deepEqual(merged, { foo: 'foo', bar: 'bar', a: 2, b: 3 });
        });

        it('should merge sources from both nodes', () => {
          const a = { foo: 'foo', a: 1, [sourcesKey]: [{ s1: 1, s2: 2 }] };
          const b = { bar: 'bar', a: 2, b: 3, [sourcesKey]: [{ s2: 20, s3: 30 }] };
          const merged = element._mergeShapes(a, b);
          assert.deepEqual(merged, {
            foo: 'foo',
            bar: 'bar',
            a: 2,
            b: 3,
            [sourcesKey]: [{ s1: 1, s2: 20, s3: 30 }]
          });
        });

        describe('special merges', () => {
          describe('_mergeSourceMapsSources()', () => {
            before(async () => {
              element = await modelFixture(model)
            })

            it('should merge sources from both nodes', () => {
              const a = { foo: 'foo', a: 1, [sourcesKey]: [{ s1: 1, s2: 2 }] };
              const b = { bar: 'bar', a: 2, b: 3, [sourcesKey]: [{ s2: 20, s3: 30 }] };
              const result = element._mergeSourceMapsSources(a, b);
              assert.deepEqual(result, [{ s1: 1, s2: 20, s3: 30 }]);
            });

            it('should merge nodes when only A has sources', () => {
              const a = { foo: 'foo', a: 1, [sourcesKey]: [{ s2: 20, s3: 30 }] };
              const b = { bar: 'bar', a: 2, b: 3 };
              const merged = element._mergeSourceMapsSources(a, b);
              assert.deepEqual(merged, [{ s2: 20, s3: 30 }]);
            });

            it('should merge nodes when only B has sources', () => {
              const a = { foo: 'foo', a: 1 };
              const b = { bar: 'bar', a: 2, b: 3, [sourcesKey]: [{ s2: 20, s3: 30 }] };
              const merged = element._mergeSourceMapsSources(a, b);
              assert.deepEqual(merged, [{ s2: 20, s3: 30 }]);
            });


            it('should return empty object when neither node has sources', () => {
              const a = { foo: 'foo', a: 1 };
              const b = { bar: 'bar', a: 2, b: 3 };
              const merged = element._mergeSourceMapsSources(a, b);
              assert.deepEqual(merged, [{}]);
            });
          });
        });
      });
      // Keys caching is only enabled for compact model that requires additional
      // computations.
      (compact ? describe : describe.skip)('keys computation caching', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('caches a key value', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          const key = element._getAmfKey(prop);
          // @ts-ignore
          assert.equal(element.__cachedKeys[prop], key);
        });

        it('returns the same value', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          const key1 = element._getAmfKey(prop);
          const key2 = element._getAmfKey(prop);
          assert.equal(key1, key2);
        });

        it('uses cached value', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          element._getAmfKey(prop);
          // @ts-ignore
          element.__cachedKeys[prop] = 'test';
          const key = element._getAmfKey(prop);
          assert.equal(key, 'test');
        });

        it('resets cache when AMF changes', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          element._getAmfKey(prop);
          element.amf = undefined;
          // @ts-ignore
          assert.deepEqual(element.__cachedKeys, {});
        });
      });

      describe('Expander', async () => {
        const flattenedApi = 'flattened-api'
        const expandedApi = 'expanded-api'
        let flattenedModel;
        let expandedModel;

        before(async () => {
          flattenedModel = await AmfLoader.load(compact, flattenedApi);
          expandedModel = await AmfLoader.load(compact, expandedApi);
        });

        beforeEach(async () => {
          element = await basicFixture();
        });

        it('should not call __amfChanged again if same flattened model is set', async () => {
          element.amf = flattenedModel;
          await nextFrame();
          const spy = sinon.spy(element, '__amfChanged');
          element.amf = flattenedModel;
          await nextFrame();
          assert.isTrue(spy.notCalled);
        });

        it('should create same object for flattened as originial expanded', async () => {
          const expandedElement = await modelFixture(expandedModel);
          element.amf = flattenedModel;
          await nextFrame();
          assert.deepEqual(element.amf, expandedElement.amf)
        });
      });
    });
  });
});
