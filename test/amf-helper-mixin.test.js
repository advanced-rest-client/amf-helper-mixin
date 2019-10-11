import { fixture, assert, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { AmfLoader } from './amf-loader.js';
import './test-element.js';

describe('AmfHelperMixin', function() {
  async function basicFixture() {
    return await fixture(`<test-element></test-element>`);
  }

  async function modelFixture(amf) {
    return await fixture(html`<test-element
      .amf="${amf}"></test-element>`);
  }

  [
    ['Compact model', true],
    ['Regular model', false]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      let element;
      let model;

      before(async () => {
        model = await AmfLoader.load(compact);
      });

      describe('amf setter/getter', () => {
        let element;
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('sets _amf property', () => {
          element.amf = model;
          assert.isTrue(element._amf === model);
        });
      });

      describe('ns getter', () => {
        let element;
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
        let element;
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('calls the function when amf property chnage', () => {
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
          const result = element._getAmfKey();
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
        let element;
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
          assert.equal(v.document.toString(), key + 'document#', 'document namespace as string is the key');
          assert.equal(v.document.key, key + 'document#', 'document key is set');
          assert.typeOf(v.apiContract, 'object', 'apiContract is set');
          assert.equal(v.apiContract.toString(), key + 'apiContract#', 'apiContract namespace as string is the key');
          assert.equal(v.apiContract.key, key + 'apiContract#', 'apiContract.key is set');
          assert.equal(v.http, v.apiContract, 'apiContract is old http');
          assert.typeOf(v.security, 'object', 'security is set');
          assert.equal(v.security.toString(), key + 'security#', 'security namespace as string is the key');
          assert.equal(v.security.key, key + 'security#', 'security.key is set');
          assert.typeOf(v.shapes, 'object', 'shapes is set');
          assert.equal(v.shapes.toString(), key + 'shapes#', 'shapes namespace as string is the key');
          assert.equal(v.shapes.key, key + 'shapes#', 'shapes.key is set');
          assert.typeOf(v.data, 'object', 'data is set');
          assert.equal(v.data.toString(), key + 'data#', 'data namespace as string is the key');
          assert.equal(v.data.key, key + 'data#', 'data.key is set');
        });

        it('vocabularies cannot be changed', () => {
          assert.throws(() => {
            element.ns.aml.vocabularies = 'test';
          });
        });

        it('w3 properties are set', () => {
          const r = element.ns.w3;
          const key = r.key;
          assert.equal(r.key, 'http://www.w3.org/', 'key is set');
          assert.typeOf(r.rdfSyntax, 'object', 'rdfSyntax is set');
          assert.equal(r.rdfSyntax.toString(), key + '1999/02/22-rdf-syntax-ns#', 'rdfSyntax namespace as string is the key');
          assert.equal(r.rdfSyntax.key, key + '1999/02/22-rdf-syntax-ns#', 'rdfSyntax.key is set');
          assert.typeOf(r.hydra, 'object', 'hydra is set');
          assert.equal(r.hydra.toString(), key + 'ns/hydra/', 'hydra namespace as string is the key');
          assert.equal(r.hydra.key, key + 'ns/hydra/', 'hydra.key is set');
          assert.typeOf(r.xmlSchema, 'object', 'xmlSchema is set');
          assert.equal(r.xmlSchema.toString(), key + '2001/XMLSchema#', 'xmlSchema namespace as string is the key');
          assert.equal(r.xmlSchema.key, key + '2001/XMLSchema#', 'xmlSchema.key is set');
          assert.typeOf(r.shacl, 'object', 'shacl is set');
          assert.equal(r.shacl.toString(), key + 'ns/shacl#', 'shacl namespace as string is the key');
          assert.equal(r.shacl.key, key + 'ns/shacl#', 'shacl.key is set');
        });

        it('w3 cannot be changed', () => {
          assert.throws(() => {
            element.ns.w3 = 'test';
          });
        });

        it('hydra properties are set', () => {
          const h = element.ns.w3.hydra;
          const key = 'http://www.w3.org/ns/hydra/';
          assert.equal(h.toString(), key, 'the namespace as string is the key');
          assert.equal(h.key, key);
          assert.equal(h.core, element.ns.aml.vocabularies.apiContract);
          assert.equal(h.supportedOperation, 'http://a.ml/vocabularies/apiContract#supportedOperation');
        });

        it('hydra cannot be changed', () => {
          assert.throws(() => {
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
            'PropertyShape'
          ].forEach((name) => {
            assert.equal(s[name], key + name, name + ' is set');
          });
        });

        it('shacl cannot be changed', () => {
          assert.throws(() => {
            element.ns.w3.shacl = 'test';
          });
        });

        it('schema properties are set', () => {
          const s = element.ns.schema;
          const key = element.ns.aml.vocabularies.core.key;
          assert.equal(s.key, key, 'key is set');
          assert.equal(s.name, key + 'name', 'name is set');
          assert.equal(s.desc, key + 'description');
          assert.equal(s.doc, key + 'documentation');
          assert.equal(s.webApi, element.ns.aml.vocabularies.apiContract.key + 'WebAPI');
          assert.equal(s.creativeWork, key + 'CreativeWork');
          ['displayName', 'title'].forEach((name) => {
            assert.equal(s[name], key + name);
          });
        });

        it('schema cannot be changed', () => {
          assert.throws(() => {
            element.ns.schema = 'test';
          });
        });
      });

      describe('vocabularies.document namespace', () => {
        let element;
        const key = 'http://a.ml/vocabularies/document#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['Module', key + 'Module'],
          ['Document', key + 'Document'],
          ['SecuritySchemeFragment', key + 'SecuritySchemeFragment'],
          ['UserDocumentation', key + 'UserDocumentation'],
          ['DataType', key + 'DataType'],
          ['Example', key + 'Example'],
          ['NamedExamples', key + 'NamedExamples'],
          ['DomainElement', key + 'DomainElement'],
          ['ParametrizedResourceType', key + 'ParametrizedResourceType'],
          ['ParametrizedTrait', key + 'ParametrizedTrait'],
          ['customDomainProperties', key + 'customDomainProperties'],
          ['encodes', key + 'encodes'],
          ['declares', key + 'declares'],
          ['references', key + 'references'],
          ['examples', key + 'examples'],
          ['linkTarget', key + 'link-target'],
          ['referenceId', key + 'reference-id'],
          ['structuredValue', key + 'structuredValue'],
          ['raw', key + 'raw'],
          ['extends', key + 'extends'],
          ['value', key + 'value'],
          ['name', key + 'name'],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.document[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.shapes namespace', () => {
        let element;
        const key = 'http://a.ml/vocabularies/shapes#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['ScalarShape', key + 'ScalarShape'],
          ['ArrayShape', key + 'ArrayShape'],
          ['UnionShape', key + 'UnionShape'],
          ['NilShape', key + 'NilShape'],
          ['FileShape', key + 'FileShape'],
          ['AnyShape', key + 'AnyShape'],
          ['range', key + 'range'],
          ['items', key + 'items'],
          ['anyOf', key + 'anyOf'],
          ['fileType', key + 'fileType'],
          ['number', key + 'number'],
          ['integer', key + 'integer'],
          ['long', key + 'long'],
          ['double', key + 'double'],
          ['boolean', key + 'boolean'],
          ['float', key + 'float'],
          ['nil', key + 'nil'],
          ['schema', key + 'schema'],
          ['xmlSerialization', key + 'xmlSerialization'],
          ['xmlName', key + 'xmlName'],
          ['xmlAttribute', key + 'xmlAttribute'],
          ['xmlWrapped', key + 'xmlWrapped'],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.shapes[property];
            assert.equal(result, value);
          });
        });
      });

      describe('vocabularies.data namespace', () => {
        let element;
        const key = 'http://a.ml/vocabularies/data#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['Scalar', key + 'Scalar'],
          ['Object', key + 'Object'],
          ['Array', key + 'Array'],
          ['value', key + 'value'],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.aml.vocabularies.data[property];
            assert.equal(result, value);
          });
        });
      });

      describe('w3.shacl namespace', () => {
        let element;
        const key = 'http://www.w3.org/ns/shacl#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['Shape', key + 'Shape'],
          ['NodeShape', key + 'NodeShape'],
          ['SchemaShape', key + 'SchemaShape'],
          ['PropertyShape', key + 'PropertyShape'],
          ['in', key + 'in'],
          ['defaultValue', key + 'defaultValue'],
          ['defaultValueStr', key + 'defaultValueStr'],
          ['pattern', key + 'pattern'],
          ['minInclusive', key + 'minInclusive'],
          ['maxInclusive', key + 'maxInclusive'],
          ['multipleOf', key + 'multipleOf'],
          ['minLength', key + 'minLength'],
          ['maxLength', key + 'maxLength'],
          ['fileType', key + 'fileType'],
          ['and', key + 'and'],
          ['property', key + 'property'],
          ['name', key + 'name'],
          ['raw', key + 'raw'],
          ['datatype', key + 'datatype'],
          ['minCount', key + 'minCount'],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.w3.shacl[property];
            assert.equal(result, value);
          });
        });
      });

      describe('w3.xmlSchema namespace', () => {
        let element;
        const key = 'http://www.w3.org/2001/XMLSchema#';
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        [
          ['boolean', key + 'boolean'],
          ['integer', key + 'integer'],
          ['long', key + 'long'],
          ['double', key + 'double'],
          ['float', key + 'float'],
        ].forEach(([property, value]) => {
          it(`has value for ${property}`, () => {
            const result = element.ns.w3.xmlSchema[property];
            assert.equal(result, value);
          });
        });
      });

      describe('_getValue()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no arguments', () => {
          assert.isUndefined(element._getValue());
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._getValue(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._getValue({}));
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
          assert.isUndefined(element._getValueArray());
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._getValueArray(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._getValueArray({}));
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
          assert.isFalse(element._hasType());
        });

        it('Returns false if no model argument', () => {
          assert.isFalse(element._hasType(undefined, 'test'));
        });

        it('Returns false if no key argument', () => {
          assert.isFalse(element._hasType({}));
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
          assert.isFalse(element._hasProperty());
        });

        it('Returns false if no model argument', () => {
          assert.isFalse(element._hasProperty(undefined, 'test'));
        });

        it('Returns false if no key argument', () => {
          assert.isFalse(element._hasProperty({}));
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
          assert.isUndefined(element._computePropertyArray());
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computePropertyArray(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._computePropertyArray({}));
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
          assert.isUndefined(element._computePropertyObject());
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computePropertyObject(undefined, 'test'));
        });

        it('Returns undefined if no key argument', () => {
          assert.isUndefined(element._computePropertyObject({}));
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
          assert.isFalse(element._computeHasStringValue());
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
          assert.isFalse(element._computeHasStringValue());
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
          assert.isFalse(element._computeHasArrayValue());
        });

        it('Returns false if empty array', () => {
          assert.isFalse(element._computeHasArrayValue([]));
        });

        it('Returns false if not array', () => {
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
          assert.isUndefined(element._computeDescription());
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
          const model = {};
          const key = element._getAmfKey(element.ns.schema.desc);
          model[key] = [
            {
              '@value': ['test']
            }
          ];
          assert.equal(element._computeDescription(model), 'test');
        });
      });

      describe('_computeEncodes()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeEncodes());
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
          assert.isUndefined(element._computeDeclares());
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

        it('Returns all items in the array', () => {
          const result = element._computeDeclares(model);
          assert.lengthOf(result, 17);
        });
      });

      describe('_computeReferences()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeReferences());
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
          assert.lengthOf(result, 8);
        });
      });

      describe('_computeWebApi()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeWebApi());
        });

        it('Returns undefined if no encodes', () => {
          assert.isUndefined(element._computeWebApi({}));
        });

        it('Returns undefined if no WebApi', () => {
          const key = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
          const model = {};
          model[key] = {};
          assert.isUndefined(element._computeWebApi(model));
        });

        it('Returns an object from AMF model', () => {
          const result = element._computeWebApi(model);
          assert.typeOf(result, 'object');
        });
      });

      describe('_computeServer()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeServer());
        });

        it('Returns undefined if no encodes', () => {
          assert.isUndefined(element._computeServer({}));
        });

        it('Returns an object from AMF model', () => {
          const result = element._computeServer(model);
          assert.typeOf(result, 'object');
        });
      });

      describe('_computeProtocols()', () => {
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeProtocols());
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
          const result = element._computeEndpointByPath(webApi);
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

        it('Returns a loist of endpoints', () => {
          const result = element._computeEndpoints(webApi);
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 34);
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
          operation = endpoint[key][0];
          noExpectsOperation = endpoint[key][1];
        });

        it('Returns undefined if no argument', () => {
          assert.isUndefined(element._computeExpects());
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
          assert.isUndefined(element._computeEndpointModel());
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computeEndpointModel(undefined, 'test'));
        });

        it('Returns undefined if no selected argument', () => {
          assert.isUndefined(element._computeEndpointModel(webApi));
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
          assert.isUndefined(element._computeMethodModel());
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computeMethodModel(undefined, 'test'));
        });

        it('Returns undefined if no selected argument', () => {
          assert.isUndefined(element._computeMethodModel(webApi));
        });

        it('Returns undefined if selection does not exists', () => {
          assert.isUndefined(element._computeMethodModel(webApi, 'hello'));
        });

        it('Returns object for method', () => {
          const endpoint = element._computeEndpointByPath(webApi, '/permissionIds/{email}');
          let op = element._computeOperations(webApi, endpoint['@id']);
          if (op instanceof Array) {
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
          assert.isUndefined(element._computeType());
        });

        it('Returns undefined if no model argument', () => {
          assert.isUndefined(element._computeType(undefined, undefined, 'test'));
        });

        it('Returns undefined if no selected argument', () => {
          assert.isUndefined(element._computeType(declares, references));
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
          const id = 'amf://id' + declares[1]['@id'];
          const result = element._computeType(declares, undefined, id);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
          assert.equal(result['@type'][0], type);
        });

        it('Returns type in references (library)', () => {
          const dKey = element._getAmfKey(element.ns.aml.vocabularies.document.declares);
          const library = references.find(function(unit) {
            return unit['@type'].find((t) => t.indexOf('Module') !== -1);
          });
          // let ref = references[4][dKey][0];
          let ref = library[dKey][0];
          if (ref instanceof Array) {
            ref = ref[0];
          }
          const id = ref['@id'];
          const result = element._computeType(declares, references, id);
          assert.typeOf(result, 'object');
          const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
          assert.equal(result['@type'][0], type);
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
          const result = element._getLinkTarget();
          assert.isUndefined(result);
        });

        it('Returns undefined when no id argument', () => {
          const result = element._getLinkTarget(model);
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
          const ref = refs.find(function(unit) {
            return (unit['@type'] || []).find((t) => t.indexOf('ExternalFragment') !== -1);
          });
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
          const result = element._getReferenceId();
          assert.isUndefined(result);
        });

        it('Returns undefined when no id argument', () => {
          const result = element._getReferenceId(model);
          assert.isUndefined(result);
        });

        it('Returns undefined when no references in the model', () => {
          const result = element._getReferenceId({});
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
      });

      describe('_computeSecurityModel()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined when no declares', () => {
          const result = element._computeSecurityModel();
          assert.isUndefined(result);
        });

        it('Returns undefined when no id', () => {
          const result = element._computeSecurityModel([]);
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
          const result = element._computeDocument();
          assert.isUndefined(result);
        });

        it('Returns undefined when no id', () => {
          const result = element._computeDocument(obj);
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
          const result = element._computePropertyValue();
          assert.isUndefined(result);
        });

        it('Returns undefined when no schema in argument', () => {
          const result = element._computePropertyValue({});
          assert.isUndefined(result);
        });

        it('Returns default value', () => {
          const ns = element.ns;
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
          const ns = element.ns;
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
          const ns = element.ns;
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

        afterEach(() => {
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computeHeaders(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeHeaders({});
          assert.equal(spy.args[0][1], element.ns.aml.vocabularies.apiContract.header);
        });
      });

      describe('_computeQueryParameters()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computeQueryParameters(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computeResponses(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computeServerVariables(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computeServerVariables(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
          element._computeQueryParameters.restore();
        });

        it('Calls _computeQueryParameters() with passed shape', () => {
          const spy = sinon.spy(element, '_computeQueryParameters');
          const model = {};
          element._computeEndpointVariables(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
        });
      });

      describe('_computePayload()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        afterEach(() => {
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computePayload(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computeReturns(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
          element._computePropertyArray.restore();
        });

        it('Calls _computePropertyArray() with passed shape', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          const model = {};
          element._computeSecurity(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
          element._hasProperty.restore();
        });

        it('Calls _hasProperty() with passed shape', () => {
          const spy = sinon.spy(element, '_hasProperty');
          const model = {};
          element._computeHasCustomProperties(model);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === model);
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
      // Keys caching is only enabled for compact model that requires cadditional
      // computations.
      (compact ? describe : describe.skip)('keys computation caching', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('caches a key value', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          const key = element._getAmfKey(prop);
          assert.equal(element.__cachedKeys[prop], key);
        });

        it('retuens the same value', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          const key1 = element._getAmfKey(prop);
          const key2 = element._getAmfKey(prop);
          assert.equal(key1, key2);
        });

        it('uses cached value', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          element._getAmfKey(prop);
          element.__cachedKeys[prop] = 'test';
          const key = element._getAmfKey(prop);
          assert.equal(key, 'test');
        });

        it('resets cahce when AMF changes', () => {
          const prop = element.ns.aml.vocabularies.document.encodes;
          element._getAmfKey(prop);
          element.amf = undefined;
          assert.deepEqual(element.__cachedKeys, {});
        });
      });
    });
  });
});
