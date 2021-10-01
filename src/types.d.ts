import { Server } from "./amf";

interface ServersQueryOptions {
  /**
   * An EndPoint to look for the servers in
   */
  endpointId?: string
  /**
   * An Operation to look for the servers in
   */
  methodId?: string
}

interface ServerQueryOptions {
  /**
   * An EndPoint to look for the servers in. Required if Operation is provided
   */
  endpointId?: string
  /**
   * An Operation to look for the servers in
   */
  methodId?: string
  /**
   * Optional selected server id
   */
  id?: string;
}

interface ComputeUriOptions {
  /**
   * Model for the current server, if available.
   */
  server?: Server;
  /**
   * Base URI to be used with the endpoint's path.
   * Note, base URI is ignored when `ignoreBase` is set
   */
  baseUri?: string;
  /**
   * Current version of the API. It is used to replace
   * `{version}` from the URI template.
   */
  version?: string;
  /**
   * List of available protocols of the base URI with path.
   */
  protocols?: string[];
  /**
   * Whether or not to ignore rendering
   */
  ignoreBase?: boolean;
  ignorePath?: boolean;
}

export interface ApiDomainProperty {
  id: string;
  types: string[];
  customDomainProperties: ApiCustomDomainProperty[];
}

export interface ApiCustomDomainProperty {
  id: string;
  name: string;
  extension: ApiDataNodeUnion;
}

export type ScalarDataTypes = 'string' | 'base64Binary' | 'boolean' | 'date' | 'dateTime' | 'double' | 'float' | 'integer' | 'long' | 'number' | 'time';

export interface ApiEndPoint extends ApiDomainProperty {
  description?: string;
  name?: string;
  summary?: string;
  path: string;
  operations: ApiOperation[];
  parameters: ApiParameter[];
  payloads: ApiPayload[];
  servers: ApiServer[];
  security: ApiSecurityRequirement[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiOperation extends ApiDomainProperty {
  method: string;
  name?: string;
  description?: string;
  summary?: string;
  deprecated: boolean;
  schemes?: string[];
  accepts?: string[];
  contentType?: string[];
  operationId?: string;
  documentation?: ApiDocumentation;
  request?: ApiRequest;
  responses: ApiResponse[];
  security: ApiSecurityRequirement[];
  callbacks: ApiCallback[];
  servers: ApiServer[];
  tags: ApiTag[];
  sourceMaps?: ApiDocumentSourceMaps;
  traits: ApiParametrizedTrait[];
}

export interface ApiTag extends ApiDomainProperty {
  name: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiServer extends ApiDomainProperty {
  url: string;
  description?: string;
  variables: ApiParameter[];
  sourceMaps?: ApiDocumentSourceMaps;
  protocol?: string;
  protocolVersion?: string;
  security?: ApiSecurityRequirement[];
}

export interface ApiParameter extends ApiDomainProperty {
  name?: string;
  paramName?: string;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  binding?: string;
  schema?: ApiShapeUnion;
  payloads: ApiPayload[];
  examples: ApiExample[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiExample extends ApiDomainProperty {
  name?: string;
  displayName?: string;
  description?: string;
  value?: string;
  structuredValue?: ApiDataNodeUnion;
  strict: boolean;
  mediaType?: string;
  location?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiPayload extends ApiDomainProperty {
  name?: string;
  mediaType?: string;
  schema?: ApiShapeUnion;
  examples: ApiExample[];
  // encoding: ApiEncoding[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiResponse extends ApiDomainProperty {
  name?: string;
  description?: string;
  statusCode?: string;
  headers: ApiParameter[];
  payloads: ApiPayload[];
  examples: ApiExample[];
  links: ApiTemplatedLink[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiTemplatedLink extends ApiDomainProperty {
  name?: string;
  description?: string;
  template?: string;
  operationId?: string;
  requestBody?: string;
  mapping: ApiIriTemplateMapping[];
  server?: ApiServer;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiIriTemplateMapping extends ApiDomainProperty {
  templateVariable?: string;
  linkExpression?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityRequirement extends ApiDomainProperty {
  name?: string;
  schemes: ApiParametrizedSecurityScheme[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiParametrizedSecurityScheme extends ApiDomainProperty {
  name?: string;
  settings?: ApiSecuritySettingsUnion;
  scheme?: ApiSecurityScheme;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityScheme extends ApiDomainProperty {
  name?: string;
  type?: string;
  displayName?: string;
  description?: string;
  settings?: ApiSecuritySettingsUnion;
  headers: ApiParameter[];
  queryParameters: ApiParameter[];
  responses: ApiResponse[];
  queryString?: ApiShapeUnion;
  sourceMaps?: ApiDocumentSourceMaps;
}


export interface ApiSecuritySettings extends ApiDomainProperty {
  additionalProperties?: ApiDataNodeUnion;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityOAuth1Settings extends ApiSecuritySettings {
  requestTokenUri?: string;
  authorizationUri?: string;
  tokenCredentialsUri?: string;
  signatures: string[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityOAuth2Settings extends ApiSecuritySettings {
  authorizationGrants: string[];
  flows: ApiSecurityOAuth2Flow[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityApiKeySettings extends ApiSecuritySettings {
  name?: string;
  in?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityHttpSettings extends ApiSecuritySettings {
  scheme?: string;
  bearerFormat?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityOpenIdConnectSettings extends ApiSecuritySettings {
  url?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export type ApiSecuritySettingsUnion = ApiSecuritySettings | ApiSecurityOAuth1Settings | ApiSecurityOAuth2Settings | ApiSecurityApiKeySettings | ApiSecurityHttpSettings | ApiSecurityOpenIdConnectSettings;

export interface ApiSecurityOAuth2Flow extends ApiDomainProperty {
  authorizationUri?: string;
  accessTokenUri?: string;
  flow?: string;
  refreshUri?: string;
  scopes: ApiSecurityScope[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiSecurityScope extends ApiDomainProperty {
  name?: string;
  description?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiRequest extends ApiDomainProperty {
  description?: string;
  required?: boolean;
  queryParameters: ApiParameter[];
  headers: ApiParameter[];
  payloads: ApiPayload[];
  queryString?: ApiShapeUnion;
  uriParameters: ApiParameter[];
  cookieParameters: ApiParameter[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiCallback extends ApiDomainProperty {
  name?: string;
  expression?: string;
  endpoint?: ApiEndPoint;
  sourceMaps?: ApiDocumentSourceMaps;
}

/**
 * The definition of the domain extension
 */
export interface ApiCustomDomainExtension extends ApiDomainProperty {
  name?: string;
  displayName?: string;
  description?: string;
  domain: string[];
  schema?: ApiShapeUnion;
  sourceMaps?: ApiDocumentSourceMaps;
}

/**
 * Applies to an object domain extension
 */
export interface ApiDomainExtension extends ApiDomainProperty {
  name?: string;
  definedBy?: ApiCustomDomainExtension;
  extension?: ApiDataNodeUnion;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiDocumentation extends ApiDomainProperty {
  url?: string;
  description?: string;
  title?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface SerializedApi extends ApiDomainProperty {
  isAsyncApi: boolean;
  isWebApi: boolean;
  name?: string;
  description?: string;
  identifier?: string;
  schemes: string[];
  endPoints: string[];
  accepts: string[];
  contentType: string[];
  version?: string;
  termsOfService?: string;
  provider?: string;
  license?: string;
  documentations: string[];
  servers: string[];
  security: string[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export type ApiShapeUnion = ApiScalarShape | ApiNodeShape | ApiUnionShape | ApiFileShape | ApiSchemaShape | ApiAnyShape | ApiArrayShape | ApiTupleShape | ApiRecursiveShape;

export interface ApiShape extends ApiDomainProperty {
  values: ApiDataNodeUnion[];
  inherits: ApiShapeUnion[];
  or: ApiShapeUnion[];
  and: ApiShapeUnion[];
  xone: ApiShapeUnion[];
  name?: string;
  displayName?: string;
  description?: string;
  defaultValueStr?: string;
  defaultValue?: ApiDataNodeUnion;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  not?: ApiShapeUnion;
  /**
   * A label that appeared on a link.
   */
  linkLabel?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiPropertyShape extends ApiShape {
  path?: string;
  range?: ApiShapeUnion;
  minCount?: number;
  maxCount?: number;
  patternName?: string;
}

export interface ApiAnyShape extends ApiShape {
  documentation?: ApiDocumentation;
  xmlSerialization: ApiXMLSerializer;
  examples: ApiExample[];
}

export interface ApiNodeShape extends ApiAnyShape {
  minProperties?: number;
  maxProperties?: number;
  closed?: boolean;
  customShapeProperties: string[];
  customShapePropertyDefinitions: string[];
  discriminator?: string;
  discriminatorValue?: string;
  properties: ApiPropertyShape[];
  dependencies: string[];
}

export interface ApiXMLSerializer extends ApiDomainProperty {
  attribute?: boolean;
  wrapped?: boolean;
  name?: string;
  namespace?: string;
  prefix?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiScalarShape extends ApiAnyShape {
  dataType?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  format?: string;
  multipleOf?: number;
}

export interface ApiFileShape extends ApiAnyShape {
  fileTypes?: string[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  format?: string;
  multipleOf?: number;
}

export interface ApiSchemaShape extends ApiAnyShape {
  mediaType?: string;
  raw?: string;
}

export interface ApiUnionShape extends ApiAnyShape {
  anyOf: ApiShapeUnion[];
}

export interface ApiDataArrangeShape extends ApiAnyShape {
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface ApiArrayShape extends ApiDataArrangeShape {
  items?: ApiShapeUnion;
}

export interface ApiTupleShape extends ApiDataArrangeShape {
  items: ApiShapeUnion[];
  additionalItems?: boolean;
}

export interface ApiRecursiveShape extends ApiShape {
  fixPoint: string;
}

export interface ApiDataNode extends ApiDomainProperty {
  name?: string;
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiObjectNode extends ApiDataNode {
  properties: { [key: string]: ApiDataNodeUnion };
}

export interface ApiScalarNode extends ApiDataNode {
  value?: string;
  dataType?: string;
}

export interface ApiArrayNode extends ApiDataNode {
  members: ApiDataNodeUnion[];
}

export type ApiDataNodeUnion = ApiDataNode | ApiObjectNode | ApiScalarNode | ApiArrayNode;

export interface ApiEncoding {
  propertyName?: string;
  contentType?: string;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  headers: ApiParameter[];
  sourceMaps?: ApiDocumentSourceMaps;
}

export interface ApiDocumentSourceMaps {
  synthesizedField?: ApiSynthesizedField[];
  lexical?: ApiSynthesizedField[];
  trackedElement?: ApiSynthesizedField;
  autoGeneratedName?: ApiSynthesizedField[];
  parsedJsonSchema?: ApiSynthesizedField;
  declaredElement?: ApiSynthesizedField;
}

export interface ApiSynthesizedField {
  id: string;
  element: string;
  value: string;
}

export interface ApiParametrizedDeclaration extends ApiDomainProperty {
  name?: string;
  target?: ApiAbstractDeclaration;
  variables: ApiVariableValue[];
}

export interface ApiVariableValue extends ApiDomainProperty {
  name: string;
  value?: ApiDataNode;
}

export interface ApiAbstractDeclaration extends ApiDomainProperty {
  name: string;
  description?: string;
  dataNode?: ApiDataNode;
  variables: string[];
}

export interface ApiParametrizedTrait extends ApiParametrizedDeclaration {
}

export interface ShapeProcessingOptions {
  /**
   * This is set when serializing a shape / parameter.
   * It is used to determine which example of the schema to include.
   * 
   * When an example has the `tracked-element` in the source maps then this
   * is used to determine the only examples included to the schema.
   * 
   * Note, the value of the tracked-element can be a list of IDs separated by coma.
   */
  trackedId?: string;
}
