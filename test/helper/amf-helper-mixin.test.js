import { assert, fixture, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from '../AmfLoader.js';
import './test-element.js';

/** @typedef {import('./test-element').TestElement} TestElement */
/** @typedef {import('../../src/amf').DomainElement} DomainElement */
/** @typedef {import('../../src/amf').Operation} Operation */

describe('AmfHelperMixin', () => {
  /**
   * @returns {Promise<TestElement>}
   */
  async function basicFixture() {
    return fixture(html`<test-element></test-element>`);
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
  ].forEach(([arg1, arg2]) => {
    const label = String(arg1);
    const compact = Boolean(arg2);

    describe(label, () => {
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
          assert.isUndefined(element._getValue({
            '@id': 'amf://1',
            '@type': ['test'],
          }, undefined));
        });

        it('Returns undefined if no key in object', () => {
          assert.isUndefined(
            element._getValue(
              /** @type DomainElement */ ({
                a: [],
                b: [],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'c'
            )
          );
        });

        it('Returns undefined if no value in value array', () => {
          assert.isUndefined(
            element._getValue(
              /** @type DomainElement */ ({
                '@id': '1',
                '@type': ['test'],
                a: [],
              }),
              'a'
            )
          );
        });

        it('Returns the value', () => {
          assert.equal(
            element._getValue(
              /** @type DomainElement */ ({
                '@id': 'amf://1',
                '@type': ['test'],
                a: [
                  {
                    '@value': 'test'
                  }
                ]
              }),
              'a'
            ),
            'test'
          );
        });

        it('Returns primitive value from compact model', () => {
          assert.equal(
            element._getValue(
              /** @type DomainElement */ ({
                '@id': 'amf://1',
                '@type': ['test'],
                a: 'test'
              }),
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
          assert.isUndefined(element._getValueArray({
            '@id': 'amf://1',
            '@type': ['test'],
          }, undefined));
        });

        it('Returns undefined if no key in object', () => {
          assert.isUndefined(
            element._getValueArray(
              /** @type DomainElement */ ({
                a: [],
                b: [],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'c'
            )
          );
        });

        it('Returns empty array if no value in value array', () => {
          assert.deepEqual(
            element._getValueArray(
              /** @type DomainElement */ ({
                a: [],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'a'
            ),
            []
          );
        });

        it('Returns the values', () => {
          assert.deepEqual(
            element._getValueArray(
              /** @type DomainElement */ ({
                a: [
                  {
                    '@value': 'test'
                  },
                  {
                    '@value': 'test2'
                  }
                ],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'a'
            ),
            ['test', 'test2']
          );
        });

        it('Returns values for non object values', () => {
          assert.deepEqual(
            element._getValueArray(
              /** @type DomainElement */ ({
                a: ['test', 'test2'],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
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
          assert.isFalse(element._hasType({
            '@id': 'amf://1',
            '@type': ['test'],
          }, undefined));
        });

        it('Returns false if type does not match', () => {
          assert.isFalse(
            element._hasType(
              {
                '@type': ['a', 'b'],
                '@id': 'amf://1',
              },
              'c'
            )
          );
        });

        it('Returns true if type does match', () => {
          assert.isTrue(
            element._hasType(
              {
                '@type': ['a', 'b', 'c'],
                '@id': 'amf://1',
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
          assert.isFalse(element._hasProperty({
            '@id': 'amf://1',
            '@type': ['test'],
          }, undefined));
        });

        it('Returns false if type does not have property', () => {
          assert.isFalse(
            element._hasProperty(
              /** @type DomainElement */ ({
                a: 'test',
                b: 'test',
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'c'
            )
          );
        });

        it('Returns true if have a property', () => {
          assert.isTrue(
            element._hasProperty(
              /** @type DomainElement */ ({
                a: 'test',
                b: 'test',
                c: 'test',
                '@id': 'amf://1',
                '@type': ['test'],
              }),
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
          assert.isUndefined(element._computePropertyArray({
            '@id': 'amf://1',
            '@type': ['test'],
          }, undefined));
        });

        it('Returns array', () => {
          assert.deepEqual(
            element._computePropertyArray(
              /** @type DomainElement */ ({
                test: ['a', 'b', 'c'],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
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
          assert.isUndefined(element._computePropertyObject({
            '@id': 'amf://1',
            '@type': ['test'],
          }, undefined));
        });

        it('Returns boolean value', () => {
          assert.isTrue(
            element._computePropertyObject(
              /** @type DomainElement */ ({
                test: [true],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'test'
            )
          );

          assert.isFalse(
            element._computePropertyObject(
              /** @type DomainElement */ ({
                test: [false],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'test'
            )
          );
        });

        it('Returns null value', () => {
          assert.equal(
            element._computePropertyObject(
              /** @type DomainElement */ ({
                test: [null],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'test'
            ),
            null
          );
        });

        it('Returns string value', () => {
          assert.equal(
            element._computePropertyObject(
              /** @type DomainElement */ ({
                test: ['test-value'],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'test'
            ),
            'test-value'
          );
        });

        it('Returns number value', () => {
          assert.equal(
            element._computePropertyObject(
              /** @type DomainElement */ ({
                test: [123],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
              'test'
            ),
            123
          );
        });

        it('Returns 0 value', () => {
          assert.equal(
            element._computePropertyObject(
              /** @type DomainElement */ ({
                test: [0],
                '@id': 'amf://1',
                '@type': ['test'],
              }),
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
          assert.isUndefined(element._computeDescription({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
        });

        it('Returns undefined if no description key', () => {
          assert.isUndefined(
            element._computeDescription(/** @type DomainElement */ ({
              a: 'test',
              '@id': 'amf://1',
              '@type': ['test'],
            }))
          );
        });

        it('Returns the description', () => {
          const shape = {
            '@id': 'amf://1',
            '@type': ['test'],
            [element._getAmfKey(element.ns.schema.desc)]: {
              '@value': ['test'],
              '@id': 'amf://1',
              '@type': ['test'],
            }
          };
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
          assert.isUndefined(element._computeEncodes({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
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
          assert.isUndefined(element._computeDeclares({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
        });

        it('Returns undefined argument is empty array', () => {
          // @ts-ignore
          assert.isUndefined(element._computeDeclares([]));
        });

        it('Returns an array from AMF model', () => {
          const result = element._computeDeclares(model);
          assert.typeOf(result, 'array');
        });

        it('returns all items in the array', () => {
          const result = element._computeDeclares(model);
          assert.isAbove(result.length, 1);
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
          // @ts-ignore
          assert.isUndefined(element._computeReferences([]));
        });

        it('Returns undefined if no references', () => {
          assert.isUndefined(element._computeReferences({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
        });

        it('Returns an array from AMF model', () => {
          const result = element._computeReferences(model);
          assert.typeOf(result, 'array');
        });

        it('returns all items in the array', () => {
          const result = element._computeReferences(model);
          assert.isNotEmpty(result);
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
          assert.isUndefined(element._computeWebApi({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
        });

        it('Returns undefined if no WebApi', () => {
          const key = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
          const amfModel = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
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
          assert.isUndefined(element._computeApi(undefined));
        });

        it('should return undefined if no encodes', () => {
          assert.isUndefined(element._computeApi({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
        });

        it('should return undefined if not API', () => {
          const key = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
          const amfModel = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
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
            const amfModel = {
              '@id': 'amf://1',
              '@type': ['test'],
            };
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
            const amfModel = {
              '@id': 'amf://1',
              '@type': ['test'],
            };
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
          assert.isFalse(element._isWebAPI(undefined));
        });

        it('should return false if no encodes', () => {
          assert.isFalse(element._isWebAPI({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
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
          assert.isFalse(element._isAsyncAPI(undefined));
        });

        it('should return false if no encodes', () => {
          assert.isFalse(element._isAsyncAPI({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
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
          assert.isFalse(element._isAPI(undefined));
        });

        it('should return false if no encodes', () => {
          assert.isFalse(element._isAPI({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
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
          assert.isUndefined(element._computeServer({
            '@id': 'amf://1',
            '@type': ['test'],
          }));
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

        it('returns a list of endpoints', () => {
          const result = element._computeEndpoints(webApi);
          assert.typeOf(result, 'array');
          assert.isAbove(result.length, 1);
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

        it('returns undefined if no arguments', () => {
          assert.isUndefined(element._computeType(undefined, undefined, undefined));
        });

        it('returns undefined if no model argument', () => {
          assert.isUndefined(element._computeType(undefined, undefined, 'test'));
        });

        it('returns undefined if no selected argument', () => {
          assert.isUndefined(element._computeType(declares, references, undefined));
        });

        it('returns undefined if selection does not exists', () => {
          assert.isUndefined(element._computeType(declares, references, 'not-here'));
        });

        // it('Returns type in declarations', () => {
        //   const id = declares[1]['@id']; // Node shape.
        //   const result = element._computeType(declares, undefined, id);
        //   assert.typeOf(result, 'object');
        //   const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
        //   assert.equal(result['@type'][0], type);
        // });

        // it('returns type for non-compact id', () => {
        //   if (!compact) {
        //     // This only affects compact model.
        //     return;
        //   }
        //   const id = `amf://id${  declares[1]['@id']}`;
        //   const result = element._computeType(declares, undefined, id);
        //   assert.typeOf(result, 'object');
        //   const type = element._getAmfKey(element.ns.w3.shacl.NodeShape);
        //   assert.equal(result['@type'][0], type);
        // });

        it('returns type in references (library)', () => {
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

        it('returns type in references (library) when no declarations', () => {
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

        it.skip('Reference is resolved', () => {
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
          const result = element._getReferenceId({
            '@id': 'amf://1',
            '@type': ['test'],
          }, undefined);
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
          const result = element._computeSecurityModel([{ '@id': 'a', '@type': [] }], 'b');
          assert.isUndefined(result);
        });

        it('Returns model for id', () => {
          const result = element._computeSecurityModel([{ '@id': 'a', '@type': [] }], 'a');
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
          const result = element._computeDocument({
            '@id': 'amf://1',
            '@type': ['test'],
          }, 'b');
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
          const result = element._computePropertyValue({
            '@id': 'amf://1',
            '@type': ['test'],
          });
          assert.isUndefined(result);
        });

        it('Returns default value', () => {
          const {ns} = element;
          const sKey = element._getAmfKey(ns.aml.vocabularies.shapes.schema);
          const dvKey = element._getAmfKey(ns.w3.shacl.defaultValue);
          const obj = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
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
          const obj = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
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
          const obj = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
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
            const shape = {
              '@id': 'amf://1',
              '@type': ['test'],
            };
            element._computeHeaders(shape);
            assert.isTrue(spy.called);
            assert.isTrue(spy.args[0][0] === shape);
          });

          it('Calls _computePropertyArray() with proper key', () => {
            const spy = sinon.spy(element, '_computePropertyArray');
            element._computeHeaders({
              '@id': 'amf://1',
              '@type': ['test'],
            });
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
          const shape = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
          element._computeQueryParameters(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeQueryParameters({
            '@id': 'amf://1',
            '@type': ['test'],
          });
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
          const shape = /** @type Operation */ ({});
          element._computeResponses(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          // @ts-ignore
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
          const shape = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
          element._computeServerVariables(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeServerVariables({
            '@id': 'amf://1',
            '@type': ['test'],
          });
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
          const shape = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
          element._computeServerVariables(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeServerVariables({
            '@id': 'amf://1',
            '@type': ['test'],
          });
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
          const shape = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
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
          const shape = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
          element._computePayload(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computePayload({
            '@id': 'amf://1',
            '@type': ['test'],
          });
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
          const method = /** @type Operation */ ({});
          element._computeReturns(method);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === method);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeReturns(/** @type Operation */ ({}));
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
          const method = /** @type Operation */ ({});
          element._computeSecurity(method);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === method);
        });

        it('Calls _computePropertyArray() with proper key', () => {
          const spy = sinon.spy(element, '_computePropertyArray');
          element._computeSecurity(/** @type Operation */ ({}));
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
          const shape = {
            '@id': 'amf://1',
            '@type': ['test'],
          };
          element._computeHasCustomProperties(shape);
          assert.isTrue(spy.called);
          assert.isTrue(spy.args[0][0] === shape);
        });

        it('Calls _hasProperty() with proper key', () => {
          const spy = sinon.spy(element, '_hasProperty');
          element._computeHasCustomProperties({
            '@id': 'amf://1',
            '@type': ['test'],
          });
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
          const result = element._computeApiVersion({
            '@id': 'amf://1',
            '@type': ['test'],
          });
          assert.isUndefined(result);
        });
      });

      describe('_ensureArray()', () => {
        before(async () => {
          element = await modelFixture(model);
        });

        it('Returns undefined when no argument', () => {
          const result = element._ensureArray(undefined);
          assert.isUndefined(result);
        });

        it('Returns the same array', () => {
          const arr = ['a'];
          const result = element._ensureArray(arr);
          // @ts-ignore
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
          const arr = [{ '@id': '1', '@type': ['test']}, { '@id': '2', '@type': ['test'] }, { '@id': '3', '@type': ['test'] },];
          const result = element._findById(arr, '0');
          assert.isUndefined(result);
        });

        it('Returns object when array contains id', () => {
          const arr = [{ '@id': '1', '@type': ['test'] },{ '@id': '2', '@type': ['test'] },{ '@id': '3', '@type': ['test'] },];
          const result = element._findById(arr, '1');
          assert.deepEqual(result, { '@id': '1', '@type': ['test'] });
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

        it('should create same object for flattened as original expanded', async () => {
          const expandedElement = await modelFixture(expandedModel);
          element.amf = flattenedModel;
          await nextFrame();
          assert.deepEqual(element.amf, expandedElement.amf)
        });
      });
    });
  });
});
