declare module 'scoped-http-client' {
  export interface Response {
    statusCode: number;
  }

  export interface ResponseHandler {
    (err: Error, res: Response, body: string): void;
  }

  export interface Client {
    header(key: string, value: string): Client;
    post(body: string): (handler: ResponseHandler) => void;
    get(): (handler: ResponseHandler) => void;
    delete(body: string): (handler: ResponseHandler) => void;
    patch(body: string): (handler: ResponseHandler) => void;
  }

  export interface ClientOptions {
    auth?: string;
  }
  
  export interface ScopedClientConstructor {
    (url: string, options?: ClientOptions): Client;
  }

  export function create(url: string, options: any): Client;
}
