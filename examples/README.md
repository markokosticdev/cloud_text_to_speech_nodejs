# Cloud Text-to-Speech Examples

This directory contains comprehensive examples for the **Cloud Text-to-Speech Universal Interface**. These examples demonstrate all the features and capabilities of the library across different providers (Google Cloud, Microsoft Azure, Amazon Polly).

## 📋 Requirements

### System Requirements
- **Node.js**: >= 20.9 < 21
- **npm**: >= 8.0.0
- **Operating System**: Windows, macOS, or Linux

### API Provider Accounts

You'll need at least one of the following provider accounts:

#### 🔵 Google Cloud Text-to-Speech
- **Required**: Google Cloud Project with Text-to-Speech API enabled
- **Cost**: Pay-per-use (first 1M characters free per month)
- **Setup Guide**: [Google Cloud TTS Setup](https://cloud.google.com/text-to-speech/docs/before-you-begin)
- **Required Credentials**: API Key or Service Account

#### 🔵 Microsoft Azure Cognitive Services
- **Required**: Azure Cognitive Services Speech resource
- **Cost**: Free tier available (500k characters), then pay-per-use
- **Setup Guide**: [Azure Speech Services Setup](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- **Required Credentials**: Subscription Key + Region

#### 🔵 Amazon Polly
- **Required**: AWS Account with Polly access
- **Cost**: Pay-per-use (first 5M characters free for 12 months)
- **Setup Guide**: [Amazon Polly Setup](https://docs.aws.amazon.com/polly/latest/dg/setting-up.html)
- **Required Credentials**: Access Key ID + Secret Access Key + Region

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From the examples directory
cd examples
npm install
```

### 2. Configure Environment

```bash
# Copy the environment template
cp .env-example .env

# Edit .env with your actual API credentials
nano .env  # or your preferred editor
```

### 3. Validate Configuration

```bash
# Check if all required environment variables are set
npm run validate-env
```

### 4. Run Your First Example

```bash
# Run the getting started example (recommended for first-time users)
npm run demo

# Or run all universal examples
npm run demo:all
```

## 📁 Directory Structure

```
examples/
├── package.json              # Examples project configuration
├── .env-example              # Environment template
├── README.md                 # This file
├── REQUIREMENTS.md           # Detailed setup requirements
│
└── src/                      # 📁 All example source code
    ├── basic/                # 🟢 Basic Provider Examples
    │   ├── amazon.ts         # Simple Amazon Polly usage
    │   ├── google.ts         # Simple Google Cloud TTS usage
    │   └── microsoft.ts      # Simple Microsoft Azure TTS usage
    │
    ├── universal/            # 🌟 Universal Interface Examples
    │   ├── getting-started.ts    # Quick start guide
    │   ├── single-provider.ts    # Single provider usage
    │   ├── combined-providers.ts # Multiple providers combination
    │   ├── multi-provider.ts     # Provider comparison & switching
    │   ├── ssml-processing.ts    # SSML validation & processing
    │   └── error-handling.ts     # Error handling & retry logic
    │
    └── advanced/             # 🔧 Advanced Configuration Examples
        ├── amazon-detailed.ts    # Amazon with all options
        ├── google-detailed.ts    # Google with all options
        ├── microsoft-detailed.ts # Microsoft with all options
        ├── universal-single-detailed.ts    # Advanced single provider
        ├── universal-combined-detailed.ts  # Advanced combined providers
        └── universal-enhanced-features.ts  # 🆕 Enhanced v3 features showcase
```

## 🎯 Available Examples

### 🟢 Basic Provider Examples

Perfect for getting started with individual providers:

```bash
npm run basic:amazon          # Amazon Polly basic usage
npm run basic:google          # Google Cloud TTS basic usage
npm run basic:microsoft       # Microsoft Azure TTS basic usage
npm run basic:all            # Run all basic examples
```

**Features:**
- Simple initialization
- Basic text-to-speech conversion
- Audio file generation
- Error handling basics

### 🌟 Universal Interface Examples (Recommended)

Showcase the power of the universal interface:

#### 📚 Getting Started
```bash
npm run universal:start
```
- Single provider initialization
- Voice discovery and selection
- Basic text-to-speech conversion
- Audio format configuration

#### 🔄 Multi-Provider Demo
```bash
npm run universal:multi
```
- Initialize all providers simultaneously
- Compare voices across providers
- Dynamic provider switching
- Performance benchmarking
- Voice capability analysis

#### 📝 SSML Processing
```bash
npm run universal:ssml
```
- Provider-specific SSML validation
- Advanced SSML elements demonstration
- Cross-provider compatibility testing
- SSML error handling
- Schema validation examples

#### ⚠️ Error Handling & Retry Logic
```bash
npm run universal:errors
```
- Comprehensive error handling patterns
- Automatic retry with exponential backoff
- Provider fallback strategies
- Error classification (retryable vs permanent)
- Graceful degradation techniques

#### 🎛️ Provider Management
```bash
npm run universal:single      # Single provider with switching
npm run universal:combined    # Multiple provider combination
npm run universal:all         # Run all universal examples
```

### 🔧 Advanced Configuration Examples

For power users who need full control:

```bash
npm run advanced:amazon       # Amazon with all configuration options
npm run advanced:google       # Google with all configuration options
npm run advanced:microsoft    # Microsoft with all configuration options
npm run advanced:universal-single    # Advanced single provider configuration
npm run advanced:universal-combined  # Advanced combined providers setup
npm run advanced:enhanced-features   # 🆕 Enhanced v3 features demonstration
npm run advanced:all                 # Run all provider-specific advanced examples
```

**Features:**
- Complete configuration options
- HTTP proxy settings
- Custom voice name mapping
- Advanced SSML processing
- Performance optimization
- Detailed logging and monitoring

## 🔧 Available Scripts

### Quick Demos
```bash
npm run demo                 # Quick demo (getting started)
npm run demo:all            # Run all universal examples
npm run demo:basic          # Run all basic examples
npm run demo:advanced       # Run all advanced examples
```

### Development
```bash
npm run setup               # Install dependencies and setup env
npm run validate-env        # Validate environment configuration
npm run build               # Build the main library
npm run build:examples      # Compile examples (optional)
npm run clean               # Remove generated audio files
npm run clean:all           # Remove all generated files
```

### Example Categories
```bash
# Basic examples
npm run basic:amazon        # Amazon Polly
npm run basic:google        # Google Cloud TTS
npm run basic:microsoft     # Microsoft Azure TTS
npm run basic:all          # All basic examples

# Universal examples
npm run universal:start     # Getting started
npm run universal:multi     # Multi-provider comparison
npm run universal:ssml      # SSML processing
npm run universal:errors    # Error handling
npm run universal:all       # All universal examples

# Advanced examples
npm run advanced:amazon     # Amazon detailed
npm run advanced:google     # Google detailed
npm run advanced:microsoft  # Microsoft detailed
npm run advanced:all        # All advanced examples
```

## 🔐 Environment Configuration

### Required Variables

For **Google Cloud Text-to-Speech**:
```bash
GOOGLE_API_KEY=your-google-cloud-api-key
```

For **Microsoft Azure Cognitive Services**:
```bash
MICROSOFT_TTS_SUBSCRIPTION_KEY=your-azure-subscription-key
MICROSOFT_TTS_REGION=eastus  # Your Azure region
```

For **Amazon Polly**:
```bash
AMAZON_TTS_KEY_ID=your-aws-access-key-id
AMAZON_TTS_ACCESS_KEY=your-aws-secret-access-key
AMAZON_TTS_REGION=us-east-1  # Your AWS region
```

### Optional Variables

See `.env-example` for the complete list of optional configuration variables including:
- Advanced provider settings
- Network proxy configuration
- Logging and monitoring options
- Performance tuning parameters

## 📊 Output Files

Examples generate audio files in MP3 format:

### Generated Audio Files
- `src/basic/amazon_output.mp3` - Basic Amazon example
- `src/basic/google_output.mp3` - Basic Google example
- `src/universal/getting_started_output.mp3` - Getting started output
- `src/universal/multi_provider_*.mp3` - Multi-provider comparison files
- `src/universal/ssml_*.mp3` - SSML processing examples
- `src/advanced/detailed_*.mp3` - Advanced example outputs

### Generated Audio Cleanup
```bash
npm run clean  # Remove all generated audio files
```

## 💡 Learning Path

### 1. **Start Here** - Basic Examples
Begin with basic provider examples to understand individual TTS services:
```bash
npm run basic:google    # Start with Google (most straightforward)
npm run basic:amazon    # Try Amazon Polly
npm run basic:microsoft # Try Microsoft Azure
```

### 2. **Universal Interface** - Recommended Approach
Learn the universal interface for production applications:
```bash
npm run universal:start  # Getting started
npm run universal:multi  # Compare providers
npm run universal:ssml   # SSML processing
npm run universal:errors # Error handling
```

### 3. **Advanced Configuration** - Production Ready
Explore advanced configurations for production deployments:
```bash
npm run advanced:amazon  # Advanced Amazon setup
npm run advanced:universal-combined  # Production-ready universal setup
```

## 🆕 Enhanced v3 Features

The `universal-enhanced-features.ts` example demonstrates the advanced capabilities introduced in v3.0.0:

### 🛡️ Enhanced Error Handling
- **Standardized Error Types**: Consistent error hierarchy across all providers
- **Detailed Error Context**: Rich error information with provider details and retry suggestions
- **User-Friendly Messages**: Localized error messages for better user experience

### 🔄 Intelligent Retry Logic
- **Exponential Backoff**: Smart delay calculation with jitter to prevent thundering herd
- **Circuit Breaker Pattern**: Automatic failure detection to prevent cascading failures
- **Configurable Strategies**: Multiple retry configurations for different scenarios

### 🚦 Advanced Rate Limiting
- **Multiple Algorithms**: Token bucket and sliding window rate limiting
- **Provider-Specific Limits**: Pre-configured limits for Google, Microsoft, and Amazon
- **Burst Handling**: Intelligent handling of traffic spikes

### 📦 Sophisticated Batch Processing
- **Concurrency Control**: Configurable parallel processing with semaphore control
- **Progress Monitoring**: Real-time progress tracking and completion callbacks
- **Automatic Retry**: Individual item retry with comprehensive error handling
- **Chunked Processing**: Process large batches in smaller chunks with delays

Run the enhanced features demo:
```bash
npm run advanced:enhanced-features
```

## 🎯 Learning Path

## 🐛 Troubleshooting

### Common Issues

#### 1. Missing API Keys
```bash
Error: Missing environment variables: GOOGLE_API_KEY
```
**Solution**: Copy `.env-example` to `.env` and configure your API credentials.

#### 2. Invalid Credentials
```bash
Error: 401 Unauthorized
```
**Solution**: Verify your API keys are correct and have the necessary permissions.

#### 3. Network/Proxy Issues
```bash
Error: ECONNREFUSED
```
**Solution**: Configure proxy settings in `.env` if behind a corporate firewall.

#### 4. Node.js Version Issues
```bash
Error: Unsupported Node.js version
```
**Solution**: Use Node.js version 20.9 or higher (but less than 21).

### Debug Mode

Enable detailed logging:
```bash
# Add to your .env file
NODE_ENV=development
TTS_DEBUG=true
LOG_LEVEL=debug
```

### Validate Environment
```bash
npm run validate-env
```

## 🎵 Supported Audio Formats

### Universal Interface Formats
- `mp3_128k` - MP3 128 kbps (recommended)
- `mp3_32k` - MP3 32 kbps (bandwidth-optimized)
- `wav` - Uncompressed WAV
- `ogg` - OGG Vorbis

### Provider-Specific Formats
Each provider supports additional formats. See the advanced examples for provider-specific audio format options.

## 📖 API Documentation

For complete API documentation, see:
- **Main Repository**: [Cloud Text-to-Speech NodeJS](https://github.com/markokosticdev/cloud_text_to_speech_nodejs)
- **Migration Guide**: `../MIGRATION_v3.md`
- **Changelog**: `../CHANGELOG.md`

## 💡 Best Practices

### 1. Development Workflow
1. Start with `npm run demo` to verify setup
2. Run `npm run basic:google` for single provider testing
3. Use `npm run universal:multi` for provider comparison
4. Test SSML with `npm run universal:ssml`

### 2. Production Deployment
- Use environment variables for credentials
- Implement proper error handling and retries
- Monitor API usage and costs across providers
- Cache voice lists to reduce API calls

### 3. Cost Optimization
- Use appropriate audio quality for your use case
- Implement caching for frequently used audio
- Monitor character usage across providers
- Consider provider-specific pricing models

## 🔗 Related Resources

- [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing)
- [Microsoft Azure Speech Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)
- [Amazon Polly Pricing](https://aws.amazon.com/polly/pricing/)
- [SSML Reference Guide](https://cloud.google.com/text-to-speech/docs/ssml)

## 🆘 Support

If you encounter issues:

1. **Check this README** for troubleshooting steps
2. **Validate environment** with `npm run validate-env`
3. **Review logs** with debug mode enabled
4. **Check API quotas** and billing in your provider dashboards
5. **Create an issue** in the main repository with detailed error information

---

**Happy voice synthesizing! 🎤✨** 