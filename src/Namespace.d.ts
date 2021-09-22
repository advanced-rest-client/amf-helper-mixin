interface Document {
  toString(): string;
  key: string;
  Module: string;
  Document: string;
  SecuritySchemeFragment: string;
  UserDocumentation: string;
  DataType: string;
  NamedExamples: string;
  DomainElement: string;
  ParametrizedDeclaration: string;
  ExternalDomainElement: string;
  customDomainProperties: string;
  encodes: string;
  declares: string;
  references: string;
  examples: string;
  linkTarget: string;
  linkLabel: string;
  referenceId: string;
  structuredValue: string;
  raw: string;
  extends: string;
  value: string;
  name: string;
  strict: string;
  deprecated: string;
  location: string;
}

interface Core {
  toString(): string;
  key: string;
  CreativeWork: string;
  version: string;
  urlTemplate: string;
  displayName: string;
  title: string;
  name: string;
  description: string;
  summary: string;
  documentation: string;
  provider: string;
  email: string;
  url: string;
  termsOfService: string;
  license: string;
  mediaType: string;
  extensionName: string;
  deprecated: string;
}

interface Security {
  toString(): string;
  key: string;
  ParametrizedSecurityScheme: string;
  SecuritySchemeFragment: string;
  SecurityScheme: string;
  OAuth1Settings: string;
  OAuth2Settings: string;
  OAuth2Flow: string;
  Scope: string;
  Settings: string;
  HttpSettings: string;
  ApiKeySettings: string;
  OpenIdConnectSettings: string;
  security: string;
  scheme: string;
  schemes: string;
  settings: string;
  name: string;
  type: string;
  scope: string;
  accessTokenUri: string;
  authorizationUri: string;
  authorizationGrant: string;
  flows: string;
  flow: string;
  signature: string;
  tokenCredentialsUri: string;
  requestTokenUri: string;
  refreshUri: string;
  securityRequirement: string;
  openIdConnectUrl: string;
  bearerFormat: string;
  in: string;
}

interface ApiContract {
  toString(): string;
  key: string;
  Payload: string;
  Request: string;
  Response: string;
  EndPoint: string;
  Parameter: string;
  Operation: string;
  WebAPI: string;
  AsyncAPI: string;
  API: string;
  UserDocumentationFragment: string;
  Example: string;
  Server: string;
  ParametrizedResourceType: string;
  ParametrizedTrait: string;
  Callback: string;
  TemplatedLink: string;
  IriTemplateMapping: string;
  Tag: string;
  header: string;
  parameter: string;
  paramName: string;
  uriParameter: string;
  cookieParameter: string;
  variable: string;
  payload: string;
  server: string;
  path: string;
  url: string;
  scheme: string;
  endpoint: string;
  queryString: string;
  accepts: string;
  guiSummary: string;
  binding: string;
  response: string;
  returns: string;
  expects: string;
  examples: string;
  supportedOperation: string;
  statusCode: string;
  method: string;
  required: string;
  callback: string;
  expression: string;
  link: string;
  linkExpression: string;
  templateVariable: string;
  mapping: string;
  operationId: string;
  protocol: string;
  protocolVersion: string;
  Message: string;
  headerSchema: string;
  contentType: string;
  allowEmptyValue: string;
  style: string;
  explode: string;
  allowReserved: string;
  tag: string;
}

interface Shapes {
  toString(): string;
  key: string;
  ScalarShape: string;
  ArrayShape: string;
  UnionShape: string;
  NilShape: string;
  FileShape: string;
  AnyShape: string;
  SchemaShape: string;
  MatrixShape: string;
  TupleShape: string;
  DataTypeFragment: string;
  RecursiveShape: string;
  XMLSerializer: string;
  range: string;
  items: string;
  anyOf: string;
  fileType: string;
  number: string;
  integer: string;
  long: string;
  double: string;
  boolean: string;
  float: string;
  nil: string;
  dateTimeOnly: string;
  password: string;
  schema: string;
  xmlSerialization: string;
  xmlName: string;
  xmlAttribute: string;
  xmlWrapped: string;
  xmlNamespace: string;
  xmlPrefix: string;
  readOnly: string;
  writeOnly: string;
  deprecated: string;
  fixPoint: string;
  discriminator: string;
  discriminatorValue: string;
  format: string;
  multipleOf: string;
  uniqueItems: string;
}

interface Data {
  toString(): string;
  key: string;
  Scalar: string;
  Object: string;
  Array: string;
  value: string;
  type: string;
  description: string;
  required: string;
  displayName: string;
  minLength: string;
  maxLength: string;
  default: string;
  multipleOf: string;
  minimum: string;
  maximum: string;
  enum: string;
  pattern: string;
  items: string;
  format: string;
  example: string;
  examples: string;
}

interface DocSourceMaps {
  toString(): string;
  key: string;
  SourceMap: string;
  sources: string;
  element: string;
  value: string;
  declaredElement: string;
  trackedElement: string;
  parsedJsonSchema: string;
  lexical: string;
  synthesizedField: string;
}

interface Vocabularies {
  toString(): string;
  key: string;
  document: Readonly<Document>;
  core: Readonly<Core>;
  security: Readonly<Security>;
  apiContract: Readonly<ApiContract>;
  shapes: Readonly<Shapes>;
  data: Readonly<Data>;
  docSourceMaps: Readonly<DocSourceMaps>;
}

interface Aml {
  toString(): string;
  key: string;
  vocabularies: Readonly<Vocabularies>;
}

interface RdfSyntax {
  toString(): string;
  key: string;
  member: string;
  Seq: string;
}

interface RdfSchema {
  toString(): string;
  key: string;
  member: string;
  Seq: string;
}

interface Hydra {
  toString(): string;
  key: string;
  core: ApiContract;
}

interface XmlSchema {
  toString(): string;
  key: string;
  boolean: string;
  string: string;
  number: string;
  integer: string;
  long: string;
  double: string;
  float: string;
  nil: string;
  dateTime: string;
  time: string;
  date: string;
  base64Binary: string;
}

interface Shacl {
  toString(): string;
  key: string;
  Shape: string;
  NodeShape: string;
  SchemaShape: string;
  PropertyShape: string;
  in: string;
  defaultValue: string;
  defaultValueStr: string;
  pattern: string;
  minInclusive: string;
  maxInclusive: string;
  multipleOf: string;
  minLength: string;
  maxLength: string;
  fileType: string;
  and: string;
  property: string;
  name: string;
  raw: string;
  datatype: string;
  minCount: string;
  maxCount: string;
  xone: string;
  not: string;
  or: string;
  closed: string;
  path: string;
}

interface W3 {
  toString(): string;
  key: string;
  rdfSyntax: Readonly<RdfSyntax>;
  rdfSchema: Readonly<RdfSchema>;
  hydra: Readonly<Hydra>;
  xmlSchema: Readonly<XmlSchema>;
  shacl: Readonly<Shacl>;
}

interface Schema {
  toString(): string;
  key: string;
  name: string;
  desc: string;
  doc: string;
  webApi: string;
  creativeWork: string;
  displayName: string;
  title: string;
}

export interface Namespace {
  name: string;
  /**
   * AMF namespace
   */
  aml: Readonly<Aml>;
  /**
   * AMF namespace (compatibility)
   */
  raml: Readonly<Aml>;
  /**
   * W3 namespace
   */
  w3: Readonly<W3>;
  /**
   * Schema namespace. The same as aml.vocabularies
   */
  schema: Readonly<Schema>;
}
export const ns: Namespace;
