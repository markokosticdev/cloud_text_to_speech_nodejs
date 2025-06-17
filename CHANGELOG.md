# Changelog

## [3.0.0] - 2024-12-19

### 🚀 Major Features

#### **Universal TTS Interface**
- **Multi-provider support**: Single API for Google Cloud Text-to-Speech, Microsoft Azure Cognitive Services, and Amazon Polly
- **Provider abstraction**: Clean separation between universal and provider-specific code
- **Single initialization**: Unified init pattern with configuration validation
- **Provider switching**: Dynamic provider selection and multi-provider mode

#### **Complete SSML System Overhaul**
- **SSML Validator**: Comprehensive validation with provider-specific schemas
- **Schema Separation**: Google (13 elements), Microsoft (18 elements), Amazon (12 elements)
- **Tag Preservation**: Enhanced DOM processing to preserve all SSML tags during splitting
- **Advanced Processing**: Improved sanitization, minimization, and validation pipeline

#### **Enhanced Configuration Management**
- **Environment Variables**: Support for configuration via environment variables
- **File-based Config**: JSON configuration file support with validation
- **Centralized Management**: ConfigurationManager for unified configuration handling
- **Validation Pipeline**: Comprehensive parameter validation and error reporting

#### **Comprehensive Test Suite**
- **78 Universal Tests**: Complete test coverage with >89% statement coverage
- **System Integration**: 16 end-to-end tests validating multi-provider workflows
- **SSML Processing**: 62 tests with 100% coverage for SSML validation and processing
- **Mock System**: Comprehensive test utilities and sample data for all providers

### ✅ Universal Interface Implementation

#### **Core Universal Classes**
- `TtsUniversal`: Main interface class with provider abstraction
- `ConvertParamsUniversal`: Unified parameter mapping for all providers
- `VoiceUniversal`: Cross-provider voice representation
- `ConvertAudioOptionsUniversal`: Universal audio configuration

#### **Provider Management**
- **Single Provider Mode**: Initialize with specific provider (Google, Microsoft, Amazon)
- **Multi-Provider Mode**: Combine all providers with unified voice discovery
- **Dynamic Switching**: Change providers at runtime with validation
- **Error Context**: Provider-specific error handling with retry indicators

#### **Parameter Mapping**
- **ConvertParamsMapper**: Automatic parameter translation between universal and provider-specific formats
- **VoicesParamsMapper**: Voice parameter mapping with locale and name handling
- **AudioFormatMapper**: Universal audio format translation
- **StreamFormatMapper**: Audio stream format conversion

### ✅ SSML System Improvements

#### **SSML Validator (`src/common/convert/input/ssml/ssml_validator.ts`)**
- **Provider-specific validation**: Separate schemas for Google, Microsoft, and Amazon
- **Comprehensive error reporting**: Detailed validation errors with line numbers and context
- **Tag existence validation**: Ensures only supported SSML elements are used
- **Attribute validation**: Validates SSML attributes against provider schemas

#### **Schema Separation (`src/common/convert/input/ssml/schemas/`)**
- **Google SSML Schema**: 13 supported elements with attribute validation
- **Microsoft SSML Schema**: 18 supported elements including advanced features
- **Amazon SSML Schema**: 12 core elements with Polly-specific attributes

#### **Enhanced SSML Processing**
- **Tag Preservation**: DOM processing improvements to maintain all SSML tags
- **Sanitization Pipeline**: Improved HTML entity handling and whitespace normalization
- **Splitter Enhancements**: Better text chunking while preserving SSML structure
- **Minimizer Updates**: Optimized SSML compression with tag preservation

### 🔧 Breaking Changes

#### **Universal Interface Migration**
```typescript
// OLD (v1/v2)
import { TtsGoogle, TtsMicrosoft, TtsAmazon } from 'cloud-text-to-speech';
TtsGoogle.init({ apiKey: 'key' });

// NEW (v3)
import { TtsUniversal, TtsProviders } from 'cloud-text-to-speech';
TtsUniversal.init({
  provider: TtsProviders.google,
  googleParams: { apiKey: 'key' },
  withLogs: true
});
```

#### **New Initialization Pattern**
- **Unified Parameters**: All provider credentials passed to single init method
- **Configuration Validation**: Comprehensive validation of all initialization parameters
- **Provider Selection**: Explicit provider mode selection (single, multi, or combine)

#### **Enhanced Error Handling**
- **Provider Context**: All errors include provider information and context
- **Structured Errors**: Hierarchical error types with specific error codes
- **Retry Logic**: Built-in retry indicators for transient failures

#### **SSML Processing Changes**
- **Validation Required**: All SSML content now validated against provider schemas
- **Schema Compliance**: SSML must comply with provider-specific element support
- **Enhanced Sanitization**: Stricter HTML entity and whitespace handling

### 🐛 Bug Fixes

#### **HttpProxy Mapping Issues**
- **Fixed optional chaining**: Resolved undefined access in ConvertParamsMapper and VoicesParamsMapper
- **Improved error handling**: Better handling of missing proxy configuration
- **Type safety**: Enhanced TypeScript types for proxy parameters

#### **SSML Tag Preservation**
- **DOM Processing**: Fixed tag loss during SSML splitting operations
- **Text Extraction**: Improved text content extraction while preserving structure
- **Whitespace Handling**: Corrected whitespace normalization in SSML content

#### **Text Sanitization**
- **Operation Order**: Fixed sanitization pipeline to handle HTML entities correctly
- **Unicode Support**: Improved handling of special characters and unicode content
- **Encoding Issues**: Resolved text encoding problems in multi-byte character sets

#### **Amazon Client Cleanup**
- **TypeScript Directives**: Removed unused @ts-expect-error directives
- **Code Quality**: Cleaned up deprecated TypeScript ignore statements
- **Type Safety**: Improved type definitions for Amazon-specific parameters

### 📚 Test Coverage Improvements

#### **Universal Convert Tests** (36 tests, >92% coverage)
- Text-to-speech parameter creation and validation
- SSML-to-speech parameter creation with audio configuration
- Audio format mapping and stream format conversion
- Error handling for invalid parameters and configurations

#### **Universal Voice Tests** (26 tests, >85% coverage)
- Voice parameter creation for single and multi-provider modes
- Voice filtering and locale-based selection
- HTTP proxy configuration with voice parameters
- Cross-provider voice compatibility testing

#### **System Integration Tests** (16 tests, >90% coverage)
- Multi-provider initialization and configuration
- Complete workflow validation from initialization to TTS conversion
- Provider switching and dynamic configuration changes
- Production readiness validation and error scenarios

#### **SSML Processing Tests** (62 tests, 100% coverage)
- SSML validation against all provider schemas
- Tag preservation during splitting and processing
- Sanitization and minimization operations
- Text extraction and content processing

### 🏗️ Architecture Improvements

#### **Provider Abstraction Layer**
- **Clean Separation**: Universal interface completely abstracted from provider implementations
- **Consistent API**: Same method signatures and return types across all providers
- **Error Normalization**: Unified error handling and reporting across providers

#### **Configuration Management**
- **ConfigurationManager**: Centralized configuration with environment variable support
- **Validation Pipeline**: Comprehensive parameter validation with detailed error messages
- **Type Safety**: Strong TypeScript typing for all configuration options

#### **Memory Optimization**
- **Efficient Processing**: Improved memory usage for large audio file processing
- **Streaming Support**: Better handling of audio streams and file operations
- **Resource Management**: Proper cleanup and resource management

#### **Error Hierarchy**
- **Structured Errors**: Hierarchical error types with specific error codes
- **Context Information**: Detailed error context including provider and operation
- **Retry Indicators**: Built-in indicators for retryable vs. permanent failures

### 🚀 Performance Improvements

#### **Test Execution**
- **Parallel Processing**: Improved test execution speed with parallel test runs
- **Mock Optimization**: Efficient mock data generation and management
- **Coverage Reporting**: Faster coverage calculation and reporting

#### **Parameter Mapping**
- **Cached Mappings**: Improved performance for repeated parameter conversions
- **Validation Caching**: Cached validation results for frequently used parameters
- **Memory Efficiency**: Optimized memory usage in parameter transformation

#### **SSML Processing**
- **DOM Optimization**: Faster DOM parsing and manipulation
- **Validation Speed**: Optimized SSML schema validation performance
- **Content Processing**: Improved text extraction and sanitization speed

### 📖 Documentation

#### **Comprehensive Documentation**
- **Migration Guide**: Step-by-step guide from v1/v2 to v3.0.0
- **API Documentation**: Complete documentation for universal interface
- **Advanced Examples**: Multi-provider usage, SSML processing, configuration examples
- **Implementation Plans**: Detailed Phase 1 and Phase 2 implementation documentation

#### **Code Examples**
- **Universal Interface**: Basic and advanced usage examples
- **Multi-Provider**: Provider switching and combined provider usage
- **SSML Processing**: SSML validation and processing examples
- **Error Handling**: Best practices for error handling and recovery

### 🔄 Migration from v1/v2

#### **Required Changes**
1. **Import Updates**: Change from provider-specific imports to universal imports
2. **Initialization**: Update to unified initialization pattern with all provider credentials
3. **Parameter Classes**: Use universal parameter classes instead of provider-specific ones
4. **Method Calls**: Update to use TtsUniversal methods instead of provider-specific methods

#### **Benefits of Migration**
- **Single API**: Manage multiple providers through one consistent interface
- **Enhanced SSML**: Better validation and tag preservation
- **Improved Error Handling**: More detailed error context and retry logic
- **Better Testing**: Comprehensive test coverage and validation
- **Future-Proof**: Easier to add new providers and features

### 📊 Technical Metrics

#### **Test Coverage**
- **Total Tests**: 78 universal tests with >89% statement coverage
- **Universal Convert**: 36 tests with >92% coverage
- **Universal Voices**: 26 tests with >85% coverage
- **System Integration**: 16 tests with >90% coverage
- **SSML Processing**: 62 tests with 100% coverage

#### **Code Quality**
- **TypeScript Strict Mode**: Full compliance with strict TypeScript configuration
- **ESLint Compliance**: Zero linting violations with updated ESLint rules
- **Build Success**: Clean builds with no errors or warnings
- **Dependency Updates**: All dependencies updated to latest stable versions

#### **Performance Metrics**
- **Test Execution**: <30 seconds for complete test suite
- **Memory Usage**: <200MB during testing and normal operations
- **Build Time**: Improved build performance with optimized TypeScript configuration

---

## 1.0.3

- Remove voice from allowed elements

## 1.0.2

- Add README.md badges

## 1.0.1

- Add Typescript types

## 1.0.0

- Add Google, Microsoft and Amazon TTS
