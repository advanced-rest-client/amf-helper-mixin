import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer } from '../../index.js';

/** @typedef {import('../../src/types').ApiScalarShape} ApiScalarShape */
/** @typedef {import('../../src/types').ApiObjectNode} ApiObjectNode */
/** @typedef {import('../../src/types').ApiSecurityOAuth2Settings} ApiSecurityOAuth2Settings */
/** @typedef {import('../../src/types').ApiSecurityOAuth1Settings} ApiSecurityOAuth1Settings */
/** @typedef {import('../../src/types').ApiSecurityApiKeySettings} ApiSecurityApiKeySettings */
/** @typedef {import('../../src/types').ApiSecurityOpenIdConnectSettings} ApiSecurityOpenIdConnectSettings */
/** @typedef {import('../../src/types').ApiSecurityHttpSettings} ApiSecurityHttpSettings */

describe('AmfSerializer', () => {
  describe('OAS security', () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await AmfLoader.load(true, 'oas-3-api');
      serializer = new AmfSerializer(api);
    });

    describe('operation security', () => {
      it('serializes oauth2 scheme', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/pets', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'petstore_auth', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'petstore_auth', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.isUndefined(secScheme.description, 'settings has description');
        assert.equal(secScheme.type, 'OAuth 2.0', 'settings has type');
        
        const oauth2Settings = /** @type ApiSecurityOAuth2Settings */ (secScheme.settings);
        assert.deepEqual(oauth2Settings.authorizationGrants, [], 'has the authorizationGrants');
        assert.lengthOf(oauth2Settings.flows, 1, 'has the flows');
        assert.typeOf(oauth2Settings.sourceMaps, 'object', 'oauth2Settings has source maps');
        
        const [flow] = oauth2Settings.flows;
        assert.typeOf(flow.scopes, 'array', 'the flow has scopes');
        assert.lengthOf(flow.scopes, 2, 'the flow has 2 scopes');
        assert.equal(flow.authorizationUri, 'http://example.org/api/oauth/dialog', 'the flow has authorizationUri');
        assert.equal(flow.refreshUri, 'http://example.org/api/refresh', 'the flow has refreshUri');
        assert.equal(flow.flow, 'implicit', 'the flow has flow');
      });

      it('serializes API key scheme', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/securityCombo', 'get');
        const result = serializer.securityRequirement(security[1]);
        assert.equal(result.id, security[1]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'api_key', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'api_key', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.isUndefined(secScheme.description, 'settings has description');
        assert.equal(secScheme.type, 'Api Key', 'settings has type');
        
        const apiKeySettings = /** @type ApiSecurityApiKeySettings */ (secScheme.settings);
        assert.typeOf(apiKeySettings.sourceMaps, 'object', 'apiKeySettings has source maps');
        assert.deepEqual(apiKeySettings.customDomainProperties, [], 'apiKeySettings has customDomainProperties');
        assert.equal(apiKeySettings.in, 'header', 'apiKeySettings has in');
      });

      it('serializes OpenID scheme', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/securityCombo', 'get');
        const result = serializer.securityRequirement(security[2]);
        assert.equal(result.id, security[2]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'OpenID', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'OpenID', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.equal(secScheme.description, 'Using OpenId', 'settings has description');
        assert.equal(secScheme.type, 'openIdConnect', 'settings has type');
        
        const apiKeySettings = /** @type ApiSecurityOpenIdConnectSettings */ (secScheme.settings);
        assert.typeOf(apiKeySettings.sourceMaps, 'object', 'apiKeySettings has source maps');
        assert.deepEqual(apiKeySettings.customDomainProperties, [], 'apiKeySettings has customDomainProperties');
        assert.equal(apiKeySettings.url, 'https://example.com/.well-known/openid-configuration', 'apiKeySettings has in');
      });

      it('serializes basic HTTP', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/http-security', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'BasicAuth', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'BasicAuth', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.equal(secScheme.description, 'A basic HTTP scheme', 'settings has description');
        assert.equal(secScheme.type, 'http', 'settings has type');
        
        const secSettings = /** @type ApiSecurityHttpSettings */ (secScheme.settings);
        assert.typeOf(secSettings.sourceMaps, 'object', 'secSettings has source maps');
        assert.deepEqual(secSettings.customDomainProperties, [], 'secSettings has customDomainProperties');
        assert.equal(secSettings.scheme, 'basic', 'secSettings has in');
      });

      it('serializes Bearer auth', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/http-security', 'post');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'BearerAuth', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'BearerAuth', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.equal(secScheme.description, 'Bearer form of authentication', 'settings has description');
        assert.equal(secScheme.type, 'http', 'settings has type');
        
        const secSettings = /** @type ApiSecurityHttpSettings */ (secScheme.settings);
        assert.typeOf(secSettings.sourceMaps, 'object', 'secSettings has source maps');
        assert.deepEqual(secSettings.customDomainProperties, [], 'secSettings has customDomainProperties');
        assert.equal(secSettings.scheme, 'bearer', 'secSettings has in');
      });

      it('serializes auth with cookies', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/http-security', 'patch');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'cookieAuth', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'cookieAuth', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.isUndefined(secScheme.description, 'settings has description');
        assert.equal(secScheme.type, 'Api Key', 'settings has type');
        
        const secSettings = /** @type ApiSecurityApiKeySettings */ (secScheme.settings);
        assert.typeOf(secSettings.sourceMaps, 'object', 'secSettings has source maps');
        assert.deepEqual(secSettings.customDomainProperties, [], 'secSettings has customDomainProperties');
        assert.equal(secSettings.in, 'cookie', 'secSettings has in');
        assert.equal(secSettings.name, 'JSESSIONID', 'secSettings has in');
      });

      it('serializes auth with query params', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/http-security', 'options');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'ApiKeyQuery', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'ApiKeyQuery', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.equal(secScheme.description, 'API Key in a query parameter', 'settings has description');
        assert.equal(secScheme.type, 'Api Key', 'settings has type');
        
        const secSettings = /** @type ApiSecurityApiKeySettings */ (secScheme.settings);
        assert.typeOf(secSettings.sourceMaps, 'object', 'secSettings has source maps');
        assert.deepEqual(secSettings.customDomainProperties, [], 'secSettings has customDomainProperties');
        assert.equal(secSettings.in, 'query', 'secSettings has in');
        assert.equal(secSettings.name, 'X-API-Key', 'secSettings has in');
      });
    });
  });

  describe('RAML security', () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await AmfLoader.load(true, 'secured-api');
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    describe('operation security', () => {
      it('serializes basic HTTP', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/basic', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'basic', 'scheme has name');

        const settings = scheme.scheme;
        assert.include(settings.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(settings.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(settings.headers, [], 'settings has no headers');
        assert.deepEqual(settings.queryParameters, [], 'settings has no queryParameters');
        assert.deepEqual(settings.responses, [], 'settings has no responses');
        assert.typeOf(settings.sourceMaps, 'object', 'settings has source maps');
        assert.equal(settings.name, 'basic', 'settings has name');
        assert.equal(settings.description, 'This API supports Basic Authentication.\n', 'settings has description');
        assert.equal(settings.type, 'Basic Authentication', 'settings has type');
      });

      it('serializes digest', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/digest', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'digest', 'scheme has name');
        
        const settings = scheme.scheme;
        assert.include(settings.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(settings.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(settings.headers, [], 'settings has no headers');
        assert.deepEqual(settings.queryParameters, [], 'settings has no queryParameters');
        assert.deepEqual(settings.responses, [], 'settings has no responses');
        assert.typeOf(settings.sourceMaps, 'object', 'settings has source maps');
        assert.equal(settings.name, 'digest', 'settings has name');
        assert.equal(settings.description, 'This API supports DigestSecurityScheme Authentication.\n', 'settings has description');
        assert.equal(settings.type, 'Digest Authentication', 'settings has type');
      });

      it('serializes passthrough', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/passthrough', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'passthrough', 'scheme has name');
        
        const settings = scheme.scheme;
        assert.include(settings.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(settings.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.lengthOf(settings.headers, 1, 'settings has headers');
        assert.lengthOf(settings.queryParameters, 2, 'settings has queryParameters');
        assert.deepEqual(settings.responses, [], 'settings has no responses');
        assert.typeOf(settings.sourceMaps, 'object', 'settings has source maps');
        assert.equal(settings.name, 'passthrough', 'settings has name');
        assert.equal(settings.description, 'This API supports Pass Through Authentication.\n', 'settings has description');
        assert.equal(settings.type, 'Pass Through', 'settings has type');
      });

      it('serializes passthrough with a query string', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/passthrough-query-string', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'passthroughQueryString', 'scheme has name');
        
        const settings = scheme.scheme;
        assert.include(settings.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(settings.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(settings.headers, [], 'settings has headers');
        assert.deepEqual(settings.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(settings.responses, [], 'settings has no responses');
        assert.typeOf(settings.sourceMaps, 'object', 'settings has source maps');
        assert.typeOf(settings.queryString, 'object', 'settings has queryString');
        assert.equal(settings.name, 'passthroughQueryString', 'settings has name');
        assert.equal(settings.description, 'This API supports Pass Through Authentication.\n', 'settings has description');
        assert.equal(settings.type, 'Pass Through', 'settings has type');
      });

      it('serializes custom scheme (#1)', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/custom1', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'custom1', 'scheme has name');
        
        const settings = scheme.scheme;
        assert.include(settings.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(settings.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.lengthOf(settings.headers, 1, 'settings has headers');
        assert.lengthOf(settings.queryParameters, 2, 'settings has queryParameters');
        assert.lengthOf(settings.responses, 2, 'settings has responses');
        assert.typeOf(settings.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(settings.queryString, 'settings has no queryString');
        assert.equal(settings.name, 'custom1', 'settings has name');
        assert.typeOf(settings.description, 'string', 'settings has description');
        assert.equal(settings.type, 'x-my-custom', 'settings has type');
      });

      it('serializes custom scheme with a query string (#1)', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/custom-query-string', 'get');
        const result = serializer.securityRequirement(security[0]);
        const [scheme] = result.schemes;
        const settings = scheme.scheme;
        assert.typeOf(settings.queryString, 'object',  'settings has queryString');
      });

      it('serializes custom scheme (#2)', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/custom2', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'custom2', 'scheme has name');
        
        const settings = scheme.scheme;
        assert.include(settings.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(settings.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(settings.headers, [], 'settings has headers');
        assert.lengthOf(settings.queryParameters, 2, 'settings has queryParameters');
        assert.lengthOf(settings.responses, 1, 'settings has responses');
        assert.typeOf(settings.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(settings.queryString, 'settings has no queryString');
        assert.equal(settings.name, 'custom2', 'settings has name');
        assert.typeOf(settings.description, 'string', 'settings has description');
        assert.equal(settings.type, 'x-custom', 'settings has type');
      });

      it('serializes oauth2 scheme', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/oauth2', 'post');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'oauth2', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.lengthOf(secScheme.headers, 1, 'settings has headers');
        assert.lengthOf(secScheme.queryParameters, 1, 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'oauth2', 'settings has name');
        assert.equal(secScheme.displayName, 'Regular OAuth 2.0 definition', 'settings has displayName');
        assert.isUndefined(secScheme.description, 'settings has description');
        assert.equal(secScheme.type, 'OAuth 2.0', 'settings has type');

        const oauth2Settings = /** @type ApiSecurityOAuth2Settings */ (secScheme.settings);
        assert.deepEqual(oauth2Settings.authorizationGrants, [], 'has the authorizationGrants');
        assert.lengthOf(oauth2Settings.flows, 1, 'has the flows');
        assert.typeOf(oauth2Settings.sourceMaps, 'object', 'oauth2Settings has source maps');
        
        const [flow] = oauth2Settings.flows;
        assert.typeOf(flow.scopes, 'array', 'the flow has scopes');
        assert.lengthOf(flow.scopes, 2, 'the flow has 2 scopes');
        assert.equal(flow.authorizationUri, 'https://auth.com', 'the flow has authorizationUri');
        assert.equal(flow.accessTokenUri, 'https://token.com', 'the flow has accessTokenUri');
      });

      it('serializes oauth2 scheme with annotations', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/oauth2-with-annotations', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        const [scheme] = result.schemes;
        const secScheme = scheme.scheme;
        const oauth2Settings = /** @type ApiSecurityOAuth2Settings */ (secScheme.settings);
        assert.lengthOf(oauth2Settings.customDomainProperties, 1, 'has custom properties')
      });

      it('serializes oauth2 scheme with grant types', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/oauth2-with-grant-list', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        const [scheme] = result.schemes;
        const secScheme = scheme.scheme;
        const oauth2Settings = /** @type ApiSecurityOAuth2Settings */ (secScheme.settings);
        assert.deepEqual(oauth2Settings.authorizationGrants, ['authorization_code'], 'has the authorizationGrants')
      });

      it('serializes oauth1 scheme', () => {
        const security = AmfLoader.lookupOperationSecurity(api, '/oauth1', 'get');
        const result = serializer.securityRequirement(security[0]);
        assert.equal(result.id, security[0]['@id'], 'has the id');
        assert.include(result.types, serializer.ns.aml.vocabularies.security.securityRequirement, 'has the types');
        assert.deepEqual(result.customDomainProperties, [], 'has no customDomainProperties');
        assert.typeOf(result.sourceMaps, 'object', 'has source maps');
        assert.typeOf(result.schemes, 'array', 'has schemes');
        assert.lengthOf(result.schemes, 1, 'has single scheme');
        const [scheme] = result.schemes;
        assert.include(scheme.types, serializer.ns.aml.vocabularies.security.ParametrizedSecurityScheme, 'scheme has the types');
        assert.deepEqual(scheme.customDomainProperties, [], 'scheme has no customDomainProperties');
        assert.typeOf(scheme.sourceMaps, 'object', 'scheme has source maps');
        assert.equal(scheme.name, 'oauth1', 'scheme has name');
        
        const secScheme = scheme.scheme;
        assert.include(secScheme.types, serializer.ns.aml.vocabularies.security.SecurityScheme, 'settings has the types');
        assert.deepEqual(secScheme.customDomainProperties, [], 'settings has no customDomainProperties');
        assert.deepEqual(secScheme.headers, [], 'settings has headers');
        assert.deepEqual(secScheme.queryParameters, [], 'settings has queryParameters');
        assert.deepEqual(secScheme.responses, [], 'settings has responses');
        assert.typeOf(secScheme.sourceMaps, 'object', 'settings has source maps');
        assert.isUndefined(secScheme.queryString, 'settings has no queryString');
        assert.equal(secScheme.name, 'oauth1', 'settings has name');
        assert.isUndefined(secScheme.displayName, 'settings has no displayName');
        assert.equal(secScheme.description, 'OAuth 1.0 continues to be supported for all API requests, but OAuth 2.0 is now preferred.', 'settings has description');
        assert.equal(secScheme.type, 'OAuth 1.0', 'settings has type');

        const oauth1Settings = /** @type ApiSecurityOAuth1Settings */ (secScheme.settings);
        assert.deepEqual(oauth1Settings.signatures, ['RSA-SHA1', 'HMAC-SHA1'], 'has the authorizationGrants');
        assert.equal(oauth1Settings.authorizationUri, 'http://api.domain.com/oauth1/authorize', 'has the authorizationUri');
        assert.equal(oauth1Settings.requestTokenUri, 'http://api.domain.com/oauth1/request_token', 'has the requestTokenUri');
        assert.equal(oauth1Settings.tokenCredentialsUri, 'http://api.domain.com/oauth1/access_token', 'has the tokenCredentialsUri');
        assert.typeOf(oauth1Settings.sourceMaps, 'object', 'oauth2Settings has source maps');
      });
    });

  });
});
