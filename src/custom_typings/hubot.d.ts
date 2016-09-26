declare module "hubot" {
  import { Application as ExpressApp } from 'express';
  import { EventEmitter } from 'events';

  interface IHttpResponse {
    statusCode: number;
  }

  interface IHttpClientHandler {
    (err: Error, res: IHttpResponse, body: string): void;
  }

  interface IScopedHttpClient {
    header(name: string, value: string): IScopedHttpClient;
    post(body: string): (handler: IHttpClientHandler) => void;
    get(): (handler: IHttpClientHandler) => void;
  }

  interface IEnvelope {
    room?: string;
    id?: string;
    user?: User;
    message?: Message;
  }

  export class User {
    id: string;
    name: string;
    room: string;
  }

  export class Message {
    constructor (user: User);

    user: User;
    text: string;
    id: string;
    room: string;
    done: boolean;
  }

  export class EnterMessage extends Message { }
  export class LeaveMessage extends Message { }
  export class TopicMessage extends Message { }
  export class TextMessage extends Message { }
  export class CatchAllMessage extends Message {
    message: Message;
  }

  export class Response {
    robot: Robot;
    match: string[];
    message: Message;
    envelope: IEnvelope;

    constructor(robot: Robot, message: Message, match: RegExpMatchArray);

    reply(msg: string): void;
  }

  export interface IBrain {
    get(key: string): any;
    set(key: string, value: any): IBrain;
  }

  export interface UserData {
    email_address: string;
    name: string;
    id: string;
  }

  export interface BrainData {
    users: { [userId: string] : UserData }
  }

  export class Brain implements IBrain {
    constructor(robot: Robot);

    users(): { [id: string]: User; };
    userForName(name: string): User;
    userForId(id: string, options: any): User;
    get(key: string): any;
    set(key: string, value: any): Brain;
    remove(key: string): Brain;
    close(): void;
    save(): void;
    setAutoSave(enabled: boolean): void;

    data: BrainData;
  }

  export class Adapter {
    constructor(robot: Robot);

    send(envelope: IEnvelope, ...messages: string[]): void;
    reply(envelope: IEnvelope, ...messages: Message[]): void;
  }

  class Log {
    log(levelStr: string, args: any[]): void;
    error(...msg: any[]): void;
    emergency(...msg: any[]): void;
    alert(...msg: any[]): void;
    critical(...msg: any[]): void;
    warning(...msg: any[]): void;
    notice(...msg: any[]): void;
    info(...msg: any[]): void;
    debug(...msg: any[]): void;
  }

  export class Robot {
    adapter: Adapter;
    brain: Brain;
    router: ExpressApp;
    logger: Log;
    name: string;
    events: EventEmitter;

    constructor(adapterPath: string, adapter: string, httpd: boolean, name?: string, alias?: boolean);

    respond(regex: RegExp, options: any, callback: (res: Response) => void): void;
    respond(regex: RegExp, callback: (res: Response) => void): void;
    http(url: string): IScopedHttpClient;
    messageRoom(room: string, msg: string): void;
    error(handler: (err: Error, res: Response) => void): void;
    emit(event: string, ...args: any[]): boolean;
    onUncaughtException(err: Error): void;
    on(event: string, listener: (arg: any) => void): void;
  }
}