/**
 * Cloud Text-to-Speech v3 - Multi-Provider Configuration
 * 
 * This example demonstrates the advanced multi-provider capabilities
 * of the Universal TTS Interface, including provider switching and
 * voice comparison across different providers.
 * 
 * Features shown:
 * - Multi-provider initialization (Google, Microsoft, Amazon)
 * - Provider switching and comparison
 * - Voice discovery across all providers
 * - Cross-provider audio generation
 * - Performance comparison
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

async function multiProviderDemo(): Promise<void> {
  console.log('🚀 Cloud Text-to-Speech v3 - Multi-Provider Demo');
  console.log('================================================\n');

  try {
    // Step 1: Initialize with all providers
    console.log('1. Initializing TTS Universal with all providers...');
    TtsUniversal.init({
      provider: TtsProviders.combine,
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

    if (!TtsUniversal.initDone) {
      throw new Error('Failed to initialize TTS Universal');
    }
    console.log('✅ All providers initialized successfully\n');

    // Step 2: Discover voices from all providers
    console.log('2. Discovering voices from all providers...');
    const allVoices = await TtsUniversal.getVoices();
    
    // Group voices by provider
    const voicesByProvider = {
      google: allVoices.voices.filter(v => v.provider === TtsProviders.google),
      microsoft: allVoices.voices.filter(v => v.provider === TtsProviders.microsoft),
      amazon: allVoices.voices.filter(v => v.provider === TtsProviders.amazon)
    };

    console.log(`✅ Voice discovery completed:`);
    console.log(`   Google: ${voicesByProvider.google.length} voices`);
    console.log(`   Microsoft: ${voicesByProvider.microsoft.length} voices`);
    console.log(`   Amazon: ${voicesByProvider.amazon.length} voices`);
    console.log(`   Total: ${allVoices.voices.length} voices\n`);

    // Step 3: Select comparable voices from each provider
    console.log('3. Selecting comparable English voices...');
    
    const selectedVoices = {
      google: voicesByProvider.google.find(v => 
        v.locale.code === 'en-US' && v.gender === 'female'
      ),
      microsoft: voicesByProvider.microsoft.find(v => 
        v.locale.code === 'en-US' && v.gender === 'female'
      ),
      amazon: voicesByProvider.amazon.find(v => 
        v.locale.code === 'en-US' && v.gender === 'female'
      )
    };

    console.log('Selected voices:');
    Object.entries(selectedVoices).forEach(([provider, voice]) => {
      if (voice) {
        console.log(`   ${provider}: ${voice.name} (${voice.locale.code})`);
      } else {
        console.log(`   ${provider}: No suitable voice found`);
      }
    });
    console.log();

    // Step 4: Generate audio with each provider
    console.log('4. Generating audio with each provider...');
    const text = 'This is a comparison of different text-to-speech providers using the universal interface.';
    const audioResults = {};
    const performanceResults = {};

    for (const [providerName, voice] of Object.entries(selectedVoices)) {
      if (!voice) {
        console.log(`   ⏭️  Skipping ${providerName} (no suitable voice)`);
        continue;
      }

      console.log(`   🎤 Processing with ${providerName}...`);
      
      const convertParams = new ConvertParamsUniversal({
        voice: voice,
        text: text,
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.mp3_128k
        })
      });

      const startTime = Date.now();
      try {
        const audioResponse = await TtsUniversal.convertTts(convertParams);
        const endTime = Date.now();

        audioResults[providerName] = audioResponse;
        performanceResults[providerName] = {
          duration: endTime - startTime,
          audioSize: audioResponse.audio.length,
          voice: voice.name
        };

        console.log(`      ✅ ${providerName}: ${audioResponse.audio.length} bytes in ${endTime - startTime}ms`);
        
        // Save audio file
        const filename = `multi_provider_${providerName}.mp3`;
        writeFileSync(filename, audioResponse.audio);
        console.log(`      💾 Saved: ${filename}`);

      } catch (error) {
        console.log(`      ❌ ${providerName} failed: ${error.message}`);
        performanceResults[providerName] = { error: error.message };
      }
    }
    console.log();

    // Step 5: Provider switching demonstration
    console.log('5. Demonstrating dynamic provider switching...');
    
    const switchingText = 'Dynamic provider switching demonstration.';
    const providers = [TtsProviders.google, TtsProviders.microsoft, TtsProviders.amazon];
    
    for (const provider of providers) {
      console.log(`   🔄 Switching to ${provider}...`);
      TtsUniversal.setProvider(provider);
      
      // Get voices for current provider
      const providerVoices = await TtsUniversal.getVoices();
      const voice = providerVoices.voices.find(v => 
        v.locale.code === 'en-US' && v.gender === 'female'
      );
      
      if (voice) {
        const params = new ConvertParamsUniversal({
          voice: voice,
          text: `${switchingText} This is ${provider}.`,
          audioOptions: new ConvertAudioOptionsUniversal({
            audioFormat: AudioOutputFormatUniversal.mp3_128k
          })
        });
        
        try {
          const audio = await TtsUniversal.convertTts(params);
          console.log(`      ✅ Generated ${audio.audio.length} bytes with ${provider}`);
          
          const filename = `switching_${provider}.mp3`;
          writeFileSync(filename, audio.audio);
          console.log(`      💾 Saved: ${filename}`);
        } catch (error) {
          console.log(`      ❌ ${provider} switching failed: ${error.message}`);
        }
      } else {
        console.log(`      ⏭️  No suitable voice for ${provider}`);
      }
    }
    console.log();

    // Step 6: Voice filtering and analysis
    console.log('6. Analyzing voice capabilities across providers...');
    
    // Language support analysis
    const languages = {};
    allVoices.voices.forEach(voice => {
      const langCode = voice.locale.code.split('-')[0];
      if (!languages[langCode]) {
        languages[langCode] = { google: 0, microsoft: 0, amazon: 0 };
      }
      languages[langCode][voice.provider]++;
    });

    console.log('\nLanguage support comparison (top 5):');
    Object.entries(languages)
      .sort(([,a], [,b]) => (a.google + a.microsoft + a.amazon) - (b.google + b.microsoft + b.amazon))
      .slice(-5)
      .reverse()
      .forEach(([lang, counts]) => {
        const total = counts.google + counts.microsoft + counts.amazon;
        console.log(`   ${lang}: ${total} total (G:${counts.google}, M:${counts.microsoft}, A:${counts.amazon})`);
      });

    // Gender distribution
    const genderCounts = { google: {}, microsoft: {}, amazon: {} };
    allVoices.voices.forEach(voice => {
      if (!genderCounts[voice.provider][voice.gender]) {
        genderCounts[voice.provider][voice.gender] = 0;
      }
      genderCounts[voice.provider][voice.gender]++;
    });

    console.log('\nGender distribution:');
    Object.entries(genderCounts).forEach(([provider, genders]) => {
      const male = genders.male || 0;
      const female = genders.female || 0;
      const other = genders.neutral || genders.unknown || 0;
      console.log(`   ${provider}: ${male} male, ${female} female, ${other} other`);
    });

    // Step 7: Performance summary
    console.log('\n📊 Performance Summary:');
    console.log('======================');
    
    Object.entries(performanceResults).forEach(([provider, result]) => {
      if (result.error) {
        console.log(`${provider}:`);
        console.log(`   Status: ❌ Failed`);
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(`${provider}:`);
        console.log(`   Status: ✅ Success`);
        console.log(`   Voice: ${result.voice}`);
        console.log(`   Duration: ${result.duration}ms`);
        console.log(`   Audio size: ${result.audioSize} bytes`);
        console.log(`   Speed: ${(result.audioSize / result.duration * 1000).toFixed(0)} bytes/sec`);
      }
      console.log();
    });

    // Step 8: Best practices summary
    console.log('💡 Multi-Provider Best Practices:');
    console.log('================================');
    console.log('1. Initialize all providers at startup for best performance');
    console.log('2. Cache voice lists to reduce API calls');
    console.log('3. Implement fallback providers for reliability');
    console.log('4. Use provider-specific features when needed');
    console.log('5. Monitor usage and costs across providers');
    console.log('6. Test SSML compatibility across providers');

  } catch (error) {
    console.error('❌ Multi-provider demo failed:', error.message);
    
    if (error.provider) {
      console.error(`   Failed provider: ${error.provider}`);
    }
    if (error.retryable !== undefined) {
      console.error(`   Retryable: ${error.retryable}`);
    }
    
    process.exit(1);
  }
}

// Environment validation
function validateEnvironment(): void {
  const required = [
    'GOOGLE_API_KEY',
    'MICROSOFT_TTS_SUBSCRIPTION_KEY',
    'MICROSOFT_TTS_REGION',
    'AMAZON_TTS_KEY_ID',
    'AMAZON_TTS_ACCESS_KEY',
    'AMAZON_TTS_REGION'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Warning: Missing environment variables:');
    missing.forEach(key => console.warn(`   - ${key}`));
    console.warn('\nUsing placeholder values. Set real credentials for actual usage.\n');
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironment();
  multiProviderDemo()
    .then(() => {
      console.log('\n🎉 Multi-Provider Demo completed successfully!');
      console.log('Generated audio files saved to current directory.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed:', error.message);
      process.exit(1);
    });
}

export { multiProviderDemo }; 