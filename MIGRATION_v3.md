# Migration Guide: v1/v2 → v3.0.0

## 🎯 Overview of Changes

Cloud Text-to-Speech v3.0.0 introduces a **Universal TTS Interface** that provides a single API for all supported providers (Google, Microsoft, Amazon). This major version includes breaking changes but significantly improves usability and maintainability.

### 🚨 Major Breaking Changes
1. **Universal Interface**: Single `TtsUniversal` class replaces provider-specific classes
2. **Initialization Pattern**: New unified initialization with all providers
3. **Parameter System**: New universal parameter classes
4. **SSML Processing**: Enhanced validation with provider-specific schemas
5. **Error Handling**: Improved error types with provider context

### ✅ Benefits of v3.0.0
- **Single API**: Manage multiple providers through one consistent interface
- **Enhanced SSML**: Better validation and tag preservation
- **Improved Error Handling**: More detailed error context and retry logic
- **Better Testing**: Comprehensive test coverage (78 tests, >89% coverage)
- **Future-Proof**: Easier to add new providers and features

---

## 📋 Step-by-Step Migration

### 1. Update Dependencies

```bash
# Update to v3.0.0
npm install cloud-text-to-speech@3.0.0

# Or using yarn
yarn add cloud-text-to-speech@3.0.0
```

### 2. Update Imports

#### OLD (v1/v2)
```typescript
import { TtsGoogle } from 'cloud-text-to-speech';
import { TtsMicrosoft } from 'cloud-text-to-speech';
import { TtsAmazon } from 'cloud-text-to-speech';
```

#### NEW (v3)
```typescript
import { 
  TtsUniversal, 
  TtsProviders,
  ConvertParamsUniversal,
  VoiceUniversal,
  ConvertAudioOptionsUniversal,
  AudioOutputFormatUniversal
} from 'cloud-text-to-speech';
```

### 3. Update Initialization

#### OLD (v1/v2)
```typescript
// Initialize each provider separately
TtsGoogle.init({
  apiKey: 'your-google-api-key'
});

TtsMicrosoft.init({
  subscriptionKey: 'your-microsoft-key',
  region: 'eastus'
});

TtsAmazon.init({
  keyId: 'your-access-key-id',
  accessKey: 'your-secret-access-key',
  region: 'us-east-1'
});
```

#### NEW (v3)
```typescript
// Single initialization with all providers
TtsUniversal.init({
  provider: TtsProviders.combine, // Use all providers
  googleParams: {
    apiKey: 'your-google-api-key'
  },
  microsoftParams: {
    subscriptionKey: 'your-microsoft-key',
    region: 'eastus'
  },
  amazonParams: {
    keyId: 'your-access-key-id',
    accessKey: 'your-secret-access-key',
    region: 'us-east-1'
  },
  withLogs: true // Optional: enable logging
});

// Or initialize with single provider
TtsUniversal.init({
  provider: TtsProviders.google,
  googleParams: {
    apiKey: 'your-google-api-key'
  },
  withLogs: false
});
```

### 4. Update Voice Retrieval

#### OLD (v1/v2)
```typescript
// Get voices from each provider separately
const googleVoices = await TtsGoogle.getVoices();
const microsoftVoices = await TtsMicrosoft.getVoices();
const amazonVoices = await TtsAmazon.getVoices();

console.log(`Google voices: ${googleVoices.voices.length}`);
console.log(`Microsoft voices: ${microsoftVoices.voices.length}`);
console.log(`Amazon voices: ${amazonVoices.voices.length}`);
```

#### NEW (v3)
```typescript
// Get voices from all providers (if using combine mode)
const allVoices = await TtsUniversal.getVoices();
console.log(`Total voices: ${allVoices.voices.length}`);

// Or get voices from specific provider
TtsUniversal.setProvider(TtsProviders.google);
const googleVoices = await TtsUniversal.getVoices();
console.log(`Google voices: ${googleVoices.voices.length}`);

// Filter voices by provider
const googleVoicesFiltered = allVoices.voices.filter(
  voice => voice.provider === TtsProviders.google
);
```

### 5. Update TTS Conversion

#### OLD (v1/v2)
```typescript
// Google TTS conversion
const googleParams = new ConvertParamsGoogle({
  text: 'Hello from Google',
  voice: googleVoice,
  audioOptions: new ConvertAudioOptionsGoogle({
    audioFormat: AudioOutputFormatGoogle.mp3
  })
});
const googleAudio = await TtsGoogle.convertTts(googleParams);

// Microsoft TTS conversion
const microsoftParams = new ConvertParamsMicrosoft({
  text: 'Hello from Microsoft',
  voice: microsoftVoice,
  audioOptions: new ConvertAudioOptionsMicrosoft({
    audioFormat: AudioOutputFormatMicrosoft.mp3
  })
});
const microsoftAudio = await TtsMicrosoft.convertTts(microsoftParams);
```

#### NEW (v3)
```typescript
// Universal TTS conversion
const voice = new VoiceUniversal({
  provider: TtsProviders.google,
  code: 'en-US-Wavenet-A',
  name: 'en-US-Wavenet-A',
  locale: 'en-US',
  gender: 'female'
});

const convertParams = new ConvertParamsUniversal({
  voice: voice,
  text: 'Hello from Universal Interface',
  audioOptions: new ConvertAudioOptionsUniversal({
    audioFormat: AudioOutputFormatUniversal.mp3_128k
  })
});

const audio = await TtsUniversal.convertTts(convertParams);

// Automatically uses the provider specified in the voice
console.log(`Audio size: ${audio.audio.length} bytes`);
```

### 6. Update SSML Processing

#### OLD (v1/v2)
```typescript
// Basic SSML (limited validation)
const ssml = '<speak>Hello <break time="1s"/> World</speak>';
const params = new ConvertParamsGoogle({
  ssml: ssml,
  voice: voice
});
```

#### NEW (v3)
```typescript
// Enhanced SSML with validation
const ssml = '<speak>Hello <break time="1s"/> World</speak>';

// SSML is automatically validated against provider schemas
const convertParams = new ConvertParamsUniversal({
  voice: voice, // Provider determines which SSML schema to use
  ssml: ssml,   // Validated against Google/Microsoft/Amazon schemas
  audioOptions: new ConvertAudioOptionsUniversal({
    audioFormat: AudioOutputFormatUniversal.mp3_128k
  })
});

const audio = await TtsUniversal.convertTts(convertParams);
```

### 7. Update Error Handling

#### OLD (v1/v2)
```typescript
try {
  const audio = await TtsGoogle.convertTts(params);
} catch (error) {
  console.error('TTS Error:', error.message);
  // Limited error context
}
```

#### NEW (v3)
```typescript
try {
  const audio = await TtsUniversal.convertTts(convertParams);
} catch (error) {
  console.error('TTS Error:', {
    message: error.message,
    provider: error.provider,     // Which provider failed
    context: error.context,       // Additional context
    retryable: error.retryable    // Can this be retried?
  });
  
  // Enhanced error handling with provider context
  if (error.retryable) {
    // Implement retry logic
    setTimeout(() => {
      TtsUniversal.convertTts(convertParams);
    }, 1000);
  }
}
```

---

## 🔧 Configuration Migration

### Environment Variables (New in v3)

```bash
# .env file
GOOGLE_TTS_API_KEY=your-google-api-key
MICROSOFT_TTS_SUBSCRIPTION_KEY=your-microsoft-key
MICROSOFT_TTS_REGION=eastus
AMAZON_TTS_KEY_ID=your-access-key-id
AMAZON_TTS_ACCESS_KEY=your-secret-access-key
AMAZON_TTS_REGION=us-east-1
```

```typescript
// Load configuration from environment variables
TtsUniversal.init({
  provider: TtsProviders.combine,
  googleParams: {
    apiKey: process.env.GOOGLE_TTS_API_KEY
  },
  microsoftParams: {
    subscriptionKey: process.env.MICROSOFT_TTS_SUBSCRIPTION_KEY,
    region: process.env.MICROSOFT_TTS_REGION
  },
  amazonParams: {
    keyId: process.env.AMAZON_TTS_KEY_ID,
    accessKey: process.env.AMAZON_TTS_ACCESS_KEY,
    region: process.env.AMAZON_TTS_REGION
  },
  withLogs: true
});
```

### Configuration File (New in v3)

```json
// tts-config.json
{
  "provider": "combine",
  "googleParams": {
    "apiKey": "your-google-api-key"
  },
  "microsoftParams": {
    "subscriptionKey": "your-microsoft-key",
    "region": "eastus"
  },
  "amazonParams": {
    "keyId": "your-access-key-id",
    "accessKey": "your-secret-access-key",
    "region": "us-east-1"
  },
  "withLogs": true
}
```

```typescript
import { ConfigurationManager } from 'cloud-text-to-speech';

// Load configuration from file
const config = ConfigurationManager.loadFromFile('./tts-config.json');
TtsUniversal.init(config);
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Provider Not Initialized
**Error**: `Error: Provider not initialized`

**Cause**: Trying to use a provider that wasn't included in initialization

**Solution**:
```typescript
// Ensure all required providers are initialized
TtsUniversal.init({
  provider: TtsProviders.combine, // or specific provider
  googleParams: { /* credentials */ },
  microsoftParams: { /* credentials */ },
  amazonParams: { /* credentials */ }
});

// Check if initialization was successful
if (TtsUniversal.initDone) {
  console.log('TTS Universal initialized successfully');
}
```

### Issue 2: Parameter Mapping Errors
**Error**: `TypeError: Cannot read property 'xyz' of undefined`

**Cause**: Using old parameter classes instead of universal ones

**Solution**:
```typescript
// OLD (will cause errors)
const params = new ConvertParamsGoogle({...});

// NEW (correct)
const params = new ConvertParamsUniversal({
  voice: new VoiceUniversal({
    provider: TtsProviders.google,
    // ... other properties
  }),
  // ... other parameters
});
```

### Issue 3: SSML Validation Errors
**Error**: `SSML validation failed: Unsupported element 'xyz'`

**Cause**: SSML content includes elements not supported by the target provider

**Solution**:
```typescript
// Check provider-specific SSML support
// Google supports: speak, break, emphasis, prosody, say-as, etc.
// Microsoft supports: speak, break, emphasis, prosody, voice, etc.
// Amazon supports: speak, break, emphasis, prosody, amazon:effect, etc.

// Use provider-appropriate SSML
const googleSSML = '<speak>Hello <break time="1s"/> World</speak>';
const microsoftSSML = '<speak><voice name="Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)">Hello World</voice></speak>';
const amazonSSML = '<speak>Hello <amazon:effect name="whispered">World</amazon:effect></speak>';
```

### Issue 4: Voice Code Compatibility
**Error**: Voice not found or invalid voice code

**Cause**: Voice codes are provider-specific

**Solution**:
```typescript
// Use VoiceUniversal with correct provider and codes
const googleVoice = new VoiceUniversal({
  provider: TtsProviders.google,
  code: 'en-US-Wavenet-A',        // Google voice code
  name: 'en-US-Wavenet-A',
  locale: 'en-US',
  gender: 'female'
});

const microsoftVoice = new VoiceUniversal({
  provider: TtsProviders.microsoft,
  code: 'en-US-JennyNeural',      // Microsoft voice code
  name: 'Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)',
  locale: 'en-US',
  gender: 'female'
});

const amazonVoice = new VoiceUniversal({
  provider: TtsProviders.amazon,
  code: 'Joanna',                 // Amazon voice code
  name: 'Joanna',
  locale: 'en-US',
  gender: 'female'
});
```

### Issue 5: Audio Format Compatibility
**Error**: Unsupported audio format

**Cause**: Using provider-specific audio formats

**Solution**:
```typescript
// Use universal audio formats
const audioOptions = new ConvertAudioOptionsUniversal({
  audioFormat: AudioOutputFormatUniversal.mp3_128k, // Universal format
  // Automatically mapped to provider-specific format
});

// Available universal formats:
// - mp3_64k, mp3_128k, mp3_192k
// - wav_16k, wav_22k, wav_24k
// - ogg_opus_48k
// - linear_pcm_16k, linear_pcm_24k
```

---

## 🚀 Advanced Migration Examples

### Multi-Provider Voice Comparison

```typescript
// v3 feature: Compare voices across providers
TtsUniversal.init({
  provider: TtsProviders.combine,
  // ... all provider credentials
});

const voices = await TtsUniversal.getVoices();

// Group voices by locale
const voicesByLocale = voices.voices.reduce((acc, voice) => {
  if (!acc[voice.locale]) acc[voice.locale] = [];
  acc[voice.locale].push(voice);
  return acc;
}, {});

console.log('Available providers for en-US:');
voicesByLocale['en-US'].forEach(voice => {
  console.log(`${voice.provider}: ${voice.name}`);
});
```

### Provider Switching

```typescript
// v3 feature: Dynamic provider switching
TtsUniversal.init({
  provider: TtsProviders.combine,
  // ... all provider credentials
});

// Convert using Google
TtsUniversal.setProvider(TtsProviders.google);
const googleAudio = await TtsUniversal.convertTts(paramsWithGoogleVoice);

// Switch to Microsoft
TtsUniversal.setProvider(TtsProviders.microsoft);
const microsoftAudio = await TtsUniversal.convertTts(paramsWithMicrosoftVoice);

// Switch to Amazon
TtsUniversal.setProvider(TtsProviders.amazon);
const amazonAudio = await TtsUniversal.convertTts(paramsWithAmazonVoice);
```

### Batch Processing with Multiple Providers

```typescript
// v3 feature: Efficient batch processing
const texts = [
  'Hello from Google',
  'Hello from Microsoft', 
  'Hello from Amazon'
];

const providers = [
  TtsProviders.google,
  TtsProviders.microsoft,
  TtsProviders.amazon
];

const results = await Promise.all(
  texts.map(async (text, index) => {
    const voice = new VoiceUniversal({
      provider: providers[index],
      // ... provider-specific voice configuration
    });
    
    const params = new ConvertParamsUniversal({
      voice: voice,
      text: text,
      audioOptions: new ConvertAudioOptionsUniversal({
        audioFormat: AudioOutputFormatUniversal.mp3_128k
      })
    });
    
    return TtsUniversal.convertTts(params);
  })
);

console.log(`Generated ${results.length} audio files`);
```

---

## 📊 Migration Checklist

### Pre-Migration
- [ ] **Backup existing code** and configuration
- [ ] **Review breaking changes** in this guide
- [ ] **Test v3.0.0** in development environment
- [ ] **Update dependencies** to v3.0.0

### Code Updates
- [ ] **Update imports** to use universal classes
- [ ] **Replace initialization** with unified init pattern
- [ ] **Update parameter classes** to universal versions
- [ ] **Update error handling** to use enhanced error context
- [ ] **Test SSML validation** with provider-specific schemas

### Configuration
- [ ] **Consolidate credentials** into single init call
- [ ] **Set up environment variables** (optional)
- [ ] **Create configuration file** (optional)
- [ ] **Update logging configuration**

### Testing
- [ ] **Run existing tests** with new interface
- [ ] **Test all providers** individually and combined
- [ ] **Validate SSML processing** with new validation
- [ ] **Test error scenarios** and retry logic
- [ ] **Performance testing** with new interface

### Documentation
- [ ] **Update code documentation** with v3 examples
- [ ] **Update README** if using library in other projects
- [ ] **Document provider-specific configurations**
- [ ] **Update deployment scripts** if applicable

---

## 🎯 Migration Timeline

### Phase 1: Preparation (1-2 days)
- Review this migration guide completely
- Set up development environment with v3.0.0
- Create backup of existing implementation

### Phase 2: Core Migration (2-3 days)  
- Update imports and initialization
- Migrate parameter classes and method calls
- Update error handling

### Phase 3: Testing & Validation (1-2 days)
- Comprehensive testing of all functionality
- SSML validation testing
- Performance and error handling validation

### Phase 4: Deployment (1 day)
- Update production configuration
- Deploy with monitoring
- Validate production functionality

**Total Estimated Time: 5-8 days** depending on codebase complexity

---

## 📞 Support & Resources

### Documentation
- **README.md**: Updated with v3 examples and API documentation
- **CHANGELOG.md**: Complete list of changes and improvements
- **Advanced Examples**: See `examples/v3/` directory

### Community
- **GitHub Issues**: Report migration issues or questions
- **GitHub Discussions**: Community support and best practices

### Need Help?
If you encounter issues during migration:
1. Check this guide for common solutions
2. Review the updated examples in `examples/v3/`
3. Check GitHub Issues for similar problems
4. Create a new issue with detailed error information

---

**Migration Status**: Ready for v3.0.0 🚀  
**Last Updated**: 2024-12-19  
**Guide Version**: 1.0 