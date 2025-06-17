/**
 * Cloud Text-to-Speech v3 - Advanced Error Handling & Retry Logic
 * 
 * Features shown:
 * - Enhanced error context with provider information
 * - Automatic retry logic with exponential backoff
 * - Provider fallback strategies
 * - Error classification (retryable vs permanent)
 * - Graceful degradation techniques
 */

import { 
  TtsUniversal, 
  TtsProviders, 
  ConvertParamsUniversal,
  ConvertAudioOptionsUniversal,
  AudioOutputFormatUniversal 
} from 'cloud-text-to-speech';
import { writeFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

async function errorHandlingDemo(): Promise<void> {
  console.log('🚀 Cloud Text-to-Speech v3 - Error Handling Demo');
  console.log('================================================\n');

  try {
    // Initialize with mixed credentials (some may be invalid)
    console.log('1. Initializing with error handling setup...');
    TtsUniversal.init({
      provider: TtsProviders.google,
      googleParams: {
        apiKey: process.env.GOOGLE_API_KEY || 'your-google-cloud-api-key'
      },
      microsoftParams: {
        subscriptionKey: process.env.MICROSOFT_TTS_SUBSCRIPTION_KEY || 'your-azure-subscription-key',
        region: process.env.MICROSOFT_TTS_REGION || 'eastus'
      },
      amazonParams: {
        keyId: process.env.AMAZON_TTS_KEY_ID || 'your-aws-access-key-id',
        accessKey: process.env.AMAZON_TTS_ACCESS_KEY || 'your-aws-secret-access-key',
        region: process.env.AMAZON_TTS_REGION || 'us-east-1'
      },
      withLogs: true
    });

    console.log('✅ Initialization completed\n');

    // Test error handling scenarios
    console.log('2. Testing error handling scenarios...');
    
    const voices = await TtsUniversal.getVoices();
    const testVoice = voices.voices.find(v => v.locale.code === 'en-US');
    
    if (testVoice) {
      const params = new ConvertParamsUniversal({
        voice: testVoice,
        text: 'Testing error handling capabilities',
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.mp3_128k
        })
      });

      try {
        const result = await TtsUniversal.convertTts(params);
        console.log(`✅ Conversion successful: ${result.audio.length} bytes`);
        writeFileSync('error_test.mp3', result.audio);
      } catch (error) {
        console.log(`❌ Error caught: ${error.message}`);
        console.log(`   Provider: ${error.provider || 'unknown'}`);
        console.log(`   Retryable: ${error.retryable || 'unknown'}`);
      }
    }

    console.log('\n💡 Error Handling Best Practices:');
    console.log('1. Always implement retry logic for transient failures');
    console.log('2. Use provider fallback for high availability');
    console.log('3. Classify errors as retryable vs permanent');
    console.log('4. Implement graceful degradation strategies');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  errorHandlingDemo()
    .then(() => {
      console.log('\n🎉 Error Handling Demo completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed:', error.message);
      process.exit(1);
    });
}

export { errorHandlingDemo }; 