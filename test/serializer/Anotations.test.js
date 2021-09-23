import { assert } from "@open-wc/testing";
import { AmfLoader } from "../AmfLoader.js";
import { AmfSerializer } from "../../index.js";

/** @typedef {import('../../src/types').ApiScalarNode} ApiScalarNode */
/** @typedef {import('../../src/types').ApiObjectNode} ApiObjectNode */

describe("AmfSerializer", () => {
  describe("Annotations", () => {
    [true, ].forEach((compact) => {
      describe(compact ? "Compact model" : "Full model", () => {
        let api;
        /** @type AmfSerializer */
        let serializer;
        before(async () => {
          api = await AmfLoader.load(compact);
          serializer = new AmfSerializer();
          serializer.amf = api;
        });

        it("ObjectNode annotations", () => {
          const shape = AmfLoader.lookupOperation(api, "/about", "get");
          const result = serializer.operation(shape);
          assert.typeOf(result, "object", "returns an object");
          const { customDomainProperties } = result;
          assert.typeOf(customDomainProperties, 'array', 'has the customDomainProperties');
          assert.lengthOf(customDomainProperties, 1, 'has a single annotation');
          const [annotation] = customDomainProperties;
          assert.equal(annotation.extensionName, 'clearanceLevel', 'has the extensionName');
          const { properties } = /** @type ApiObjectNode */ (/** @type unknown */ (annotation));
          assert.typeOf(properties, 'object', 'has properties');
          const { level, signature } = properties;
          assert.typeOf(level, 'object', 'has the level property');
          assert.typeOf(signature, 'object', 'has the level property');
        });

        it("ScalarShape annotations", () => {
          const shape = AmfLoader.lookupOperation(api, "/files", "post");
          const result = serializer.operation(shape);
          assert.typeOf(result, "object", "returns an object");
          const { customDomainProperties } = result;
          assert.typeOf(customDomainProperties, 'array', 'has the customDomainProperties');
          assert.lengthOf(customDomainProperties, 1, 'has a single annotation');
          const [annotation] = customDomainProperties;
          assert.equal(annotation.extensionName, 'deprecated', 'has the extensionName');
          const { value, dataType, } = /** @type ApiScalarNode */ (/** @type unknown */ (annotation));
          assert.equal(dataType, 'http://www.w3.org/2001/XMLSchema#string', 'has the dataType');
          assert.equal(value, 'This operation is deprecated and will be removed.', 'has the value');
        });
      });
    });
  });
});
