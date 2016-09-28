declare module "hubot-slack" {
  import { Adapter, Robot as Hubot, Response as HubotResponse, IEnvelope } from 'hubot';
  import { MemoryDataStore } from '@slack/client';

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

  interface SlackBot extends Adapter {
    client: {
      rtm: {
        dataStore: MemoryDataStore;
      }
    }

    send(envelope: IEnvelope, ...messages: ICustomMessageData[]): void;
    reply(envelope: IEnvelope, ...messages: ICustomMessageData[]): void;
  }

  export interface Response extends HubotResponse {
    send(envelope: IEnvelope, ...messages: ICustomMessageData[]): void;
    reply(envelope: IEnvelope, ...messages: ICustomMessageData[]): void;
  }

  interface Robot extends Hubot {
    adapter: SlackBot;

    respond(regex: RegExp, options: any, callback: (res: Response) => void): void;
    respond(regex: RegExp, callback: (res: Response) => void): void;
    error(handler: (err: Error, res: Response) => void): void;
    send(envelope: IEnvelope, ...messages: ICustomMessageData[]): void;
    reply(envelope: IEnvelope, ...messages: ICustomMessageData[]): void;
  }

  export function use(robot: Hubot): SlackBot;
}
