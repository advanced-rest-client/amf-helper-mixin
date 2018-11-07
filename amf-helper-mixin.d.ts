/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   amf-helper-mixin.html
 */

/// <reference path="../polymer/types/lib/utils/mixin.d.ts" />

declare namespace ApiElements {


  /**
   * Common functions used by AMF components to compute AMF values.
   *
   * ## Updating API's base URI
   *
   * (Only applies when using `_computeEndpointUri()` function)
   *
   * By default the component render the documentation as it is defined
   * in the AMF model. Sometimes, however, you may need to replace the base URI
   * of the API with something else. It is useful when the API does not
   * have base URI property defined (therefore this component render relative
   * paths instead of URIs) or when you want to manage different environments.
   *
   * To update base URI value either update `baseUri` property or use
   * `iron-meta` with key `ApiBaseUri`. First method is easier but the second
   * gives much more flexibility since it use a
   * [monostate pattern](http://wiki.c2.com/?MonostatePattern)
   * to manage base URI property.
   *
   * When the component constructs the funal URI for the endpoint it does the following:
   * - if `baseUri` is set it uses this value as a base uri for the endpoint
   * - else if `iron-meta` with key `ApiBaseUri` exists and contains a value
   * it uses it uses this value as a base uri for the endpoint
   * - else if `amfModel` is set then it computes base uri value from main
   * model document
   * Then it concatenates computed base URI with `endpoint`'s path property.
   */
  function AmfHelperMixin<T extends new (...args: any[]) => {}>(base: T): T & AmfHelperMixinConstructor;

  interface AmfHelperMixinConstructor {
    new(...args: any[]): AmfHelperMixin;
  }

  interface AmfHelperMixin {

    /**
     * Generated AMF json/ld model form the API spec.
     * The element assumes the object of the first array item to be a
     * type of `"http://raml.org/vocabularies/document#Document`
     * on AMF vocabulary.
     *
     * It is only usefult for the element to resolve references.
     */
    amfModel: object|any[]|null;

    /**
     * A namespace for AMF model
     */
    readonly ns: object|null|undefined;

    /**
     * Returns compact model key for given value.
     *
     * @param property AMF orioginal property
     * @returns Compact model property name or the same value if
     * value not found in the context.
     */
    _getAmfKey(property: String|null): String|null;

    /**
     * Ensures that the model is AMF object.
     *
     * @param amf AMF json/ld model
     * @returns API spec
     */
    _ensureAmfModel(amf: object|any[]|null): object|null|undefined;

    /**
     * Ensures that the value is an array.
     * It returns undefined when there's no value.
     * It returns the same array if the value is already an array.
     * It returns new array of the item is not an array.
     *
     * @param value An item to test
     */
    _ensureArray(value: any[]|any|null): any[]|null|undefined;

    /**
     * Gets a signle scalar value from a model.
     *
     * @param model Amf model to extract the value from.
     * @param key Model key to search for the value
     * @returns Value for key
     */
    _getValue(model: object|null, key: String|null): any|null;

    /**
     * Gets values from a model as an array of `@value` properties.
     *
     * @param model Amf model to extract the value from.
     * @param key Model key to search for the value
     * @returns Value for key
     */
    _getValueArray(model: object|null, key: String|null): Array<any|null>|null;

    /**
     * Checks if a model has a type.
     *
     * @param model Model to test
     * @param type Type name
     * @returns True if model has a type.
     */
    _hasType(model: object|null, type: String|null): Boolean|null;

    /**
     * Checks if a shape has a property.
     *
     * @param shape The shape to test
     * @param key Property name to test
     */
    _hasProperty(shape: object|null, key: String|null): Boolean|null;

    /**
     * Computes array value of a property in a model (shape).
     *
     * @param shape AMF shape object
     * @param key Property name
     */
    _computePropertyArray(shape: object|null, key: String|null): Array<any|null>|null|undefined;

    /**
     * Computes a value of a property in a model (shape).
     * It takes first value of a property, if exists.
     *
     * @param shape AMF shape object
     * @param key Property name
     */
    _computePropertyObject(shape: object|null, key: String|null): any|null|undefined;

    /**
     * Tests if a passed argumet exists.
     *
     * @param value A value to test
     */
    _computeHasStringValue(value: String|object|Number|null): Boolean|null;

    /**
     * Computes if passed argument is an array and has a value.
     * It does not check for type or value of the array items.
     *
     * @param value Value to test
     */
    _computeHasArrayValue(value: any[]|null): Boolean|null;

    /**
     * Computes description for a shape.
     *
     * @param shape AMF shape
     * @returns Description value.
     */
    _computeDescription(shape: object|null): String|null;
    _computeHeaders(shape: any): any;
    _computeQueryParameters(shape: any): any;
    _computeResponses(shape: any): any;
    _computeApiVersion(amfModel: any): any;

    /**
     * Computes value for `serverVariables` property.
     *
     * @param server AMF API model for Server.
     * @returns Variables if defined.
     */
    _computeServerVariables(server: object|null): Array<object|null>|null|undefined;

    /**
     * Computes value for `endpointVariables` property.
     *
     * @param endpoint Endpoint model
     * @returns Parameters if defined.
     */
    _computeEndpointVariables(endpoint: object|null): Array<object|null>|null|undefined;

    /**
     * Computes value for the `payload` property
     *
     * @param expects Current value of `expects` property.
     * @returns Payload model if defined.
     */
    _computePayload(expects: object|null): Array<object|null>|null|undefined;

    /**
     * Computes value for `returns` property
     *
     * @param method AMF `supportedOperation` model
     */
    _computeReturns(method: object|null): Array<object|null>|null|undefined;

    /**
     * Computes value for `security` property
     *
     * @param method AMF `supportedOperation` model
     */
    _computeSecurity(method: object|null): Array<object|null>|null|undefined;

    /**
     * Computes value for `hasCustomProperties` property.
     *
     * @param shape AMF `supportedOperation` model
     */
    _computeHasCustomProperties(shape: object|null): Boolean|null;

    /**
     * Computes model's `encodes` property.
     *
     * @param model AMF data model
     * @returns List of encodes
     */
    _computeEncodes(model: object|null): Array<object|null>|null;

    /**
     * Computes list of declarations in the AMF api model.
     *
     * @param model AMF json/ld model for an API
     * @returns List of declarations
     */
    _computeDeclares(model: any[]|object|null): Array<object|null>|null;

    /**
     * Computes list of references in the AMF api model.
     *
     * @param model AMF json/ld model for an API
     * @returns List of declarations
     */
    _computeReferences(model: any[]|object|null): Array<object|null>|null;

    /**
     * Computes AMF's `http://schema.org/WebAPI` model
     *
     * @param model AMF json/ld model for an API
     * @returns Web API declaration.
     */
    _computeWebApi(model: any[]|object|null): object|null;

    /**
     * Computes value for `server` property that is later used with other computations.
     *
     * @param model AMF model for an API
     * @returns The server model
     */
    _computeServer(model: any[]|object|null): object|null;

    /**
     * Computes endpoint's URI based on `amfModel` and `endpoint` models.
     *
     * @param server Server model of AMF API.
     * @param endpoint Endpoint model
     * @param baseUri Current value of `baseUri` property
     * @param version API current version
     * @returns Endpoint's URI
     */
    _computeEndpointUri(server: object|null, endpoint: object|null, baseUri: String|null, version: String|null): String|null;

    /**
     * Computes base URI value from either `baseUri`, `iron-meta` with
     * `ApiBaseUri` key or `amfModel` value (in this order).
     *
     * @param baseUri Value of `baseUri` property
     * @param server AMF API model for Server.
     * @param protocols List of supported protocols
     * @returns Base uri value. Can be empty string.
     */
    _getBaseUri(baseUri: String|null, server: object|null, protocols: Array<String|null>|null): String|null;

    /**
     * Computes base URI from AMF model.
     *
     * @param server AMF API model for Server.
     * @param protocols Listy of supporte dprotocols. If not
     * provided and required to compute the url it uses `amfModel` to compute
     * protocols
     * @returns Base uri value if exists.
     */
    _getAmfBaseUri(server: object|null, protocols: Array<String|null>|null): String|null|undefined;

    /**
     * A function that makes sure that the URL has a scheme definition.
     * If no supported protocols information is available it assumes `http`.
     *
     * @param value A url value
     * @param protocols List of supported by the API protocols
     * An array of string like: `['HTTP', 'HTTPS']`. It lowercase the value.
     * If not set it tries to read supported protocols value from `amfModel`
     * property.
     * @returns Url with scheme.
     */
    _ensureUrlScheme(value: String|null, protocols: Array<String|null>|null): String|null;

    /**
     * Computes supported protocols by the API.
     *
     * @param model AMF data model
     */
    _computeProtocols(model: object|any[]|null): Array<String|null>|null|undefined;

    /**
     * Computes value for the `expects` property.
     *
     * @param method AMF `supportedOperation` model
     */
    _computeExpects(method: object|null): object|null;

    /**
     * Tries to find an example value (whether it's default value or from an
     * example) to put it into snippet's values.
     *
     * @param item A http://raml.org/vocabularies/http#Parameter property
     */
    _computePropertyValue(item: object|null): String|null|undefined;

    /**
     * Computes list of endpoints from a WebApi model.
     *
     * @returns Always returns an array of endpoints.
     */
    _computeEndpoints(webApi: object|null): any[]|null;

    /**
     * Computes model for an endpoint documentation.
     *
     * @param webApi Current value of `webApi` property
     * @param id Selected shape ID
     * @returns An endponit definition
     */
    _computeEndpointModel(webApi: object|null, id: String|null): object|null;

    /**
     * Computes model for an endpoint documentation using it's path.
     *
     * @param webApi Current value of `webApi` property
     * @param path Endpoint path
     * @returns An endponit definition
     */
    _computeEndpointByPath(webApi: object|null, path: String|null): object|null|undefined;

    /**
     * Computes method for the method documentation.
     *
     * @param webApi Current value of `webApi` property
     * @param selected Selected shape
     * @returns A method definition
     */
    _computeMethodModel(webApi: object|null, selected: String|null): object|null;

    /**
     * Computes list of operations in an endpoint
     *
     * @param webApi The WebApi AMF model
     * @param id Endpoint ID
     * @returns List of SupportedOperation objects
     */
    _computeOperations(webApi: object|null, id: String|null): Array<object|null>|null;

    /**
     * Computes an endpoint for a method.
     *
     * @param webApi The WebApi AMF model
     * @param methodId Method id
     * @returns An endpoint model of undefined.
     */
    _computeMethodEndpoint(webApi: object|null, methodId: String|null): object|null|undefined;

    /**
     * Computes a type documentation model.
     *
     * @param declares Current value of `declares` property
     * @param references Current value of `references` property
     * @param selected Selected shape
     * @returns A type definition
     */
    _computeType(declares: any[]|null, references: any[]|null, selected: String|null): object|null;

    /**
     * Computes a type model from a reference (library for example).
     *
     * @param reference AMF model for a reference to extract the data from
     * @param selected Node ID to look for
     * @returns Type definition or undefined if not found.
     */
    _computeReferenceType(reference: object|any[]|null, selected: String|null): object|null|undefined;

    /**
     * Computes model for selected security definition.
     *
     * @param declares Current value of `declares` property
     * @param selected Selected shape
     * @returns A security definition
     */
    _computeSecurityModel(declares: any[]|null, selected: String|null): object|null;

    /**
     * Computes a documentation model.
     *
     * @param webApi Current value of `webApi` property
     * @param selected Selected shape
     * @returns A method definition
     */
    _computeDocument(webApi: object|null, selected: String|null): object|null;

    /**
     * Resolves a reference to an external fragment.
     *
     * @param shape A shape to resolve
     * @returns Resolved shape.
     */
    _resolve(shape: object|null): object|null;
    _getLinkTarget(amf: any, id: any): any;
    _getReferenceId(amf: any, id: any): any;
    _resolveRecursive(shape: any): void;

    /**
     * Gets string value for an example data model.
     *
     * @param item Example item model
     * @param isJson If set it checks if the `raw` value is valid JSON.
     * If it isn't then it parses structured value.
     */
    _getExampleValue(item: object|null, isJson: Boolean|null): String|null;

    /**
     * Computes an example from example structured value.
     *
     * @param model `structuredValue` item model.
     * @returns Javascript object or array with structured value.
     */
    _computeExampleFromStructuredValue(model: object|null): object|any[]|null;

    /**
     * Computes value with propert data type for a structured example.
     *
     * @param model Structured example item model.
     * @returns Value for the example.
     */
    _computeStructuredExampleValue(model: object|null): String|Boolean|Number|null;
  }
}
