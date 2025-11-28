# gRPC Helper Methods

This document describes the new helper methods added to `AmfHelperMixin` to support gRPC APIs in API Console components.

## Test Data

Tests use the files `apis/grpc-api.json` and `apis/grpc-api-compact.json` which contain real AMF models of a gRPC API in regular and compact format respectively, following the repository's standard pattern.

## AmfLoader Helper Methods

In addition to the mixin methods, helper methods have been added to `AmfLoader` to facilitate searching for specific gRPC services and methods in tests:

### `AmfLoader.lookupGrpcService(model, serviceName)`
Finds a specific gRPC service by name.

```javascript
const service = AmfLoader.lookupGrpcService(grpcModel, 'Greeter');
if (service) {
  const serviceName = this._computeGrpcServiceName(service);
  console.log('Found service:', serviceName);
}
```

### `AmfLoader.lookupGrpcMethod(model, serviceName, methodName)`
Finds a specific gRPC method within a service.

```javascript
const method = AmfLoader.lookupGrpcMethod(grpcModel, 'Greeter', 'SayHello');
if (method) {
  const streamType = this._getGrpcStreamType(method);
  const signature = this._computeGrpcMethodSignature(method, service);
  console.log('Method signature:', signature, 'Stream type:', streamType);
}
```

## Main Methods

### gRPC Detection

#### `_isGrpcApi(api)`
Determines if the current API is a gRPC API by checking media types.

```javascript
const isGrpc = this._isGrpcApi(this.amf);
if (isGrpc) {
  // Process as gRPC API
}
```

#### `_isGrpcOperation(operation)`
Determines if a specific operation is a gRPC operation.

```javascript
const method = this._computeMethodModel(webApi, methodId);
if (this._isGrpcOperation(method)) {
  // Process as gRPC method
}
```

#### `_isGrpcService(endpoint)`
Checks if an endpoint represents a gRPC service.

```javascript
const endpoints = this._computeEndpoints(webApi);
const grpcServices = endpoints.filter(ep => this._isGrpcService(ep));
```

### Stream Types

#### `_getGrpcStreamType(operation)`
Gets the stream type for a gRPC operation.

**Return values:**
- `'unary'` - One request, one response
- `'client_streaming'` - Multiple requests, one response  
- `'server_streaming'` - One request, multiple responses
- `'bidi_streaming'` - Multiple requests, multiple responses

```javascript
const streamType = this._getGrpcStreamType(operation);
// 'unary', 'client_streaming', 'server_streaming', 'bidi_streaming'
```

#### `_getGrpcStreamTypeDisplayName(streamType)`
Gets the human-readable name for a stream type.

```javascript
const displayName = this._getGrpcStreamTypeDisplayName('client_streaming');
// 'Client Streaming'
```

#### `_getGrpcStreamTypeBadge(streamType)`
Gets the badge identifier for UI display.

```javascript
const badge = this._getGrpcStreamTypeBadge('unary');
// 'U'
```

### Services and Methods

#### `_computeGrpcServices(webApi)`
Gets all gRPC services from a WebAPI.

```javascript
const webApi = this._computeWebApi(this.amf);
const services = this._computeGrpcServices(webApi);
```

#### `_computeGrpcMethods(service)`
Gets all gRPC methods for a service.

```javascript
const methods = this._computeGrpcMethods(service);
```

#### `_computeGrpcServiceName(endpoint)`
Gets the gRPC service name from an endpoint.

```javascript
const serviceName = this._computeGrpcServiceName(service);
// 'Greeter'
```

#### `_computeGrpcMethodName(operation)`
Gets the gRPC method name from an operation.

```javascript
const methodName = this._computeGrpcMethodName(operation);
// 'SayHello'
```

#### `_computeGrpcMethodSignature(operation, service)`
Builds a method signature for display.

```javascript
const signature = this._computeGrpcMethodSignature(operation, service);
// 'Greeter.SayHello'
```

### Schemas and Messages

#### `_computeGrpcRequestSchema(operation)`
Gets the request message schema for a gRPC operation.

```javascript
const requestSchema = this._computeGrpcRequestSchema(operation);
```

#### `_computeGrpcResponseSchema(operation)`
Gets the response message schema for a gRPC operation.

```javascript
const responseSchema = this._computeGrpcResponseSchema(operation);
```

#### `_computeGrpcMessageTypes(api)`
Extracts all message types (schemas) from a gRPC API for the Types section.

```javascript
const messageTypes = this._computeGrpcMessageTypes(this.amf);
```

#### `_isGrpcMessageType(shape)`
Checks if a shape represents a gRPC message type.

```javascript
const isMessageType = this._isGrpcMessageType(shape);
```

### Utilities

#### `_computeGrpcPackageName(api)`
Gets the gRPC package name from the API.

```javascript
const packageName = this._computeGrpcPackageName(this.amf);
// 'helloworld'
```

#### `_computeGrpcHttpMethod(operation)`
Gets the HTTP method equivalent for gRPC operations (typically POST).

```javascript
const httpMethod = this._computeGrpcHttpMethod(operation);
// 'POST'
```

#### `_computeGrpcOperationId(operation, service)`
Computes a friendly operation ID for gRPC methods.

```javascript
const operationId = this._computeGrpcOperationId(operation, service);
```

#### `_hasGrpcEndpoints(api)`
Determines if the API has any gRPC endpoints.

```javascript
const hasGrpc = this._hasGrpcEndpoints(this.amf);
```

#### `_computeGrpcSummary(webApi)`
Gets a summary of gRPC services and method counts.

```javascript
const summary = this._computeGrpcSummary(webApi);
// {
//   serviceCount: 1,
//   services: [{
//     name: 'Greeter',
//     id: '/service/Greeter',
//     methodCount: 2,
//     methods: [...]
//   }]
// }
```

## Usage in Components

### API Navigation

```javascript
class ApiNavigation extends AmfHelperMixin(LitElement) {
  
  computeNavigationItems() {
    const webApi = this._computeWebApi(this.amf);
    const items = [];
    
    // Add gRPC services
    const grpcServices = this._computeGrpcServices(webApi);
    if (grpcServices) {
      grpcServices.forEach(service => {
        const methods = this._computeGrpcMethods(service);
        items.push({
          name: this._computeGrpcServiceName(service),
          type: 'grpc-service',
          children: methods.map(method => ({
            name: this._computeGrpcMethodName(method),
            streamType: this._getGrpcStreamType(method),
            badge: this._getGrpcStreamTypeBadge(this._getGrpcStreamType(method))
          }))
        });
      });
    }
    
    return items;
  }
}
```

### API Method Documentation

```javascript
class ApiMethodDocumentation extends AmfHelperMixin(LitElement) {
  
  computeMethodData() {
    const method = this._computeMethodModel(this.webApi, this.selectedMethod);
    
    if (this._isGrpcOperation(method)) {
      return {
        type: 'grpc',
        streamType: this._getGrpcStreamType(method),
        requestSchema: this._computeGrpcRequestSchema(method),
        responseSchema: this._computeGrpcResponseSchema(method),
        showUrlPanel: false, // Hide URL panel for gRPC
        showSnippets: false  // Hide HTTP snippets for gRPC
      };
    }
    
    return this.computeRestMethodData(method);
  }
}
```

### API Summary

```javascript
class ApiSummary extends AmfHelperMixin(LitElement) {
  
  computeApiSummary() {
    const webApi = this._computeWebApi(this.amf);
    
    if (this._isGrpcApi(this.amf)) {
      const grpcSummary = this._computeGrpcSummary(webApi);
      return {
        type: 'grpc',
        packageName: this._computeGrpcPackageName(this.amf),
        ...grpcSummary
      };
    }
    
    return this.computeRestApiSummary(webApi);
  }
}
```

## Namespace Support

Support for gRPC-specific properties has been added to the namespace:

```javascript
// Namespace.js
ns.aml.vocabularies.core.grpcStreamType = `${coreKey}grpcStreamType`;
```

## Media Type Detection

The helpers detect gRPC operations by checking the following media types:

- `application/grpc`
- `application/grpc+proto`
- `application/protobuf` (for responses)

## Complete Example

See `examples/grpc-usage.js` for complete usage examples in different scenarios.

## Compatibility

These helpers are fully compatible with existing REST/RAML APIs. The methods return `undefined` or `false` when used with non-gRPC APIs, allowing components to handle both API types transparently.

## Current Limitations

1. **Stream Types**: Currently defaults to 'unary' until AMF provides stream type metadata.
2. **Examples**: Automatic examples for gRPC require additional AMF metadata.
3. **gRPC Metadata**: Options like deadlines and HTTP/2 headers require additional AMF support.

## Next Steps

1. Coordinate with AMF team to add stream type metadata
2. Implement support for automatic examples
3. Add support for gRPC metadata (options, deadlines, etc.)
4. Extend streaming support in the Try Panel