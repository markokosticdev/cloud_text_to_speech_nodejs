/**
 * Cloud Text-to-Speech v3 - Basic Universal Interface Usage
 * 
 * This example demonstrates the basic usage of the Universal TTS Interface
 * with a single provider (Google Cloud Text-to-Speech).
 * 
 * Features shown:
 * - Single provider initialization
 * - Voice discovery and selection
 * - Basic text-to-speech conversion
 * - Audio format selection
 * - Error handling
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

async function basicUniversalUsage(): Promise<void> {
  console.log('🚀 Cloud Text-to-Speech v3 - Basic Universal Usage');
  console.log('================================================\n');

  try {
    // Step 1: Initialize TTS Universal with Google provider
    console.log('1. Initializing TTS Universal with Google provider...');
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

    // Verify initialization
    if (TtsUniversal.initDone) {
      console.log('✅ TTS Universal initialized successfully\n');
    } else {
      throw new Error('Failed to initialize TTS Universal');
    }

    // Step 2: Get available voices
    console.log('2. Discovering available voices...');
    const voicesResponse = await TtsUniversal.getVoices();
    const voices = voicesResponse.voices;
    
    console.log(`✅ Found ${voices.length} Google voices`);
    
    // Display first few voices
    console.log('\nSample voices:');
    voices.slice(0, 5).forEach((voice, index) => {
      console.log(`  ${index + 1}. ${voice.name} (${voice.locale.code}) - ${voice.gender}`);
    });

    // Step 3: Select an English voice
    console.log('\n3. Selecting an English voice...');
    const englishVoice = voices.find(voice => 
      voice.locale.code.startsWith('en-') && voice.gender === 'female'
    );

    if (!englishVoice) {
      throw new Error('No English female voice found');
    }

    console.log(`✅ Selected voice: ${englishVoice.name} (${englishVoice.locale.code})\n`);

    // Step 4: Prepare TTS conversion parameters
    console.log('4. Preparing TTS conversion...');
    const text = 'Hello! Welcome to Cloud Text-to-Speech version 3. This is a demonstration of the universal interface.';
    
    const convertParams = new ConvertParamsUniversal({
      voice: englishVoice,
      text: text,
      audioOptions: new ConvertAudioOptionsUniversal({
        audioFormat: AudioOutputFormatUniversal.mp3_128k
      })
    });

    console.log(`📝 Text to convert: "${text}"`);
    console.log(`🎤 Voice: ${englishVoice.name}`);
    console.log(`🎵 Audio format: MP3 128kbps\n`);

    // Step 5: Convert text to speech
    console.log('5. Converting text to speech...');
    const startTime = Date.now();
    const audioResponse = await TtsUniversal.convertTts(convertParams);
    const endTime = Date.now();

    console.log(`✅ TTS conversion completed in ${endTime - startTime}ms`);
    console.log(`🎵 Audio size: ${audioResponse.audio.length} bytes\n`);

    // Step 6: Save audio to file
    console.log('6. Saving audio to file...');
    const outputFilename = 'basic_usage_output.mp3';
    writeFileSync(outputFilename, audioResponse.audio);
    console.log(`✅ Audio saved to: ${outputFilename}\n`);

    // Step 7: Display summary
    console.log('📊 Summary:');
    console.log(`   Provider: ${TtsProviders.google}`);
    console.log(`   Voice: ${englishVoice.name}`);
    console.log(`   Text length: ${text.length} characters`);
    console.log(`   Audio size: ${audioResponse.audio.length} bytes`);
    console.log(`   Conversion time: ${endTime - startTime}ms`);
    console.log(`   Output file: ${outputFilename}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Enhanced error handling for v3
    if (error.provider) {
      console.error(`   Provider: ${error.provider}`);
    }
    if (error.retryable !== undefined) {
      console.error(`   Retryable: ${error.retryable}`);
    }
    if (error.context) {
      console.error(`   Context: ${JSON.stringify(error.context, null, 2)}`);
    }
    
    process.exit(1);
  }
}

// Environment check
function checkEnvironment(): void {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('⚠️  Warning: GOOGLE_API_KEY environment variable not set');
    console.warn('   Using placeholder value. Set your actual API key for real usage.');
    console.warn('   Example: export GOOGLE_API_KEY="your-actual-api-key"\n');
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  checkEnvironment();
  basicUniversalUsage()
    .then(() => {
      console.log('\n🎉 Basic Universal Usage example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Example failed:', error.message);
      process.exit(1);
    });
}

export { basicUniversalUsage }; 