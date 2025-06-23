# Cloud Text-To-Speech - Universal TTS Interface

[![Npm Version](https://img.shields.io/npm/v/cloud-text-to-speech.svg?logo=npm)](https://www.npmjs.com/package/cloud-text-to-speech)
[![Npm Downloads Total](https://img.shields.io/npm/dt/cloud-text-to-speech.svg?logo=npm)](https://www.npmjs.com/package/cloud-text-to-speech)
[![Npm Downloads Week](https://img.shields.io/npm/dw/cloud-text-to-speech.svg?logo=npm)](https://www.npmjs.com/package/cloud-text-to-speech)
[![GitHub License](https://img.shields.io/github/license/markokosticdev/cloud_text_to_speech_nodejs.svg?logo=github)](https://github.com/markokosticdev/cloud_text_to_speech_nodejs?tab=BSD-2-Clause-1-ov-file)
[![GitHub Sponsor](https://img.shields.io/badge/GitHub%20Sponsor-donate-yellow.svg?logo=github)](https://github.com/sponsors/markokosticdev)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-donate-yellow.svg?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/markokostich)

**Universal Text-to-Speech interface with multi-provider support** for seamless integration with Google Cloud, Microsoft Azure, and Amazon Polly APIs.

🎯 **NEW in v3.0.0**: Single API for all providers, enhanced SSML processing, comprehensive testing (78 tests, >89% coverage)

## 🚀 Quick Start

### Installation

```bash
npm install cloud-text-to-speech@3.0.0
```

### Basic Usage

```typescript
import { TtsUniversal, TtsProviders, ConvertParamsUniversal, VoiceUniversal, ConvertAudioOptionsUniversal, AudioOutputFormatUniversal } from 'cloud-text-to-speech';

// Initialize with all providers
TtsUniversal.init({
  provider: TtsProviders.combine, // Use all providers
  googleParams: { apiKey: 'your-google-api-key' },
  microsoftParams: { subscriptionKey: 'your-key', region: 'eastus' },
  amazonParams: { keyId: 'key-id', accessKey: 'secret', region: 'us-east-1' },
  withLogs: true
});

// Get voices from all providers
const voices = await TtsUniversal.getVoices();
console.log(`Found ${voices.voices.length} voices across all providers`);

// Convert text to speech
const voice = voices.voices.find(v => v.locale.code === 'en-US');
const convertParams = new ConvertParamsUniversal({
  voice: voice,
  text: 'Hello from Cloud Text-to-Speech!',
  audioOptions: new ConvertAudioOptionsUniversal({
    audioFormat: AudioOutputFormatUniversal.mp3_128k
  })
});

const audio = await TtsUniversal.convertTts(convertParams);
console.log(`Generated audio: ${audio.audio.length} bytes`);
```

## 🎯 Universal Interface Overview

### Multi-Provider Support
- **Google Cloud Text-to-Speech**: High-quality neural voices with WaveNet technology
- **Microsoft Azure Cognitive Services**: Advanced neural voices with SSML support
- **Amazon Polly**: Natural-sounding voices with real-time streaming

### Key Features
- **🎯 Single API**: Unified interface for all providers
- **🔄 Provider Switching**: Dynamic provider selection at runtime
- **✅ SSML Validation**: Provider-specific schema validation
- **🔍 Voice Discovery**: Cross-provider voice search and filtering
- **⚡ Enhanced Performance**: Optimized parameter mapping and caching
- **🛡️ Error Handling**: Comprehensive error context with retry indicators
- **📊 Testing**: 78 tests with >89% statement coverage

## 📖 Usage Examples

### 1. Single Provider Configuration

```typescript
import { TtsUniversal, TtsProviders } from 'cloud-text-to-speech';

// Initialize with Google only
TtsUniversal.init({
  provider: TtsProviders.google,
  googleParams: {
    apiKey: process.env.GOOGLE_API_KEY // Use environment variables
  },
  withLogs: false
});

// Use Google TTS
const voices = await TtsUniversal.getVoices();
const googleVoice = voices.voices[0]; // First Google voice
```

### 2. Multi-Provider Voice Discovery

```typescript
// Initialize with all providers
TtsUniversal.init({
  provider: TtsProviders.combine,
  googleParams: { apiKey: 'google-key' },
  microsoftParams: { subscriptionKey: 'ms-key', region: 'eastus' },
  amazonParams: { keyId: 'aws-key', accessKey: 'aws-secret', region: 'us-east-1' }
});

const allVoices = await TtsUniversal.getVoices();

// Filter voices by provider
const googleVoices = allVoices.voices.filter(v => v.provider === TtsProviders.google);
const microsoftVoices = allVoices.voices.filter(v => v.provider === TtsProviders.microsoft);
const amazonVoices = allVoices.voices.filter(v => v.provider === TtsProviders.amazon);

console.log(`Google: ${googleVoices.length}, Microsoft: ${microsoftVoices.length}, Amazon: ${amazonVoices.length}`);

// Filter by locale and gender
const femaleEnglishVoices = allVoices.voices.filter(v => 
  v.locale.code.startsWith('en-') && v.gender === 'female'
);
```

### 3. Advanced SSML Processing

```typescript
import { ConvertParamsUniversal, VoiceUniversal } from 'cloud-text-to-speech';

// SSML content with provider-specific validation
const ssmlContent = `
<speak>
  Welcome to <emphasis level="strong">Cloud Text-to-Speech v3</emphasis>!
  <break time="1s"/>
  This is a <prosody rate="slow" pitch="low">comprehensive TTS solution</prosody>
  with support for multiple providers.
</speak>`;

// Create voice with specific provider
const googleVoice = new VoiceUniversal({
  provider: TtsProviders.google,
  code: 'en-US-Wavenet-A',
  name: 'en-US-Wavenet-A',
  locale: 'en-US',
  gender: 'female'
});

const ssmlParams = new ConvertParamsUniversal({
  voice: googleVoice,
  ssml: ssmlContent, // Automatically validated against Google SSML schema
  audioOptions: new ConvertAudioOptionsUniversal({
    audioFormat: AudioOutputFormatUniversal.mp3_128k
  })
});

const audio = await TtsUniversal.convertTts(ssmlParams);
```

### 4. Provider Switching and Comparison

```typescript
// Initialize with multiple providers
TtsUniversal.init({
  provider: TtsProviders.combine,
  // ... provider credentials
});

const text = 'Compare voices across providers';

// Create voices for each provider
const voices = {
  google: new VoiceUniversal({
    provider: TtsProviders.google,
    code: 'en-US-Wavenet-A',
    locale: 'en-US'
  }),
  microsoft: new VoiceUniversal({
    provider: TtsProviders.microsoft,
    code: 'en-US-JennyNeural',
    locale: 'en-US'
  }),
  amazon: new VoiceUniversal({
    provider: TtsProviders.amazon,
    code: 'Joanna',
    locale: 'en-US'
  })
};

// Generate audio with each provider
const audioResults = {};
for (const [provider, voice] of Object.entries(voices)) {
  const params = new ConvertParamsUniversal({
    voice: voice,
    text: text,
    audioOptions: new ConvertAudioOptionsUniversal({
      audioFormat: AudioOutputFormatUniversal.mp3_128k
    })
  });
  
  audioResults[provider] = await TtsUniversal.convertTts(params);
  console.log(`${provider}: ${audioResults[provider].audio.length} bytes`);
}
```

### 5. Error Handling and Retry Logic

```typescript
import { TtsUniversal } from 'cloud-text-to-speech';

async function robustTtsConversion(params) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await TtsUniversal.convertTts(params);
      return result;
    } catch (error) {
      console.error(`TTS Error (attempt ${attempt + 1}):`, {
        message: error.message,
        provider: error.provider,
        retryable: error.retryable
      });
      
      if (!error.retryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
}
```

### 6. Environment Configuration

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
// Use environment variables for security
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

## 📚 Provider-Specific Features

### Google Cloud Text-to-Speech
- **WaveNet Voices**: High-quality neural network voices
- **SSML Support**: 13 supported elements including `speak`, `break`, `emphasis`, `prosody`
- **Audio Formats**: MP3, WAV, OGG, Linear PCM with various bitrates
- **Voice Effects**: Pitch and rate control

### Microsoft Azure Cognitive Services  
- **Neural Voices**: Premium quality with natural intonation
- **SSML Support**: 18 supported elements including `voice`, `lang`, `phoneme`
- **Voice Styles**: Emotional and speaking styles for select voices
- **Custom Voices**: Support for custom voice models

### Amazon Polly
- **Neural Voices**: Improved naturalness and expressiveness
- **SSML Support**: 12 core elements plus Amazon-specific effects
- **Voice Effects**: Whispering, news reading, conversational styles
- **Streaming**: Real-time audio streaming capability

## 🔧 Advanced Configuration

### Configuration File

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

### HTTP Proxy Support

```typescript
const convertParams = new ConvertParamsUniversal({
  voice: voice,
  text: 'Hello with proxy',
  audioOptions: new ConvertAudioOptionsUniversal({
    audioFormat: AudioOutputFormatUniversal.mp3_128k
  }),
  httpProxy: {
    host: 'proxy.company.com',
    port: 8080,
    username: 'user',
    password: 'pass'
  }
});
```

### Voice Filtering and Selection

```typescript
// Get all voices and filter
const allVoices = await TtsUniversal.getVoices();

// Filter by multiple criteria
const filteredVoices = allVoices.voices.filter(voice => 
  voice.locale.code.startsWith('en-') &&          // English languages
  voice.gender === 'female' &&                    // Female voices
  voice.provider === TtsProviders.google &&       // Google provider
  voice.name.includes('Neural')                    // Neural voices only
);

// Sort by locale
const sortedVoices = filteredVoices.sort((a, b) => 
  a.locale.code.localeCompare(b.locale.code)
);
```

## 🔄 Migration from v1/v2

### Quick Migration

```typescript
// OLD (v1/v2)
import { TtsGoogle } from 'cloud-text-to-speech';
TtsGoogle.init({ apiKey: 'key' });
const audio = await TtsGoogle.convertTts(params);

// NEW (v3)
import { TtsUniversal, TtsProviders } from 'cloud-text-to-speech';
TtsUniversal.init({ 
  provider: TtsProviders.google, 
  googleParams: { apiKey: 'key' } 
});
const audio = await TtsUniversal.convertTts(universalParams);
```

For detailed migration instructions, see [MIGRATION_v3.md](./MIGRATION_v3.md).

## 📊 Audio Formats

### Universal Audio Formats
```typescript
// Available formats that work across all providers
AudioOutputFormatUniversal.mp3_64k
AudioOutputFormatUniversal.mp3_128k
AudioOutputFormatUniversal.mp3_192k
AudioOutputFormatUniversal.wav_16k
AudioOutputFormatUniversal.wav_22k
AudioOutputFormatUniversal.wav_24k
AudioOutputFormatUniversal.ogg_opus_48k
AudioOutputFormatUniversal.linear_pcm_16k
AudioOutputFormatUniversal.linear_pcm_24k
```

### Working with Audio Data

```typescript
// Audio is returned as Uint8Array
const audio = await TtsUniversal.convertTts(params);
const audioBytes = audio.audio; // Uint8Array

// Save to file (Node.js)
import { writeFileSync } from 'fs';
writeFileSync('output.mp3', audioBytes);

// Convert to Base64 for web
const base64Audio = Buffer.from(audioBytes).toString('base64');
const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

// Play in browser
const audioElement = new Audio(audioDataUrl);
audioElement.play();
```

## 🛠️ Development and Testing

### Running Tests

```bash
# Run all tests (78 tests)
npm test

# Run with coverage report
npm run test:coverage

# Run specific test suites
npm test -- --testNamePattern="Universal"
npm test -- --testNamePattern="SSML"
```

### Build and Lint

```bash
# Build the project
npm run build

# Run linting
npm run lint

# Format code
npm run prettier
```

## 🚨 Important Notes

### Security Best Practices
- **Never expose API keys** in client-side code
- **Use environment variables** for credentials in production
- **Implement request signing** for enhanced security
- **Monitor API usage** to detect unusual activity

### SSML Guidelines
- **Provider Validation**: SSML is validated against provider-specific schemas
- **Tag Support**: Each provider supports different SSML elements
- **Fallback Content**: Always provide plain text as fallback
- **Testing**: Test SSML content with your target providers

### Performance Optimization
- **Voice Caching**: Cache voice lists to reduce API calls
- **Batch Processing**: Process multiple texts efficiently
- **Error Handling**: Implement proper retry logic for transient failures
- **Memory Management**: Process large texts in chunks

## 📞 Support and Resources

### Documentation
- **[CHANGELOG.md](./CHANGELOG.md)**: Complete list of changes in v3.0.0
- **[MIGRATION_v3.md](./MIGRATION_v3.md)**: Detailed migration guide from v1/v2
- **[Examples](./examples/)**: Advanced examples and use cases

### Community and Support
- **[GitHub Issues](https://github.com/markokosticdev/cloud_text_to_speech_nodejs/issues)**: Bug reports and questions
- **[Feature Requests](https://cloud-text-to-speech.featureupvote.com)**: Vote for new features
- **[GitHub Discussions](https://github.com/markokosticdev/cloud_text_to_speech_nodejs/discussions)**: Community support

### Contributing
We welcome contributions! Please see our contributing guidelines and:
- Submit bug reports and feature requests
- Contribute code improvements and new features
- Help improve documentation and examples
- Share your use cases and feedback

---

## 📄 License

This project is licensed under the [BSD 2-Clause License](./LICENSE).

## 💝 Support the Project

If you find this project helpful, please consider:
- ⭐ **Star the repository** on GitHub
- 🐛 **Report bugs** and suggest improvements
- 💰 **Sponsor the project** via [GitHub Sponsors](https://github.com/sponsors/markokosticdev)
- ☕ **Buy me a coffee** via [Buy Me a Coffee](https://www.buymeacoffee.com/markokostich)

---

**Cloud Text-to-Speech v3.0.0** - Universal interface for professional text-to-speech applications 🚀
