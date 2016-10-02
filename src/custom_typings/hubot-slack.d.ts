declare module 'hubot-slack' {
  import { Adapter, Robot as Hubot, Response as HubotResponse, IEnvelope as HubotEnvelope } from 'hubot';
  import { MemoryDataStore, User as SlackUser, RtmClient, WebClient } from '@slack/client';

  interface SlackClient {
    robot: Robot;

    rtm: RtmClient;
    web: WebClient;
    format: SlackFormatter;
    listeners: any[];

    connect(): void;
    on(name: string, callback: (arg: any) => void): void;
    disconnect(): void;
    setTopic(id: string, topic: string): void;
    send(envelope: Envelope, message: string): void;
    send(envelope: Envelope, message: ICustomMessageData): void;
  }

  // see https://api.slack.com/docs/attachments
  // also https://api.slack.com/docs/formatting/builder
  interface IAttachment {
    fallback: string;
    color?: 'good' | 'warning' | 'danger' | string;
    pretext?: string;

    author_name?: string;
    author_link?: string;
    author_icon?: string;

    title?: string;
    title_link?: string;

    text?: string;

    fields?: {
      title?: string;
      value?: string;
      short?: boolean;
    }[];

    image_url?: string;
    thumb_url?: string;

    footer?: string;
    footer_icon?: string;

    ts?: number;

    mrkdwn_in?: string[]
  }

  interface ICustomMessage {
    envelope?: any;
    room?: string;
  }

  interface ICustomMessageData {
    channel?: string;
    message?: ICustomMessage;
    text?: string;
    attachments?: IAttachment[];
    username?: string;
    icon_url?: string;
    icon_emoji?: string;
  }

  interface SlackBotClient {
    rtm: RtmClient;
  }

  interface SlackBot extends Adapter {
    client: SlackBotClient;

    send(envelope: HubotEnvelope, ...messages: ICustomMessageData[]): void;
    reply(envelope: HubotEnvelope, ...messages: ICustomMessageData[]): void;
  }

  interface Envelope {
    user: SlackUser;
  }

  interface Response extends HubotResponse {
    envelope: Envelope & HubotEnvelope;

    send(envelope: HubotEnvelope, ...messages: ICustomMessageData[]): void;
    reply(envelope: HubotEnvelope, ...messages: ICustomMessageData[]): void;
  }

  interface Robot extends Hubot {
    adapter: SlackBot;

    respond(regex: RegExp, options: any, callback: (res: Response) => void): void;
    respond(regex: RegExp, callback: (res: Response) => void): void;
    error(handler: (err: Error, res: Response) => void): void;
    send(envelope: HubotEnvelope, ...messages: ICustomMessageData[]): void;
    reply(envelope: HubotEnvelope, ...messages: ICustomMessageData[]): void;
  }

  interface SlackFormatter {

  }

  function use(robot: Hubot): SlackBot;
}
