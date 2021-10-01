/* eslint-disable class-methods-use-this */
import { AnyShape, ApiKeySettings, ArrayNode, ArrayShape, Callback, CreativeWork, DataArrangeShape, DataNode, DocumentSourceMaps, DomainElement, EndPoint, Example, FileShape, HttpSettings, IriTemplateMapping, NodeShape, OAuth1Settings, OAuth2Flow, OAuth2Settings, ObjectNode, OpenIdConnectSettings, Operation, Parameter, ParametrizedSecurityScheme, Payload, PropertyShape, RecursiveShape, Request, Response, ScalarNode, ScalarShape, SchemaShape, Scope, SecurityRequirement, SecurityScheme, Server, Settings, Shape, SynthesizedField, Tag, TemplatedLink, TupleShape, UnionShape } from "./amf.js";
import { AmfHelperMixin, expandKey, findAmfType, getArrayItems } from "./AmfHelperMixin.js";
import { ApiAnyShape, ApiArrayNode, ApiArrayShape, ApiCallback, ApiCustomDomainProperty, ApiDataArrangeShape, ApiDataNode, ApiDataNodeUnion, ApiDocumentation, ApiDocumentSourceMaps, ApiEndPoint, ApiExample, ApiFileShape, ApiIriTemplateMapping, ApiNodeShape, ApiObjectNode, ApiOperation, ApiParameter, ApiParametrizedSecurityScheme, ApiPayload, ApiPropertyShape, ApiRecursiveShape, ApiRequest, ApiResponse, ApiScalarNode, ApiScalarShape, ApiSchemaShape, ApiSecurityApiKeySettings, ApiSecurityHttpSettings, ApiSecurityOAuth1Settings, ApiSecurityOAuth2Flow, ApiSecurityOAuth2Settings, ApiSecurityOpenIdConnectSettings, ApiSecurityRequirement, ApiSecurityScheme, ApiSecurityScope, ApiSecuritySettings, ApiSecuritySettingsUnion, ApiServer, ApiShape, ApiShapeUnion, ApiSynthesizedField, ApiTag, ApiTupleShape, ApiUnionShape, ApiXMLSerializer } from "./types.js";

/**
 * A class that takes AMF's ld+json model and outputs JavaScript interface of it.
 */
export declare class AmfSerializer extends AmfHelperMixin(Object) {
  /**
   * @param graph Optional AMF generated graph model.
   */
  constructor(graph?: DomainElement);
  /**
   * @param object The AMF Server to serialize.
   * @returns Serialized Server
   */
  server(object: Server): ApiServer;

  /**
   * @param object The Parameter to serialize.
   * @returns Serialized Parameter
   */
  parameter(object: Parameter): ApiParameter;
  unknownShape(object: Shape): ApiShapeUnion;
  isLink(object: DomainElement): boolean;
  shape(object: Shape): ApiShape;
  anyShape(object: AnyShape): ApiAnyShape;
  /**
   * Filters examples that should be rendered for a payload identified by `payloadId`.
   * 
   * This function is copied from old `api-example-generator/ExampleGenerator`.
   */
  filterTrackedExamples(examples: Example[], payloadId: string): Example[];
  /**
   * Kind of the opposite of the `filterTrackedExamples`. It gathers examples that only have been 
   * defined for the parent Shape (ed in the type declaration). It filters out all examples
   * defined in a payload.
   */
  filterNonTrackedExamples(examples: Example[]): Example[];
  scalarShape(object: ScalarShape): ApiScalarShape;
  /**
   * @param object The NodeShape to serialize
   */
  nodeShape(object: NodeShape): ApiNodeShape;
  propertyShape(object: PropertyShape): ApiPropertyShape;
  unionShape(object: UnionShape): ApiUnionShape;
  fileShape(object: FileShape): ApiFileShape;
  schemaShape(object: SchemaShape): ApiSchemaShape;
  recursiveShape(object: RecursiveShape): ApiRecursiveShape;
  dataArrangeShape(object: DataArrangeShape): ApiDataArrangeShape;
  arrayShape(object: ArrayShape): ApiArrayShape;
  tupleShape(object: TupleShape): ApiTupleShape;
  /**
   * @param object The CreativeWork to serialize.
   * @returns Serialized CreativeWork
   */
  documentation(object: CreativeWork): ApiDocumentation;
  /**
   * @param object The Example to serialize.
   * @returns Serialized Example
   */
  example(object: Example): ApiExample;
  xmlSerializer(object: XMLSerializer): ApiXMLSerializer;
  unknownDataNode(object: DataNode): ApiDataNodeUnion;
  dataNode(object: DataNode): ApiDataNode;
  scalarNode(object: ScalarNode): ApiScalarNode;
  objectNode(object: ObjectNode): ApiObjectNode;
  arrayNode(object: ArrayNode): ApiArrayNode;

  /**
   * Adds the custom domain properties to the currently processed property, a.k.a annotations.
   * @param object 
   * @returns The list of custom domain properties.
   */
  customDomainProperties(object: DomainElement): ApiCustomDomainProperty[];

  /**
   * @param object The EndPoint to serialize.
   * @returns Serialized EndPoint
   */
  endPoint(object: EndPoint): ApiEndPoint;

  /**
   * @param object The Operation to serialize.
   * @returns Serialized Operation
   */
  operation(object: Operation): ApiOperation;
  tag(object: Tag): ApiTag;
  callback(object: Callback): ApiCallback;

  /**
   * @param object The API request to serialize.
   * @returns Serialized API request
   */
  request(object: Request): ApiRequest;

  /**
   * @param object The Response to serialize.
   * @returns Serialized Response
   */
  response(object: Response): ApiResponse;

  /**
   * @param object The Payload to serialize.
   * @returns Serialized Payload
   */
  payload(object: Payload): ApiPayload;

  /**
   * @param object The TemplatedLink to serialize.
   * @returns Serialized TemplatedLink
   */
  templatedLink(object: TemplatedLink): TemplatedLink;
  iriTemplateMapping(object: IriTemplateMapping): ApiIriTemplateMapping;

  /**
   * @param object The ParametrizedSecurityScheme to serialize.
   * @returns Serialized ParametrizedSecurityScheme
   */
  parametrizedSecurityScheme(object: ParametrizedSecurityScheme): ApiParametrizedSecurityScheme;

  /**
   * @param object The SecurityScheme to serialize.
   * @returns Serialized SecurityScheme
   */
  securityScheme(object: SecurityScheme): ApiSecurityScheme;

  /**
   * @param object The SecurityRequirement to serialize.
   * @returns Serialized SecurityRequirement
   */
  securityRequirement(object: SecurityRequirement): ApiSecurityRequirement;
  securitySettings(object: Settings): ApiSecuritySettingsUnion;
  settings(object: Settings): ApiSecuritySettings;
  oAuth1Settings(object: OAuth1Settings): ApiSecurityOAuth1Settings;
  oAuth2Settings(object: OAuth2Settings): ApiSecurityOAuth2Settings;
  oAuth2Flow(object: OAuth2Flow): ApiSecurityOAuth2Flow;
  scope(object: Scope): ApiSecurityScope;
  apiKeySettings(object: ApiKeySettings): ApiSecurityApiKeySettings;
  httpSettings(object: HttpSettings): ApiSecurityHttpSettings;
  openIdConnectSettings(object: OpenIdConnectSettings): ApiSecurityOpenIdConnectSettings;
  /**
   * Serializes source maps, when available.
   */
  sourceMap(object: DocumentSourceMaps): ApiDocumentSourceMaps|undefined;
  synthesizedField(object: SynthesizedField): ApiSynthesizedField;
}
