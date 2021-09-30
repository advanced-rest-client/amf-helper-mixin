import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer } from '../../index.js';

/** @typedef {import('../../src/amf').Server} Server */
/** @typedef {import('../../src/types').ApiArrayShape} ApiArrayShape */
/** @typedef {import('../../src/types').ApiNodeShape} ApiNodeShape */
/** @typedef {import('../../src/types').ApiUnionShape} ApiUnionShape */
/** @typedef {import('../../src/types').ApiScalarShape} ApiScalarShape */
/** @typedef {import('../../src/types').ApiScalarNode} ApiScalarNode */
/** @typedef {import('../../src/types').ApiFileShape} ApiFileShape */
/** @typedef {import('../../src/types').ApiRecursiveShape} ApiRecursiveShape */
/** @typedef {import('../../src/types').ApiCustomDomainProperty} ApiCustomDomainProperty */
/** @typedef {import('../../src/types').ApiSchemaShape} ApiSchemaShape */

describe('AmfSerializer', () => {
  describe('RAML shapes', () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await AmfLoader.load(true, 'demo-api');
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    it('processes an ArrayShape', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'Arrable');
      const result = /** @type ApiArrayShape */ (serializer.unknownShape(shape));
      assert.equal(result.id, shape['@id'], 'has the id');
      assert.include(result.types, serializer.ns.aml.vocabularies.shapes.ArrayShape, 'has the ArrayShape type');
      assert.equal(result.name, 'Arrable', 'has the name');
      assert.deepEqual(result.examples, [], 'has empty examples');
      assert.deepEqual(result.values, [], 'has empty values');
      assert.deepEqual(result.inherits, [], 'has empty inherits');
      assert.deepEqual(result.or, [], 'has empty or');
      assert.deepEqual(result.and, [], 'has empty and');
      assert.deepEqual(result.xone, [], 'has empty xone');
      assert.deepEqual(result.customDomainProperties, [], 'has empty customDomainProperties');
      assert.typeOf(result.items, 'object', 'has the items');
      assert.include(result.items.types, serializer.ns.w3.shacl.NodeShape, 'items has the NodeShape type');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('processes a NodeShape', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'AppPerson');
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      assert.equal(result.id, shape['@id'], 'has the id');
      assert.include(result.types, serializer.ns.w3.shacl.NodeShape, 'has the NodeShape type');
      assert.equal(result.name, 'AppPerson', 'has the name');
      assert.typeOf(result.description, 'string', 'has the description');
      assert.lengthOf(result.examples, 1, 'has an example');
      assert.include(result.examples[0].types, serializer.ns.aml.vocabularies.apiContract.Example, 'example has the Example type');
      assert.deepEqual(result.values, [], 'has empty values');
      assert.deepEqual(result.inherits, [], 'has empty inherits');
      assert.deepEqual(result.or, [], 'has empty or');
      assert.deepEqual(result.and, [], 'has empty and');
      assert.deepEqual(result.xone, [], 'has empty xone');
      assert.deepEqual(result.customShapeProperties, [], 'has empty customShapeProperties');
      assert.deepEqual(result.customShapePropertyDefinitions, [], 'has empty customShapePropertyDefinitions');
      assert.deepEqual(result.dependencies, [], 'has empty dependencies');
      assert.deepEqual(result.customDomainProperties, [], 'has empty customDomainProperties');
      assert.isFalse(result.closed, 'has the closed');
      assert.typeOf(result.properties, 'array', 'has the properties');
      assert.isNotEmpty(result.properties, 'the properties is not empty');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('processes an UnionShape', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'Unionable');
      const result = /** @type ApiUnionShape */ (serializer.unknownShape(shape));
      assert.equal(result.id, shape['@id'], 'has the id');
      assert.include(result.types, serializer.ns.aml.vocabularies.shapes.UnionShape, 'has the NodeShape type');
      assert.equal(result.name, 'Unionable', 'has the name');
      assert.isUndefined(result.description, 'has no description');
      assert.deepEqual(result.examples, [], 'has no examples');
      assert.deepEqual(result.values, [], 'has empty values');
      assert.deepEqual(result.inherits, [], 'has empty inherits');
      assert.deepEqual(result.or, [], 'has empty or');
      assert.deepEqual(result.and, [], 'has empty and');
      assert.deepEqual(result.xone, [], 'has empty xone');
      assert.deepEqual(result.customDomainProperties, [], 'has empty customDomainProperties');
      assert.typeOf(result.anyOf, 'array', 'has the anyOf');
      assert.lengthOf(result.anyOf, 2, 'has all anyOf');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
      const [any1] = result.anyOf;
      assert.typeOf(any1.id, 'string', 'has the anyOf definition as Shape');
      assert.typeOf(any1.sourceMaps, 'object', 'has source maps');
    });

    it('processes a ScalarShape', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'Feature');
      const result = /** @type ApiScalarShape */ (serializer.unknownShape(shape));
      assert.equal(result.id, shape['@id'], 'has the id');
      assert.include(result.types, serializer.ns.aml.vocabularies.shapes.ScalarShape, 'has the NodeShape type');
      assert.equal(result.name, 'Feature', 'has the name');
      assert.typeOf(result.description, 'string', 'has the description');
      assert.deepEqual(result.examples, [], 'has no examples');
      assert.deepEqual(result.inherits, [], 'has empty inherits');
      assert.deepEqual(result.or, [], 'has empty or');
      assert.deepEqual(result.and, [], 'has empty and');
      assert.deepEqual(result.xone, [], 'has empty xone');
      assert.deepEqual(result.customDomainProperties, [], 'has empty customDomainProperties');
      assert.equal(result.dataType, 'http://www.w3.org/2001/XMLSchema#string', 'has the dataType');
      assert.lengthOf(result.values, 3, 'has the values set');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('processes a ScalarShape with enum values', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'Feature');
      const result = /** @type ApiScalarShape */ (serializer.unknownShape(shape));
      const [v1, v2, v3] = /** @type ApiScalarNode[] */ (result.values);
      assert.include(v1.types, serializer.ns.aml.vocabularies.data.Scalar, 'v1 has the type');
      assert.include(v2.types, serializer.ns.aml.vocabularies.data.Scalar, 'v2 has the type');
      assert.include(v3.types, serializer.ns.aml.vocabularies.data.Scalar, 'v3 has the type');
      assert.equal(v1.name, 'scalar_1', 'v1 has the name');
      assert.equal(v2.name, 'scalar_2', 'v2 has the name');
      assert.equal(v3.name, 'scalar_3', 'v3 has the name');
      assert.equal(v1.value, 'A', 'v1 has the value');
      assert.equal(v2.value, 'B', 'v2 has the value');
      assert.equal(v3.value, 'C', 'v3 has the value');
      assert.equal(v1.dataType, serializer.ns.w3.xmlSchema.string, 'v1 has the dataType');
      assert.equal(v2.dataType, serializer.ns.w3.xmlSchema.string, 'v2 has the dataType');
      assert.equal(v3.dataType, serializer.ns.w3.xmlSchema.string, 'v3 has the dataType');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('processes a FileShape with enum values', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'MaFile');
      const result = /** @type ApiFileShape */ (serializer.unknownShape(shape));

      assert.equal(result.id, shape['@id'], 'has the id');
      assert.include(result.types, serializer.ns.aml.vocabularies.shapes.FileShape, 'has the FileShape type');
      assert.equal(result.name, 'MaFile', 'has the name');
      assert.typeOf(result.description, 'string', 'has the description');
      assert.deepEqual(result.examples, [], 'has no examples');
      assert.deepEqual(result.inherits, [], 'has empty inherits');
      assert.deepEqual(result.or, [], 'has empty or');
      assert.deepEqual(result.and, [], 'has empty and');
      assert.deepEqual(result.xone, [], 'has empty xone');
      assert.deepEqual(result.values, [], 'has empty values');
      assert.deepEqual(result.customDomainProperties, [], 'has empty customDomainProperties');
      assert.deepEqual(result.fileTypes, ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'], 'has the fileTypes');
      assert.equal(result.minLength, 1, 'has the minLength set');
      assert.equal(result.maxLength, 10, 'has the maxLength set');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('processes a RecursiveShape', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'RecursiveShape');
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      const item = /** @type ApiRecursiveShape */ (result.properties[1].range);
      assert.typeOf(item.id, 'string', 'has the id');
      assert.include(item.types, serializer.ns.aml.vocabularies.shapes.RecursiveShape, 'has the RecursiveShape type');
      assert.equal(item.name, 'relatedTo', 'has the name');
      assert.typeOf(item.description, 'string', 'has the description');
      assert.deepEqual(item.inherits, [], 'has empty inherits');
      assert.deepEqual(item.or, [], 'has empty or');
      assert.deepEqual(item.and, [], 'has empty and');
      assert.deepEqual(item.xone, [], 'has empty xone');
      assert.deepEqual(item.values, [], 'has empty values');
      assert.deepEqual(item.customDomainProperties, [], 'has empty customDomainProperties');
      assert.typeOf(item.fixPoint, 'string', 'has the fixPoint');
    });

    it('processes a custom domain properties', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'RecursiveShape');
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      const cdp = /** @type ApiCustomDomainProperty[] */ (result.customDomainProperties);
      assert.typeOf(cdp, 'array', 'has the properties');
      assert.lengthOf(cdp, 1, 'has a single property');
      const [item] = cdp;
      assert.typeOf(item.id, 'string', 'has the id');
      assert.include(item.extension.types, serializer.ns.aml.vocabularies.data.Scalar, 'has the Scalar type');
      assert.equal(item.name, 'deprecated', 'has the extensionName');
      // @ts-ignore
      assert.typeOf(item.extension.value, 'string', 'has the value');
    });

    it('processes a SchemaShape', () => {
      const expects = AmfLoader.lookupExpects(api, '/xml', 'post');
      const payload = AmfLoader._computePayload(expects)[0];
      const shape = payload[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0];
      const result = /** @type ApiSchemaShape */ (serializer.unknownShape(shape));
      assert.equal(result.mediaType, 'application/xml', 'has media type');
      assert.typeOf(result.raw, 'string', 'has raw');
      assert.typeOf(result.examples, 'array', 'has examples');
      assert.lengthOf(result.examples, 1, 'has single examples');
      const [ example ] = result.examples;
      assert.isTrue(example.strict, 'example.strict is set')
      assert.typeOf(example.value, 'string', 'example.value is set')
      assert.typeOf(example.location, 'string', 'example.location is set')
    });

    it('resolves links', () => {
      // takes any operation that has a link-target in the shape
      const expects = AmfLoader.lookupExpects(api, '/files/{fileId}/comments', 'post');
      const payload = AmfLoader._computePayload(expects)[0];
      const shape = payload[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0];
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      assert.equal(result.linkLabel, 'CommentWritable', 'has linkLabel');
      assert.typeOf(result.examples, 'array', 'has examples');
      assert.lengthOf(result.examples, 1, 'has single examples');
    });
  });

  describe('OAS shapes', () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await AmfLoader.load(true, 'petstore');
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    it('processes the oneOf shape (xone)', () => {
      const expects = AmfLoader.lookupExpects(api, '/unions', 'patch');
      const payload = serializer._computePayload(expects)[0];
      const schema = payload[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0];
      const result = serializer.unknownShape(schema);
      // Not sure why is this "any" shape.
      assert.include(result.types, serializer.ns.aml.vocabularies.shapes.AnyShape, 'has the AnyShape type');
      assert.deepEqual(result.or, [], 'has empty or');
      assert.deepEqual(result.and, [], 'has empty and');
      assert.deepEqual(result.values, [], 'has empty values');
      assert.lengthOf(result.xone, 2, 'has the xone array');
      assert.typeOf(result.sourceMaps, 'object', 'has source maps');
    });

    it('processes the allOf shape (and)', () => {
      const expects = AmfLoader.lookupExpects(api, '/unions', 'post');
      const payload = serializer._computePayload(expects)[0];
      const schema = payload[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0];
      const result = serializer.unknownShape(schema);
      assert.include(result.types, serializer.ns.w3.shacl.NodeShape, 'has the NodeShape type');
      assert.deepEqual(result.or, [], 'has empty or');
      assert.deepEqual(result.xone, [], 'has empty xone');
      assert.deepEqual(result.values, [], 'has empty values');
      assert.lengthOf(result.and, 2, 'has the and array');
    });

    it('processes the anyOf shape (or)', () => {
      const returns = AmfLoader.lookupReturns(api, '/pet/listCommon', 'get');
      const payload = serializer._computePayload(returns[0])[0];
      const schema = payload[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0];
      const result = /** @type ApiArrayShape */ (serializer.unknownShape(schema));
      const type = result.items;
      // Not sure why is this "any" shape.
      assert.include(type.types, serializer.ns.aml.vocabularies.shapes.AnyShape, 'has the AnyShape type');
      assert.deepEqual(type.and, [], 'has empty and');
      assert.deepEqual(type.xone, [], 'has empty xone');
      assert.deepEqual(type.values, [], 'has empty values');
      assert.lengthOf(type.or, 3, 'has the or array');
    });

    it('reads the discriminator value', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'Pet');
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      assert.equal(result.discriminator, 'petType')
    });

    it('reads the xmlSerialization value', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'Pet');
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      assert.typeOf(result.xmlSerialization, 'object', 'has the xmlSerialization');
      const xml = result.xmlSerialization;
      assert.include(xml.types, serializer.ns.aml.vocabularies.shapes.XMLSerializer, 'has the XMLSerializer type');
      assert.deepEqual(xml.customDomainProperties, [], 'has empty customDomainProperties');
      assert.isFalse(xml.attribute, 'has the attribute');
      assert.isFalse(xml.wrapped, 'has the wrapped');
      assert.equal(xml.name, 'pet', 'has the name');
    });

    it('reads the customDomainProperties value', () => {
      const shape = AmfLoader.lookupDeclaredShape(api, 'Pet');
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      assert.lengthOf(result.customDomainProperties, 1, 'has the customDomainProperties');
      const [cdp] = result.customDomainProperties;
      assert.equal(cdp.name, 'swagger-router-model', 'has the name');
      const typed = /** @type ApiScalarNode */ (cdp.extension);
      assert.include(typed.types, serializer.ns.aml.vocabularies.data.Scalar, 'has the Scalar type');
      assert.deepEqual(typed.customDomainProperties, [], 'has empty customDomainProperties');
      assert.equal(typed.dataType, serializer.ns.w3.xmlSchema.string, 'has the dataType');
      assert.equal(typed.value, 'io.swagger.petstore.model.Pet', 'has the value');
    });
  });
});
