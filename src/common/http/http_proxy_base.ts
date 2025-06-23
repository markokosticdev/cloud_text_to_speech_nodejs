/**
 * @fileoverview HTTP Proxy Configuration for Cloud Text-to-Speech Services
 * 
 * This module provides HTTP proxy configuration support for TTS requests across
 * all providers (Google Cloud TTS, Microsoft Azure TTS, and Amazon Polly).
 * It includes proxy URL configuration, custom headers, and query parameters
 * with flexible factory pattern support for dynamic proxy selection.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link HttpClientBase} for HTTP client implementation
 * @see {@link HttpHeaderBase} for header management
 * 
 * @example Basic proxy configuration
 * ```typescript
 * import { HttpProxyBase } from 'cloud-text-to-speech';
 * 
 * const proxy = new HttpProxyBase({
 *   url: 'http://proxy.company.com:8080',
 *   headers: {
 *     'Proxy-Authorization': 'Basic dXNlcjpwYXNz'
 *   }
 * });
 * 
 * // Use with HTTP client
 * const axiosConfig = {
 *   proxy: {
 *     host: new URL(proxy.url).hostname,
 *     port: parseInt(new URL(proxy.url).port),
 *     auth: proxy.headers?.['Proxy-Authorization']
 *   }
 * };
 * ```
 * 
 * @example Corporate proxy with authentication
 * ```typescript
 * const corporateProxy = new HttpProxyBase({
 *   url: 'https://secure-proxy.corp.com:3128',
 *   headers: {
 *     'Proxy-Authorization': 'Bearer token123',
 *     'User-Agent': 'TTS-Client/1.0'
 *   },
 *   params: {
 *     'client': 'tts-service',
 *     'version': '3.0'
 *   }
 * });
 * ```
 * 
 * @example Dynamic proxy factory
 * ```typescript
 * const proxyFactory: HttpProxyMapperBase = () => {
 *   const proxyUrls = [
 *     'http://proxy1.example.com:8080',
 *     'http://proxy2.example.com:8080',
 *     'http://proxy3.example.com:8080'
 *   ];
 *   
 *   // Load balance across proxies
 *   const randomProxy = proxyUrls[Math.floor(Math.random() * proxyUrls.length)];
 *   
 *   return new HttpProxyBase({
 *     url: randomProxy,
 *     headers: {
 *       'Proxy-Authorization': getProxyAuthToken()
 *     }
 *   });
 * };
 * 
 * // Use factory to get proxy configuration
 * const proxy = proxyFactory();
 * ```
 */

/**
 * Type definition for HTTP proxy factory functions.
 * Enables dynamic proxy configuration based on runtime conditions,
 * load balancing, or environment-specific proxy selection.
 * 
 * @returns HttpProxyBase instance with current proxy configuration
 * 
 * @category Common Utilities
 * 
 * @example Load balancing proxy factory
 * ```typescript
 * const loadBalancingFactory: HttpProxyMapperBase = () => {
 *   const proxies = [
 *     { url: 'http://proxy1.com:8080', load: 10 },
 *     { url: 'http://proxy2.com:8080', load: 5 },
 *     { url: 'http://proxy3.com:8080', load: 15 }
 *   ];
 *   
 *   // Select proxy with lowest load
 *   const selectedProxy = proxies.sort((a, b) => a.load - b.load)[0];
 *   
 *   return new HttpProxyBase({
 *     url: selectedProxy.url,
 *     headers: { 'X-Client-ID': 'tts-service' }
 *   });
 * };
 * ```
 * 
 * @example Environment-based proxy factory
 * ```typescript
 * const environmentProxyFactory: HttpProxyMapperBase = () => {
 *   const environment = process.env.NODE_ENV || 'development';
 *   
 *   const proxyConfigs = {
 *     development: {
 *       url: 'http://dev-proxy.local:8080',
 *       headers: { 'Environment': 'dev' }
 *     },
 *     staging: {
 *       url: 'http://staging-proxy.company.com:8080',
 *       headers: { 'Environment': 'staging' }
 *     },
 *     production: {
 *       url: 'https://secure-proxy.company.com:3128',
 *       headers: { 
 *         'Environment': 'production',
 *         'Proxy-Authorization': process.env.PROXY_AUTH_TOKEN
 *       }
 *     }
 *   };
 *   
 *   return new HttpProxyBase(proxyConfigs[environment] || proxyConfigs.development);
 * };
 * ```
 * 
 * @example Provider-specific proxy factory
 * ```typescript
 * const providerSpecificFactory: HttpProxyMapperBase = () => {
 *   const currentProvider = getCurrentTtsProvider();
 *   
 *   const providerProxies = {
 *     google: 'http://google-proxy.company.com:8080',
 *     microsoft: 'http://azure-proxy.company.com:8080',
 *     amazon: 'http://aws-proxy.company.com:8080'
 *   };
 *   
 *   return new HttpProxyBase({
 *     url: providerProxies[currentProvider],
 *     headers: {
 *       'X-Provider': currentProvider,
 *       'X-Service': 'text-to-speech'
 *     }
 *   });
 * };
 * ```
 */
export type HttpProxyMapperBase = () => HttpProxyBase;

/**
 * HTTP proxy configuration class for TTS services with flexible configuration options.
 * Supports proxy URL, custom headers, and query parameters for comprehensive
 * proxy integration across different network environments and security requirements.
 * 
 * @category Common Utilities
 * 
 * @example Basic proxy setup
 * ```typescript
 * import { HttpProxyBase } from 'cloud-text-to-speech';
 * 
 * const proxy = new HttpProxyBase({
 *   url: 'http://proxy.example.com:8080'
 * });
 * 
 * console.log(proxy.url); // 'http://proxy.example.com:8080'
 * ```
 * 
 * @example Authenticated proxy
 * ```typescript
 * const authenticatedProxy = new HttpProxyBase({
 *   url: 'https://secure-proxy.company.com:3128',
 *   headers: {
 *     'Proxy-Authorization': 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=',
 *     'User-Agent': 'TTS-Service/3.0',
 *     'X-Forwarded-For': '192.168.1.100'
 *   }
 * });
 * 
 * // Headers include authentication and client identification
 * console.log(authenticatedProxy.headers);
 * ```
 * 
 * @example Proxy with custom parameters
 * ```typescript
 * const customProxy = new HttpProxyBase({
 *   url: 'http://configurable-proxy.example.com:8080',
 *   headers: {
 *     'Authorization': 'Bearer token123'
 *   },
 *   params: {
 *     'client_id': 'tts-application',
 *     'service': 'text-to-speech',
 *     'version': '3.0',
 *     'region': 'us-east-1'
 *   }
 * });
 * 
 * // Parameters can be used for proxy routing or logging
 * console.log(customProxy.params);
 * ```
 * 
 * @example Integration with Axios
 * ```typescript
 * import axios from 'axios';
 * 
 * const proxy = new HttpProxyBase({
 *   url: 'http://corporate-proxy.company.com:8080',
 *   headers: {
 *     'Proxy-Authorization': 'Negotiate token'
 *   }
 * });
 * 
 * // Convert to Axios proxy configuration
 * const axiosConfig = {
 *   proxy: {
 *     protocol: new URL(proxy.url).protocol.slice(0, -1),
 *     host: new URL(proxy.url).hostname,
 *     port: parseInt(new URL(proxy.url).port) || 8080,
 *     auth: proxy.headers?.['Proxy-Authorization']
 *   },
 *   headers: proxy.headers
 * };
 * 
 * const client = axios.create(axiosConfig);
 * ```
 * 
 * @example Conditional proxy configuration
 * ```typescript
 * const createProxyForEnvironment = (environment: string): HttpProxyBase | undefined => {
 *   if (environment === 'development') {
 *     // No proxy in development
 *     return undefined;
 *   }
 *   
 *   if (environment === 'testing') {
 *     return new HttpProxyBase({
 *       url: 'http://test-proxy.local:8080',
 *       headers: { 'Test-Environment': 'true' }
 *     });
 *   }
 *   
 *   if (environment === 'production') {
 *     return new HttpProxyBase({
 *       url: process.env.PRODUCTION_PROXY_URL,
 *       headers: {
 *         'Proxy-Authorization': process.env.PROXY_AUTH_TOKEN,
 *         'X-Service': 'cloud-tts-production'
 *       },
 *       params: {
 *         'environment': 'production',
 *         'service': 'text-to-speech'
 *       }
 *     });
 *   }
 *   
 *   return undefined;
 * };
 * 
 * const proxy = createProxyForEnvironment(process.env.NODE_ENV);
 * ```
 * 
 * @example Proxy health checking
 * ```typescript
 * class HealthCheckedProxy extends HttpProxyBase {
 *   private isHealthy: boolean = true;
 *   private lastCheck: number = 0;
 *   private checkInterval: number = 60000; // 1 minute
 *   
 *   constructor(config: {
 *     url?: string;
 *     headers?: Record<string, string>;
 *     params?: Record<string, string>;
 *   }) {
 *     super(config);
 *   }
 *   
 *   async checkHealth(): Promise<boolean> {
 *     const now = Date.now();
 *     if (now - this.lastCheck < this.checkInterval) {
 *       return this.isHealthy;
 *     }
 *     
 *     try {
 *       // Perform health check against proxy
 *       const response = await fetch(this.url + '/health', {
 *         method: 'HEAD',
 *         timeout: 5000
 *       });
 *       
 *       this.isHealthy = response.ok;
 *       this.lastCheck = now;
 *       
 *       return this.isHealthy;
 *     } catch (error) {
 *       this.isHealthy = false;
 *       this.lastCheck = now;
 *       return false;
 *     }
 *   }
 *   
 *   get url(): string | undefined {
 *     return this.isHealthy ? super.url : undefined;
 *   }
 * }
 * ```
 */
export class HttpProxyBase {
  /** Proxy server URL (e.g., 'http://proxy.example.com:8080') */
  url: string | undefined;
  /** Custom headers to send with proxy requests */
  headers: Record<string, string> | undefined;
  /** Query parameters for proxy configuration */
  params: Record<string, string> | undefined;

  /**
   * Creates a new HTTP proxy configuration with optional URL, headers, and parameters.
   * 
   * @param config - Proxy configuration object
   * @param config.url - Proxy server URL
   * @param config.headers - Custom headers for proxy requests
   * @param config.params - Query parameters for proxy configuration
   * 
   * @example Basic proxy configuration
   * ```typescript
   * const proxy = new HttpProxyBase({
   *   url: 'http://proxy.company.com:8080'
   * });
   * ```
   * 
   * @example Full proxy configuration
   * ```typescript
   * const proxy = new HttpProxyBase({
   *   url: 'https://secure-proxy.company.com:3128',
   *   headers: {
   *     'Proxy-Authorization': 'Basic dXNlcjpwYXNz',
   *     'User-Agent': 'TTS-Client/3.0',
   *     'X-Client-ID': 'tts-service-001'
   *   },
   *   params: {
   *     'service': 'text-to-speech',
   *     'region': 'us-west-2',
   *     'client_version': '3.0.0'
   *   }
   * });
   * ```
   * 
   * @example Environment-based configuration
   * ```typescript
   * const config = {
   *   url: process.env.HTTP_PROXY_URL,
   *   headers: process.env.PROXY_AUTH_TOKEN ? {
   *     'Proxy-Authorization': `Bearer ${process.env.PROXY_AUTH_TOKEN}`
   *   } : undefined,
   *   params: {
   *     'environment': process.env.NODE_ENV || 'development',
   *     'service': 'cloud-tts'
   *   }
   * };
   * 
   * const proxy = new HttpProxyBase(config);
   * ```
   * 
   * @example Proxy with load balancing support
   * ```typescript
   * const createLoadBalancedProxy = (proxyUrls: string[]) => {
   *   const selectedUrl = proxyUrls[Math.floor(Math.random() * proxyUrls.length)];
   *   
   *   return new HttpProxyBase({
   *     url: selectedUrl,
   *     headers: {
   *       'X-Load-Balance-ID': Math.random().toString(36).substr(2, 9),
   *       'X-Proxy-Client': 'tts-service'
   *     },
   *     params: {
   *       'balancer': 'random',
   *       'pool_size': proxyUrls.length.toString()
   *     }
   *   });
   * };
   * 
   * const proxy = createLoadBalancedProxy([
   *   'http://proxy1.company.com:8080',
   *   'http://proxy2.company.com:8080',
   *   'http://proxy3.company.com:8080'
   * ]);
   * ```
   * 
   * @example Proxy with authentication rotation
   * ```typescript
   * class RotatingAuthProxy extends HttpProxyBase {
   *   private authTokens: string[];
   *   private currentTokenIndex: number = 0;
   *   
   *   constructor(url: string, authTokens: string[]) {
   *     super({ url });
   *     this.authTokens = authTokens;
   *     this.updateAuthHeader();
   *   }
   *   
   *   rotateAuth(): void {
   *     this.currentTokenIndex = (this.currentTokenIndex + 1) % this.authTokens.length;
   *     this.updateAuthHeader();
   *   }
   *   
   *   private updateAuthHeader(): void {
   *     this.headers = {
   *       ...this.headers,
   *       'Proxy-Authorization': `Bearer ${this.authTokens[this.currentTokenIndex]}`
   *     };
   *   }
   * }
   * 
   * const proxy = new RotatingAuthProxy(
   *   'https://secure-proxy.company.com:3128',
   *   ['token1', 'token2', 'token3']
   * );
   * ```
   */
  constructor({
    url,
    headers,
    params,
  }: {
    url?: string;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}) {
    this.url = url;
    this.headers = headers;
    this.params = params;
  }
}
