/**
 * Cloud Text-to-Speech v3 - SSML Processing with Validation
 * 
 * This example demonstrates the enhanced SSML processing capabilities
 * in v3, including provider-specific schema validation, tag preservation,
 * and advanced SSML features.
 * 
 * Features shown:
 * - Provider-specific SSML schema validation
 * - Advanced SSML elements and attributes
 * - SSML content sanitization and processing
 * - Error handling for invalid SSML
 * - Cross-provider SSML compatibility
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

async function ssmlProcessingDemo(): Promise<void> {
  console.log('🚀 Cloud Text-to-Speech v3 - SSML Processing Demo');
  console.log('=================================================\n');

  try {
    // Step 1: Initialize with all providers for SSML comparison
    console.log('1. Initializing TTS Universal for SSML processing...');
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
    console.log('✅ TTS Universal initialized for SSML processing\n');

    // Step 2: Define provider-specific SSML examples
    console.log('2. Preparing provider-specific SSML content...');
    
    const ssmlExamples = {
      google: {
        description: 'Google SSML with emphasis, breaks, and prosody',
        content: `
<speak>
  <par>
    <media>
      Welcome to <emphasis level="strong">Google Cloud Text-to-Speech</emphasis>!
      <break time="1s"/>
      
      This is a demonstration of <prosody rate="slow" pitch="low">advanced SSML features</prosody>
      available in the Google provider.
      
      <break time="500ms"/>
      
      We can control speech with different elements:
      <prosody rate="fast">Fast speech</prosody>,
      <prosody rate="slow">slow speech</prosody>,
      and <prosody pitch="high">high pitch</prosody>.
      
      <break time="1s"/>
      
      <say-as interpret-as="date" format="mdy">10/31/2024</say-as> is Halloween.
      The number <say-as interpret-as="cardinal">12345</say-as> is twelve thousand three hundred forty-five.
    </media>
  </par>
</speak>`.trim()
      },
      
      microsoft: {
        description: 'Microsoft SSML with voice selection and phonemes',
        content: `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)">
    Welcome to <emphasis>Microsoft Azure Cognitive Services</emphasis>!
    <break time="1s"/>
    
    This demonstrates <prosody rate="0.8" pitch="-10%">Microsoft-specific SSML features</prosody>
    with neural voice capabilities.
    
    <break time="500ms"/>
    
    <phoneme alphabet="ipa" ph="təˈmeɪtoʊ">tomato</phoneme> is pronounced differently than
    <phoneme alphabet="ipa" ph="təˈmɑːtoʊ">tomato</phoneme>.
    
    <break time="1s"/>
    
    We can also use <lang xml:lang="es-ES">¡Hola mundo!</lang> and return to English.
  </voice>
</speak>`.trim()
      },
      
      amazon: {
        description: 'Amazon SSML with effects and domain-specific voices',
        content: `
<speak>
  Welcome to <emphasis level="strong">Amazon Polly</emphasis>!
  <break time="1s"/>
  
  This is a demonstration of <prosody rate="slow" pitch="low">Amazon-specific SSML effects</prosody>
  and advanced voice features.
  
  <break time="500ms"/>
  
  <amazon:effect name="whispered">This text is whispered</amazon:effect>
  and this is normal speech again.
  
  <break time="1s"/>
  
  Amazon Polly also supports different domains like
  <prosody rate="1.2">news reading style</prosody>.
  
  <break time="500ms"/>
  
  The date <say-as interpret-as="date">20241031</say-as> is Halloween.
</speak>`.trim()
      }
    };

    // Display SSML content
    Object.entries(ssmlExamples).forEach(([provider, example]) => {
      console.log(`   ${provider}: ${example.description}`);
    });
    console.log();

    // Step 3: Process SSML with each provider
    console.log('3. Processing SSML with provider-specific validation...');
    
    const voices = await TtsUniversal.getVoices();
    const results = {};

    for (const [providerName, ssmlExample] of Object.entries(ssmlExamples)) {
      console.log(`\n   🎤 Processing ${providerName} SSML...`);
      
      // Find appropriate voice for provider
      const voice = voices.voices.find(v => 
        v.provider === TtsProviders[providerName] && 
        v.locale.code === 'en-US' && 
        v.gender === 'female'
      );

      if (!voice) {
        console.log(`      ⏭️  No suitable voice found for ${providerName}`);
        continue;
      }

      console.log(`      🎭 Using voice: ${voice.name}`);
      
      try {
        const convertParams = new ConvertParamsUniversal({
          voice: voice,
          ssml: ssmlExample.content, // SSML will be validated against provider schema
          audioOptions: new ConvertAudioOptionsUniversal({
            audioFormat: AudioOutputFormatUniversal.mp3_128k
          })
        });

        const startTime = Date.now();
        const audioResponse = await TtsUniversal.convertTts(convertParams);
        const endTime = Date.now();

        results[providerName] = {
          success: true,
          audioSize: audioResponse.audio.length,
          duration: endTime - startTime,
          voice: voice.name
        };

        console.log(`      ✅ SSML processed successfully`);
        console.log(`      📊 Audio: ${audioResponse.audio.length} bytes in ${endTime - startTime}ms`);
        
        // Save audio file
        const filename = `ssml_${providerName}.mp3`;
        writeFileSync(filename, audioResponse.audio);
        console.log(`      💾 Saved: ${filename}`);

      } catch (error) {
        results[providerName] = {
          success: false,
          error: error.message
        };
        console.log(`      ❌ SSML processing failed: ${error.message}`);
        
        // Show validation details if available
        if (error.validationErrors) {
          console.log(`      🔍 Validation errors:`);
          error.validationErrors.forEach(err => {
            console.log(`         - ${err}`);
          });
        }
      }
    }

    // Step 4: Cross-provider SSML compatibility test
    console.log('\n4. Testing cross-provider SSML compatibility...');
    
    const universalSSML = `
<speak>
  Welcome to <emphasis level="moderate">Universal SSML</emphasis>!
  <break time="1s"/>
  
  This SSML content is designed to work across
  <prosody rate="0.9">all supported providers</prosody>.
  
  <break time="500ms"/>
  
  It uses only common SSML elements that are
  supported by Google, Microsoft, and Amazon.
</speak>`.trim();

    console.log('   📝 Universal SSML content:');
    console.log('   ' + universalSSML.replace(/\n/g, '\n   '));
    console.log();

    const providers = [TtsProviders.google, TtsProviders.microsoft, TtsProviders.amazon];
    const compatibilityResults = {};

    for (const provider of providers) {
      console.log(`   🔄 Testing with ${provider}...`);
      
      const voice = voices.voices.find(v => 
        v.provider === provider && 
        v.locale.code === 'en-US'
      );

      if (!voice) {
        console.log(`      ⏭️  No voice available for ${provider}`);
        continue;
      }

      try {
        const params = new ConvertParamsUniversal({
          voice: voice,
          ssml: universalSSML,
          audioOptions: new ConvertAudioOptionsUniversal({
            audioFormat: AudioOutputFormatUniversal.mp3_128k
          })
        });

        const audio = await TtsUniversal.convertTts(params);
        compatibilityResults[provider] = {
          success: true,
          audioSize: audio.audio.length,
          voice: voice.name
        };

        console.log(`      ✅ Compatible - ${audio.audio.length} bytes`);
        
        const filename = `universal_ssml_${provider}.mp3`;
        writeFileSync(filename, audio.audio);
        console.log(`      💾 Saved: ${filename}`);

      } catch (error) {
        compatibilityResults[provider] = {
          success: false,
          error: error.message
        };
        console.log(`      ❌ Incompatible: ${error.message}`);
      }
    }

    // Step 5: SSML validation demonstration
    console.log('\n5. Demonstrating SSML validation features...');
    
    const invalidSSML = `
<speak>
  This SSML contains <invalid-tag>unsupported elements</invalid-tag>
  and <break time="invalid-duration"/> incorrect attributes.
  <prosody rate="999999999">Extreme values</prosody> should be caught.
</speak>`.trim();

    console.log('   🚫 Testing invalid SSML validation...');
    console.log('   ' + invalidSSML.replace(/\n/g, '\n   '));
    console.log();

    const testVoice = voices.voices.find(v => v.locale.code === 'en-US');
    if (testVoice) {
      try {
        const invalidParams = new ConvertParamsUniversal({
          voice: testVoice,
          ssml: invalidSSML,
          audioOptions: new ConvertAudioOptionsUniversal({
            audioFormat: AudioOutputFormatUniversal.mp3_128k
          })
        });

        await TtsUniversal.convertTts(invalidParams);
        console.log('   ⚠️  Invalid SSML was accepted (validation may be disabled)');

      } catch (error) {
        console.log('   ✅ Invalid SSML correctly rejected by validation');
        console.log(`      Error: ${error.message}`);
        
        if (error.validationErrors) {
          console.log('      Validation details:');
          error.validationErrors.forEach(err => {
            console.log(`         - ${err}`);
          });
        }
      }
    }

    // Step 6: SSML processing summary
    console.log('\n📊 SSML Processing Summary:');
    console.log('===========================');
    
    console.log('\nProvider-specific SSML results:');
    Object.entries(results).forEach(([provider, result]) => {
      if (result.success) {
        console.log(`✅ ${provider}:`);
        console.log(`   Voice: ${result.voice}`);
        console.log(`   Audio size: ${result.audioSize} bytes`);
        console.log(`   Processing time: ${result.duration}ms`);
      } else {
        console.log(`❌ ${provider}:`);
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\nCross-provider compatibility:');
    Object.entries(compatibilityResults).forEach(([provider, result]) => {
      if (result.success) {
        console.log(`✅ ${provider}: Compatible (${result.audioSize} bytes)`);
      } else {
        console.log(`❌ ${provider}: Incompatible - ${result.error}`);
      }
    });

    // Step 7: SSML best practices
    console.log('\n💡 SSML Best Practices for v3:');
    console.log('==============================');
    console.log('1. Use provider-specific SSML for advanced features');
    console.log('2. Test SSML content with target providers before production');
    console.log('3. Implement fallback text for SSML validation failures');
    console.log('4. Use universal SSML elements for cross-provider compatibility');
    console.log('5. Validate SSML schemas match your provider capabilities');
    console.log('6. Monitor SSML processing performance across providers');

  } catch (error) {
    console.error('❌ SSML processing demo failed:', error.message);
    
    if (error.provider) {
      console.error(`   Failed provider: ${error.provider}`);
    }
    if (error.ssmlErrors) {
      console.error('   SSML validation errors:');
      error.ssmlErrors.forEach(err => console.error(`      - ${err}`));
    }
    
    process.exit(1);
  }
}

// Environment validation
function validateEnvironment(): void {
  const required = [
    'GOOGLE_API_KEY',
    'MICROSOFT_TTS_SUBSCRIPTION_KEY', 
    'AMAZON_TTS_KEY_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Warning: Missing environment variables for SSML demo:');
    missing.forEach(key => console.warn(`   - ${key}`));
    console.warn('\nUsing placeholder values. Some providers may not work.\n');
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironment();
  ssmlProcessingDemo()
    .then(() => {
      console.log('\n🎉 SSML Processing Demo completed successfully!');
      console.log('Generated audio files demonstrate SSML capabilities across providers.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 SSML Demo failed:', error.message);
      process.exit(1);
    });
}

export { ssmlProcessingDemo }; 