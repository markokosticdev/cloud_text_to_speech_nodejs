/**
 * Cloud Text-to-Speech v3 - Enhanced Universal Features Demo
 * 
 * This example demonstrates the advanced features of the Universal Interface:
 * - Enhanced error handling with standardized error types
 * - Retry logic with exponential backoff and circuit breaker
 * - Rate limiting for API call management
 * - Advanced batch processing with concurrency control
 */

import {
  TtsUniversal,
  TtsProviders,
  ConvertParamsUniversal,
  ConvertAudioOptionsUniversal,
  AudioOutputFormatUniversal,
  VoiceUniversal,
  
  // Enhanced Error Handling
  TtsError,
  TtsErrorCode,
  TtsAuthenticationError,
  TtsRateLimitError,
  TtsValidationError,
  
  // Retry Logic
  RetryHandler,
  RetryConfigurations,
  CircuitBreaker,
  
  // Rate Limiting
  RateLimiter,
  ProviderRateLimits,
  GlobalRateLimiter,
  
  // Batch Processing
  BatchProcessor,
  BatchUtils,
  BatchItem
} from 'cloud-text-to-speech';

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

async function enhancedFeaturesDemo(): Promise<void> {
  console.log('🚀 Cloud Text-to-Speech v3 - Enhanced Universal Features Demo');
  console.log('================================================================\n');

  try {
    // Initialize TTS with universal interface
    console.log('1. Initializing Universal TTS Interface...');
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

    // Get a test voice
    const voices = await TtsUniversal.getVoices();
    const testVoice = voices.voices.find(v => v.locale.code === 'en-US');
    
    if (!testVoice) {
      throw new TtsValidationError('No English voice available for testing');
    }

    console.log(`✅ Using voice: ${testVoice.name} (${testVoice.provider})\n`);

    // ==============================================
    // ENHANCED ERROR HANDLING DEMONSTRATION
    // ==============================================
    console.log('2. Enhanced Error Handling Demo');
    console.log('================================');
    
    await demonstrateErrorHandling(testVoice);

    // ==============================================
    // RETRY LOGIC DEMONSTRATION
    // ==============================================
    console.log('\n3. Retry Logic & Circuit Breaker Demo');
    console.log('====================================');
    
    await demonstrateRetryLogic(testVoice);

    // ==============================================
    // RATE LIMITING DEMONSTRATION
    // ==============================================
    console.log('\n4. Rate Limiting Demo');
    console.log('====================');
    
    await demonstrateRateLimiting(testVoice);

    // ==============================================
    // BATCH PROCESSING DEMONSTRATION
    // ==============================================
    console.log('\n5. Advanced Batch Processing Demo');
    console.log('=================================');
    
    await demonstrateBatchProcessing(testVoice);

    // ==============================================
    // SUMMARY
    // ==============================================
    console.log('\n🎉 Enhanced Features Demo Completed!');
    console.log('===================================');
    console.log('✅ Enhanced error handling with standardized error types');
    console.log('✅ Intelligent retry logic with exponential backoff');
    console.log('✅ Circuit breaker pattern for failure prevention');
    console.log('✅ Advanced rate limiting with multiple algorithms');
    console.log('✅ Sophisticated batch processing with concurrency control');
    console.log('✅ Comprehensive monitoring and reporting capabilities');
    
  } catch (error) {
    console.error('❌ Enhanced features demo failed:', error);
    
    if (error instanceof TtsError) {
      console.error(`   Error Code: ${error.code}`);
      console.error(`   Provider: ${error.provider || 'unknown'}`);
      console.error(`   Retryable: ${error.retryable}`);
      console.error(`   User Message: ${error.getUserMessage()}`);
    }
    
    process.exit(1);
  }
}

async function demonstrateErrorHandling(voice: VoiceUniversal): Promise<void> {
  console.log('📋 Testing standardized error handling...');
  
  try {
    // Test validation error
    try {
      new ConvertParamsUniversal({
        voice: voice,
        // Intentionally provide no text or SSML to trigger validation error
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.mp3_128k
        })
      });
    } catch (error) {
      console.log(`   ✅ Validation Error Caught: ${error.message}`);
    }

    // Test custom error handling
    const customError = new TtsRateLimitError(
      'Rate limit exceeded for demonstration',
      'google',
      5000, // 5 second retry after
      {
        httpStatus: 429,
        details: { maxRequests: 100, windowMs: 60000 }
      }
    );

    console.log(`   📊 Custom Error Example:`);
    console.log(`      Code: ${customError.code}`);
    console.log(`      Provider: ${customError.provider}`);
    console.log(`      Retryable: ${customError.retryable}`);
    console.log(`      Retry After: ${customError.retryAfter}ms`);
    console.log(`      User Message: ${customError.getUserMessage()}`);

  } catch (error) {
    console.log(`   ❌ Error handling test failed: ${error.message}`);
  }
}

async function demonstrateRetryLogic(voice: VoiceUniversal): Promise<void> {
  console.log('🔄 Testing retry logic and circuit breaker...');
  
  // Create retry handler with custom configuration
  const retryHandler = new RetryHandler({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    enableJitter: true,
    onRetry: (error, attempt, delay) => {
      console.log(`   🔄 Retry attempt ${attempt}: waiting ${delay}ms (${error.code})`);
    }
  });

  // Create circuit breaker
  const circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s timeout

  try {
    // Simulate a successful operation with retry handler
    const result = await retryHandler.execute(async () => {
      // This would normally be a real TTS call
      console.log('   ✅ Simulated successful operation');
      return 'success';
    }, 'demo_operation');

    console.log(`   📊 Operation result: ${result}`);
    console.log(`   🔧 Circuit breaker state: ${circuitBreaker.getState()}`);

  } catch (error) {
    console.log(`   ❌ Retry logic test failed: ${error.message}`);
  }

  // Test predefined retry configurations
  console.log('   📋 Available retry configurations:');
  console.log('      - Authentication: Conservative retry for auth operations');
  console.log('      - Standard: Standard retry for API calls');
  console.log('      - Aggressive: Aggressive retry for critical operations');
  console.log('      - Rate Limit: Specialized retry for rate limit scenarios');
}

async function demonstrateRateLimiting(voice: VoiceUniversal): Promise<void> {
  console.log('🚦 Testing rate limiting capabilities...');
  
  // Test with custom rate limiter
  const rateLimiter = new RateLimiter();
  
  try {
    // Check rate limit status
    const googleRateLimit = ProviderRateLimits.google.standard;
    const status = rateLimiter.getRateLimitStatus(googleRateLimit);
    
    console.log('   📊 Rate Limit Status:');
    console.log(`      Current Requests: ${status.currentRequests}/${status.maxRequests}`);
    console.log(`      Is Exceeded: ${status.isExceeded}`);
    console.log(`      Reset Time: ${status.resetTime}ms`);

    // Simulate rate-limited operations
    for (let i = 0; i < 3; i++) {
      try {
        await rateLimiter.checkRateLimit({
          maxRequests: 2,
          windowMs: 5000,
          provider: 'demo'
        });
        console.log(`   ✅ Request ${i + 1}: Allowed`);
      } catch (error) {
        if (error instanceof TtsRateLimitError) {
          console.log(`   ⏳ Request ${i + 1}: Rate limited (retry after ${error.retryAfter}ms)`);
        }
      }
    }

    console.log('   📋 Available provider rate limits:');
    console.log('      - Google: 100 req/min (standard), 50 req/min (conservative)');
    console.log('      - Microsoft: 20 req/sec, 1000 req/min');
    console.log('      - Amazon: 80 req/min (standard), 100 req/sec (burst)');

  } catch (error) {
    console.log(`   ❌ Rate limiting test failed: ${error.message}`);
  }
}

async function demonstrateBatchProcessing(voice: VoiceUniversal): Promise<void> {
  console.log('📦 Testing advanced batch processing...');
  
  // Create test data
  const texts = [
    'Hello, this is the first text to convert.',
    'This is the second piece of text for batch processing.',
    'Here we have the third text in our batch.',
    'The fourth text demonstrates concurrent processing.',
    'Finally, this is the fifth and last text in our batch.'
  ];

  // Create batch items
  const batchItems = BatchUtils.createBatchFromTexts(
    texts,
    {
      voice: voice,
      audioOptions: new ConvertAudioOptionsUniversal({
        audioFormat: AudioOutputFormatUniversal.mp3_64k
      })
    } as any, // Temporary fix for batch processing utility types
    'demo_batch'
  );

  console.log(`   📋 Created batch with ${batchItems.length} items`);

  // Create batch processor with advanced options
  const batchProcessor = new BatchProcessor({
    concurrency: 2,
    rateLimiting: {
      maxRequests: 3,
      windowMs: 10000,
      provider: 'batch_demo'
    },
    retryOptions: {
      maxRetries: 2,
      initialDelay: 1000
    },
    onProgress: (completed, total, currentItem) => {
      const percentage = ((completed / total) * 100).toFixed(1);
      console.log(`   📈 Progress: ${completed}/${total} (${percentage}%) - Processing: ${currentItem?.id}`);
    },
    onItemComplete: (result) => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.item.id}: ${result.success ? 'Success' : result.error?.message} (${result.processingTime}ms)`);
    }
  });

  try {
    // Process batch
    const batchResult = await batchProcessor.processBatch(batchItems);
    
    console.log('\n   📊 Batch Processing Results:');
    console.log(`      Total Items: ${batchResult.results.length}`);
    console.log(`      Successful: ${batchResult.successCount}`);
    console.log(`      Failed: ${batchResult.failureCount}`);
    console.log(`      Success Rate: ${(batchResult.successRate * 100).toFixed(1)}%`);
    console.log(`      Total Time: ${(batchResult.totalTime / 1000).toFixed(2)}s`);
    console.log(`      Average Time: ${(batchResult.totalTime / batchResult.results.length).toFixed(2)}ms per item`);

    // Save successful results
    if (batchResult.successCount > 0) {
      const outputDir = './enhanced_features_output';
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      await BatchUtils.saveBatchResults(batchResult.results, outputDir, 'enhanced_demo');
      console.log(`   💾 Saved ${batchResult.successCount} audio files to ${outputDir}/`);
    }

    // Generate and display report
    const report = BatchUtils.generateReport(batchResult);
    console.log('\n   📄 Detailed Report:');
    console.log(report.split('\n').map(line => `      ${line}`).join('\n'));

  } catch (error) {
    console.log(`   ❌ Batch processing test failed: ${error.message}`);
  }
}

// Run the demo
enhancedFeaturesDemo().catch(console.error); 