import {
  AmfDocument, AsyncApi, DomainElement, EndPoint, Operation, Parameter, Payload, Request, Response,
  SecurityRequirement, SecurityScheme, Server, Shape, WebApi, Api
} from './amf';
import { Namespace } from './Namespace';
import { ComputeUriOptions, ServerQueryOptions, ServersQueryOptions } from './types';

export {AmfHelperMixin};

/**
 * Common functions used by AMF components to compute AMF values.
 *
 * ## Updating API's base URI
 *
 * (Only applies when using `_computeUri()` function)
 *
 * By default the component render the documentation as it is defined
 * in the AMF model. Sometimes, however, you may need to replace the base URI
 * of the API with something else. It is useful when the API does not
 * have base URI property defined (therefore this component render relative
 * paths instead of URIs) or when you want to manage different environments.
 *
 * To update base URI value update the `baseUri` property.
 *
 * When the component constructs the final URI for the endpoint it does the following:
 * - if `baseUri` is set it uses this value as a base uri for the endpoint
 * - else if `amf` is set then it computes base uri value from main
 * model document
 * Then it concatenates computed base URI with `endpoint`'s path property.
 */
declare function AmfHelperMixin<T extends new (...args: any[]) => {}>(base: T): T & AmfHelperMixinConstructor;

interface AmfHelperMixinConstructor {
  new(...args: any[]): AmfHelperMixin;
}

export {AmfHelperMixinConstructor};

export const expandKey: unique symbol;
export const findAmfType: unique symbol;
export const findReferenceObject: unique symbol;
export const getArrayItems: unique symbol;

interface AmfHelperMixin {

  /**
   * A namespace for AMF model.
   */
  readonly ns: Namespace;

  /**
   * Generated AMF json/ld model form the API spec.
   * The element assumes the object of the first array item to be a
   * type of `"http://raml.org/vocabularies/document#Document`
   * on AMF vocabulary.
   *
   * It is only useful for the element to resolve references.
   */
  amf: AmfDocument|undefined;
  _amf: AmfDocument|undefined;

  /**
   * This is an abstract method to be implemented by the components.
   * If, instead, the component uses `amf` setter you must use `super.amf` to
   * set the value.
   * @param amf Current AMF model. Can be undefined.
   */
  __amfChanged(amf: AmfDocument): void

  /**
   * Returns compact model key for given value.
   *
   * @param property AMF original property
   * @returns Compact model property name or the same value if
   * value not found in the context.
   */
  _getAmfKey(property: string|undefined): string|undefined;

  /**
   * Ensures that the model is AMF object.
   *
   * @param amf AMF json/ld model
   * @returns API spec
   */
  _ensureAmfModel(amf: any): AmfDocument|undefined;

  /**
   * Ensures that the value is an array.
   * It returns undefined when there's no value.
   * It returns the same array if the value is already an array.
   * It returns new array of the item is not an array.
   *
   * @param value An item to test
   */
  _ensureArray<T>(value: T): T[]|undefined;

  /**
   * Ensures that the value is an array.
   * It returns undefined when there's no value.
   * It returns the same array if the value is already an array.
   * It returns new array of the item is not an array.
   *
   * @param value An item to test
   */
  _ensureArray<T>(value: T[]): T[]|undefined;

  /**
   * Gets a single scalar value from a model.
   *
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @returns Value for key
   */
  _getValue(model: DomainElement, key: string): string|number|boolean|undefined|null;

  /**
   * Gets values from a model as an array of `@value` properties.
   *
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @returns Value for key
   */
  _getValueArray(model: DomainElement, key: string): Array<string|number|boolean|null>|undefined;

  /**
   * Reads an array from the model.
   *
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @returns Value for the key
   */
  [getArrayItems](model: DomainElement, key: string): DomainElement[]|undefined;

  /**
   * Reads the value of the `@id` property.
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the @id
   */
  _getLinkValue(model: DomainElement, key: string): string|undefined;

  /**
   * Reads the list of value for the `@id` property.
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the `@id`
   */
  _getLinkValues(model: DomainElement, key: string): string[]|undefined;

  /**
   * Checks if a model has a type.
   *
   * @param model Model to test
   * @param type Type name
   * @returns True if model has a type.
   */
  _hasType(model: DomainElement, type: string): boolean|null;

  /**
   * Checks if a shape has a property.
   *
   * @param shape The shape to test
   * @param key Property name to test
   */
  _hasProperty(shape: DomainElement, key: string): boolean|null;

  /**
   * Computes array value of a property in a model (shape).
   *
   * @param shape AMF shape object
   * @param key Property name
   */
  _computePropertyArray(shape: DomainElement, key: string): Array<string|number|boolean|null|Object>|undefined;

  /**
   * Computes a value of a property in a model (shape).
   * It takes first value of a property, if exists.
   *
   * @param shape AMF shape object
   * @param key Property name
   */
  _computePropertyObject(shape: DomainElement, key: string): string|number|boolean|null|Object|undefined;

  /**
   * Tests if a passed argument exists.
   *
   * @param value A value to test
   */
  _computeHasStringValue(value: string|object|number): boolean;

  /**
   * Computes if passed argument is an array and has a value.
   * It does not check for type or value of the array items.
   *
   * @param value Value to test
   */
  _computeHasArrayValue(value: any[]): boolean;

  /**
   * Computes description for a shape.
   *
   * @param shape AMF shape
   * @returns Description value.
   */
  _computeDescription(shape: DomainElement): string|undefined;
  /**
   * Computes a list of headers
   */
  _computeHeaders(shape: DomainElement): Parameter[]|undefined|Parameter;

  _computeHeaderSchema(shape: DomainElement): Parameter|undefined;

  /**
   * Computes a list of query parameters
   */
  _computeQueryParameters(shape: DomainElement): Parameter[]|undefined;

  /**
   * In OAS URI parameters can be defined on an operation level under `uriParameter` property.
   * Normally `_computeQueryParameters()` function would be used to extract parameters from an endpoint.
   * This is a fallback option to test when an API is OAS.
   *
   * @param shape Method or Expects model
   */
  _computeUriParameters(shape: Operation|Request): Parameter[]|undefined;
  /**
   * Computes a list of responses
   */
  _computeResponses(shape: Operation): Response[]|undefined;

  /**
   * Computes value for `serverVariables` property.
   *
   * @param server AMF API model for Server.
   * @returns Variables if defined.
   */
  _computeServerVariables(server: Server): Parameter[]|undefined;

  /**
   * Computes value for `endpointVariables` property.
   *
   * @param endpoint Endpoint model
   * @param method Optional method to be used to lookup the parameters from
   * This is used for OAS model which can defined path parameters on a method level.
   * @returns Parameters if defined.
   */
  _computeEndpointVariables(endpoint: Server, method?: Operation): Parameter[]|undefined;

  /**
   * Computes value for the `payload` property
   *
   * @param expects Current value of `expects` property.
   * @returns Payload model if defined.
   */
  _computePayload(expects: Request): Payload[]|undefined;

  /**
   * Computes value for `returns` property
   *
   * @param method AMF `supportedOperation` model
   */
  _computeReturns(method: Operation): Response[]|undefined;

  /**
   * Computes value for `security` property
   *
   * @param method AMF `supportedOperation` model
   */
  _computeSecurity(method: Operation): SecurityRequirement[]|undefined;

  /**
   * Computes value for `hasCustomProperties` property.
   *
   * @param shape AMF `supportedOperation` model
   */
  _computeHasCustomProperties(shape: DomainElement): boolean|null;

  /**
   * Computes API version from the AMF model.
   */
  _computeApiVersion(amf: AmfDocument): string|undefined;

  /**
   * Computes model's `encodes` property.
   *
   * @param model AMF data model
   * @returns List of encodes
   */
  _computeEncodes(model: AmfDocument): Api|undefined;

  /**
   * Computes model's `agent` property.
   *
   * @param model AMF data model
   * @returns List of encodes
   */
  _computeAgents(node: AmfDocument): Object[]|undefined;

  /**
   * Computes model's `topic` property.
   *
   * @param model AMF data model
   * @returns List of encodes
   */
  _computeTopics(node: AmfDocument): Object[]|undefined;

  /**
   * Computes list of declarations in the AMF api model.
   *
   * @param model AMF json/ld model for an API
   * @returns List of declarations
   */
  _computeDeclares(model: AmfDocument): DomainElement[]|undefined;

  /**
   * Computes list of references in the AMF api model.
   *
   * @param model AMF json/ld model for an API
   * @returns List of declarations
   */
  _computeReferences(model: AmfDocument): DomainElement[]|undefined;

  /**
   * Computes AMF's `http://schema.org/WebAPI` model
   *
   * @param model AMF json/ld model for an API
   * @returns Web API declaration.
   */
  _computeWebApi(model: AmfDocument): WebApi|undefined;

  /**
   * Computes AMF's `http://schema.org/API` model
   *
   * @param model AMF json/ld model for an API
   * @return The API declaration.
   */
  _computeApi(model: AmfDocument): AsyncApi|WebApi;

  /**
   * Returns whether an AMF node is a WebAPI node
   *
   * @param model  AMF json/ld model for an API
   */
  _isWebAPI(model: AmfDocument): boolean;

  /**
   * Returns whether an AMF node is an AsyncAPI node
   *
   * @param model  AMF json/ld model for an API
   */
  _isAsyncAPI(model: AmfDocument): boolean;

  /**
   * Returns whether an AMF node is an API node
   *
   * @param model  AMF json/ld model for an API
   */
  _isAPI(model: AmfDocument): boolean;

  /**
   * Computes value for `server` property that is later used with other computations.
   *
   * @param model AMF model for an API
   * @returns The server model
   */
  _computeServer(model: AmfDocument): Server|undefined;

  /**
   * Determines whether a partial model is valid for reading servers from
   * Current valid values:
   * - Operation
   * - Endpoint
   * @param model The partial model to evaluate
   * @returns Whether the model's type is part of the array of valid node types from which to read servers
   */
  _isValidServerPartial(model: any): boolean;

  /**
   * @returns List of servers for method, if defined, or endpoint, if defined, or root level
   */
  _getServers(opts?: ServersQueryOptions): Server[]|undefined;

  /**
   * Compute values for `server` property based on node an optional selected id.
   *
   * @returns The server list or undefined if node has no servers
   */
  _getServer(opts?: ServerQueryOptions): Server[]|undefined;

  /**
   * Computes endpoint's URI based on `amf` and `endpoint` models.
   *
   * @param server Server model of AMF API.
   * @param endpoint Endpoint model
   * @param baseUri Current value of `baseUri` property
   * @param version API current version
   * @returns Endpoint's URI
   * @deprecated Use `_computeUri()` instead
   */
  _computeEndpointUri(server: Server, endpoint: EndPoint, baseUri?: string, version?: string): string|undefined;

  /**
   * Computes endpoint's URI based on `endpoint` model.
   *
   * @param endpoint Model for the endpoint
   * @param opts Configuration options
   */
  _computeUri(endpoint: EndPoint, opts?: ComputeUriOptions): string;

  /**
   * Appends endpoint's path to the url
   */
  _appendPath(url: string, endpoint: EndPoint): string;

  /**
   * Computes base URI value from either `baseUri`, `iron-meta` with
   * `ApiBaseUri` key or `amf` value (in this order).
   *
   * @param baseUri Value of `baseUri` property
   * @param server AMF API model for Server.
   * @param protocols List of supported protocols
   * @returns Base uri value. Can be empty string.
   */
  _getBaseUri(baseUri: string, server: Server, protocols?: string[]): string;

  /**
   * Computes base URI from AMF model.
   *
   * @param server AMF API model for Server.
   * @param protocols List of supported protocols. If not
   * provided and required to compute the url it uses `amf` to compute
   * protocols
   * @returns Base uri value if exists.
   */
  _getAmfBaseUri(server: Server, protocols: string[]): string|undefined;

  /**
   * A function that makes sure that the URL has a scheme definition.
   * If no supported protocols information is available it assumes `http`.
   *
   * @param value A url value
   * @param protocols List of supported by the API protocols
   * An array of string like: `['HTTP', 'HTTPS']`. It lowercase the value.
   * If not set it tries to read supported protocols value from `amf`
   * property.
   * @returns Url with scheme.
   */
  _ensureUrlScheme(value: string, protocols: string[]): string|undefined;

  /**
   * Computes supported protocols by the API.
   *
   * @param model AMF data model
   */
  _computeProtocols(model: AmfDocument): string[]|undefined;

  /**
   * Computes value for the `expects` property.
   *
   * @param method AMF `supportedOperation` model
   */
  _computeExpects(method: Operation): Request|undefined;

  /**
   * Computes all values for the `expects` property.
   *
   * @param method AMF `supportedOperation` model
   */
  _computeAllExpects(method: Operation): Request[]|undefined;

  /**
   * Tries to find an example value (whether it's default value or from an
   * example) to put it into snippet's values.
   *
   * @param item A http://raml.org/vocabularies/http#Parameter property
   */
  _computePropertyValue(item: Parameter): string|undefined;

  /**
   * Computes list of endpoints from a WebApi model.
   *
   * @returns Always returns an array of endpoints.
   */
  _computeEndpoints(webApi: WebApi): EndPoint[]|undefined;

  /**
   * Computes model for an endpoint documentation.
   *
   * @param webApi Current value of `webApi` property
   * @param id Selected shape ID
   * @returns An endpoint definition
   */
  _computeEndpointModel(webApi: WebApi, id: string): EndPoint|undefined;

  /**
   * Computes model for an endpoint documentation using it's path.
   *
   * @param webApi Current value of `webApi` property
   * @param path Endpoint path
   * @returns An endpoint definition
   */
  _computeEndpointByPath(webApi: WebApi, path: string): EndPoint|undefined;

  /**
   * Computes method for the method documentation.
   *
   * @param webApi Current value of `webApi` property
   * @param selected Selected shape
   * @returns A method definition
   */
  _computeMethodModel(webApi: WebApi, selected: string): Operation|undefined;

  /**
   * Computes list of operations in an endpoint
   *
   * @param webApi The WebApi AMF model
   * @param id Endpoint ID
   * @returns List of SupportedOperation objects
   */
  _computeOperations(webApi: WebApi, id: string): Operation[]|undefined;

  /**
   * Computes an endpoint for a method.
   *
   * @param webApi The WebApi AMF model
   * @param methodId Method id
   * @returns An endpoint model of undefined.
   */
  _computeMethodEndpoint(webApi: WebApi, methodId: string): EndPoint|undefined;

  /**
   * Computes a list of methods for an endpoint that contains a method with
   * given id.
   *
   * @param webApi WebApi model
   * @param methodId Method id.
   * @returns A list of sibling methods or undefined.
   */
  __computeMethodsListForMethod(webApi: WebApi, methodId: string): Operation[]|undefined;

  /**
   * Computes a type documentation model.
   *
   * @param declares Current value of `declares` property
   * @param references Current value of `references` property
   * @param selected Selected shape
   * @returns A type definition
   */
  _computeType(declares: DomainElement[], references: DomainElement[], selected: string): Shape|undefined;

  /**
   * Finds a type in the model declares and references.
   * @param domainId The domain id of the type (AMF's shape).
   * @returns The AMF shape or undefined when not found.
   */
  [findAmfType](domainId?: string): Shape|undefined;

  /**
   * Searches for an object in model's references list.
   * It does not resolve the object (useful for handling links correctly).
   *
   * @param domainId The domain of the object to find in the references.
   * @returns The domain object or undefined.
   */
  [findReferenceObject](domainId?: string): DomainElement|undefined;

  /**
   * Computes a type model from a reference (library for example).
   *
   * @param reference AMF model for a reference to extract the data from
   * @param selected Node ID to look for
   * @returns Type definition or undefined if not found.
   */
  _computeReferenceType(reference: DomainElement, selected: string): Shape|undefined;

  /**
   * Computes model for selected security definition.
   *
   * @param declares Current value of `declares` property
   * @param selected Selected shape
   * @returns A security definition
   */
  _computeSecurityModel(declares: DomainElement[], selected: string): SecurityScheme|undefined;

  /**
   * Computes a documentation model.
   *
   * @param webApi Current value of `webApi` property
   * @param selected Selected shape
   * @returns A method definition
   */
  _computeDocument(webApi: WebApi, selected: string): DomainElement|undefined;

  /**
   * Resolves a reference to an external fragment.
   *
   * @param shape A shape to resolve
   * @returns Resolved shape.
   */
  _resolve<T>(shape: T): T;
  _getLinkTarget(amf: AmfDocument, id: string): DomainElement|undefined;

  /**
   * Resolves the shape of a given reference.
   *
   * @param references References object to search in
   * @param id Id of the shape to resolve
   * @returns Resolved shape for given reference, undefined otherwise
   */
  _obtainShapeFromReferences(references: DomainElement[], id: string): DomainElement|undefined;

  /**
   * Searches a node with a given ID in an array
   *
   * @param array Array to search for a given ID
   * @param id Id to search for
   * @returns Node with the given ID when found, undefined otherwise
   */
  _findById(array: DomainElement[], id: string): DomainElement|undefined;
  _getReferenceId(amf: AmfDocument, id: string): DomainElement|undefined;
  _resolveRecursive<T>(shape: T): T;

  /**
   * Merge two shapes together. If the resulting shape has one of the "special merge" keys,
   * then the special merge function for that key will be used to match that property
   * @param shapeA AMF node
   * @param shapeB AMF node
   * @returns Merged AMF node
   */
  _mergeShapes(shapeA: any, shapeB: any): any;

  /**
   * Obtains source map sources value from two shapes and returns the merged result
   * If neither shape has a sources node, then an empty object will be returned.
   * Result is wrapped in an array as per AMF model standard
   * @param AMF node
   * @param AMF node
   * @returns Empty object or resulting merge, wrapped in an array
   */
  _mergeSourceMapsSources(shapeA: any, shapeB: any): any[];

  /**
   * Expands the key property from compacted mode to full mode.
   * @param value The value to process
   * @returns The expanded value.
   */
  [expandKey](value: string): string;
}
