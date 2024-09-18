export type BaseProxyMapper = () => BaseProxy;

export class BaseProxy {
  url: string | undefined;
  headers: Record<string, string> | undefined;
  params: Record<string, string> | undefined;

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
