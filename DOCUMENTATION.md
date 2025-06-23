# Documentation Guide for Cloud Text-to-Speech

This guide explains how to use the JSDoc/TypeDoc setup for generating and maintaining documentation.

## 🚀 Quick Start

### Generate Documentation

```bash
# Generate markdown documentation (default)
npm run docs

# Generate HTML documentation  
npm run docs:html

# Generate only markdown documentation
npm run docs:markdown

# Watch mode for development
npm run docs:watch

# Clean all documentation
npm run docs:clean
```

### Test Documentation Examples

```bash
# Test all code examples in JSDoc comments
npm run docs:test-examples

# Check documentation coverage
npm run docs:coverage
```

## 📁 Generated Documentation

- **`docs/`** - Markdown documentation (default)
- **`docs-html/`** - HTML documentation 
- **`docs-md/`** - Markdown-only documentation
- **Documentation theme** - Custom styling in `docs-theme/`

## 🎯 Documentation Standards

### Class Documentation Example

```typescript
/**
 * Manages text-to-speech conversion for multiple cloud providers
 * 
 * This class provides a universal interface for converting text to speech
 * using Google Cloud, Microsoft Azure, and Amazon Polly services.
 * 
 * @example
 * ```typescript
 * // Initialize the service
 * TtsUniversal.init({
 *   provider: 'google',
 *   googleParams: { apiKey: 'your-api-key' }
 * });
 * 
 * // Convert text to speech
 * const audio = await TtsUniversal.convertTts({
 *   text: 'Hello world',
 *   voiceName: 'en-US-Standard-A'
 * });
 * ```
 * 
 * @since 3.0.0
 * @see TtsGoogle, TtsMicrosoft, TtsAmazon
 */
export class TtsUniversal {
  // Class implementation
}
```

### Method Documentation Example

```typescript
/**
 * Converts text to speech using the configured provider
 * 
 * This method handles text-to-speech conversion with automatic retry logic,
 * SSML processing, and error handling across different cloud providers.
 * 
 * @param params - Conversion parameters including text, voice, and format
 * @param params.text - The text to convert to speech
 * @param params.voiceName - Voice identifier for the target voice
 * @param params.audioFormat - Output audio format (mp3, wav, etc.)
 * @returns Promise resolving to audio data and metadata
 * 
 * @throws {TtsError} When conversion fails due to invalid parameters
 * @throws {TtsRateLimitError} When rate limit is exceeded
 * @throws {TtsAuthenticationError} When authentication fails
 * 
 * @example
 * ```typescript
 * const result = await TtsUniversal.convertTts({
 *   text: 'Hello world',
 *   voiceName: 'en-US-Standard-A',
 *   audioFormat: AudioOutputFormatUniversal.mp3_64k
 * });
 * 
 * // Save audio to file
 * fs.writeFileSync('output.mp3', result.audio);
 * ```
 * 
 * @since 3.0.0
 */
public static async convertTts(params: ConvertParamsUniversal): Promise<AudioSuccessUniversal> {
  // Method implementation
}
```

### Interface Documentation Example

```typescript
/**
 * Configuration options for retry behavior with exponential backoff
 * 
 * Controls how the library handles failed requests, including retry attempts,
 * delays, and conditions for retrying different types of errors.
 * 
 * @example
 * ```typescript
 * const retryOptions: RetryOptions = {
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   backoffMultiplier: 2,
 *   enableJitter: true
 * };
 * ```
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelay?: number;
  
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  
  /** Whether to add random jitter to delays (default: true) */
  enableJitter?: boolean;
}
```

## 🔧 Configuration Files

### TypeDoc Configuration (`typedoc.json`)
- **Entry points**: Defines which files to process
- **Output formats**: HTML and Markdown generation
- **Validation**: Documentation completeness checking
- **Theming**: Custom CSS and branding

### JSDoc Configuration (`jsdoc.conf.json`)
- Alternative JSDoc setup for traditional documentation
- Better for JavaScript projects or legacy compatibility

## 📊 Documentation Quality

### Coverage Checking
```bash
# Check documentation coverage
npm run docs:coverage
```

### Example Testing
```bash
# Test all examples in documentation
npm run docs:test-examples
```

### Quality Metrics
- All public classes must have class-level documentation
- All public methods must have comprehensive JSDoc
- All parameters and return values must be documented
- Examples must be provided for complex APIs
- All examples must be syntactically correct

## 🎨 Custom Styling

The documentation includes custom CSS styling in `docs-theme/custom.css`:
- Modern, professional appearance
- Dark mode support
- Responsive design for mobile
- Enhanced code block styling
- Visual hierarchy for better readability

## 🚀 Deployment

### GitHub Pages
Documentation can be automatically deployed to GitHub Pages:

```yaml
# .github/workflows/docs.yml
name: Generate Documentation
on:
  push:
    branches: [main]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run docs:html
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-html
```

### Local Development Server
```bash
# Serve documentation locally
npm run docs:serve
# Opens http://localhost:8080
```

## 📝 Best Practices

1. **Write documentation first** - Use JSDoc to design your API
2. **Include examples** - Every public method should have usage examples
3. **Test examples** - Ensure all code examples actually work
4. **Keep it current** - Update documentation with every code change
5. **Use consistent formatting** - Follow the established templates
6. **Link related items** - Use `@see` tags to reference related functions
7. **Document errors** - Use `@throws` to document all possible exceptions

## 🔗 Integration with Development Workflow

### Pre-commit Hooks
```bash
# Add to .husky/pre-commit
npm run docs:coverage
npm run docs:test-examples
```

### CI/CD Integration
```bash
# Add to build pipeline
npm run docs:coverage -- --treatWarningsAsErrors
```

### IDE Integration
- Enable JSDoc intellisense in VS Code
- Use JSDoc snippets for faster documentation
- Configure ESLint to require JSDoc comments

## 📚 Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [JSDoc Documentation](https://jsdoc.app/)
- [Documentation Standards](/.cursor/rules/documentation-standards.mdc)
- [TSDoc Standards](https://tsdoc.org/)

---

**Remember**: Documentation is not separate from code - it's an integral part of development. Keep it accurate, complete, and helpful! 🚀 