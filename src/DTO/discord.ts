import { PostRequestForm } from "./post";

export interface DiscordObject {
  id: string;
}
export interface DiscordWebhook extends DiscordObject {
  type: number;
  name: string;
  avatar: string;
  application_id: string;

  guild_id?: string | null;
  channel_id: string | null;
}

export interface DiscordIncomingWebhook extends DiscordWebhook {
  token?: string;
  user?: DiscordUser;
}
export interface DiscordChannelFollowerWebhook extends DiscordWebhook {
  user?: DiscordUser;
  source_guild?: DiscordGuild;
  source_channel?: DiscordChannel;
  url?: string;
}
export interface DiscordApplicationWebhook extends DiscordWebhook {}

interface DiscordGuild extends DiscordObject {} // TODO
interface DiscordChannel extends DiscordObject {} // TODO

export interface DiscordUser extends DiscordObject {
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface SendDiscordWebhookMessage {
  content?: string; // content, file, embeds 셋 중 하나는 필수
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  file?: File; // content, file, embeds 셋 중 하나는 필수
  embeds?: DiscordEmbed[]; // content, file, embeds 셋 중 하나는 필수
  payload_json?: string; // multipart/form-data only
  allowed_mentions?: DiscordAllowedMentions;
  components?: DiscordComponent[];
}

export interface DiscordEmbed {
  title?: string;
  type: DiscordEmbedType; // webhook 사용시 항상 rich
  description?: string;
  url?: string;
  timestamp?: string; // ISO8601 timestamp
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  video?: DiscordEmbedVideo;
  provider?: DiscordEmbedProvider;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedFields;
}
interface DiscordEmbedLinkedComponent {
  url?: string;
}
interface DiscordEmbedLinkedMediaContent extends DiscordEmbedLinkedComponent {
  proxy_url?: string;
  height?: number;
  width?: number;
}
export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}
export interface DiscordEmbedImage extends DiscordEmbedLinkedMediaContent {}
export interface DiscordEmbedThumbnail extends DiscordEmbedLinkedMediaContent {}
export interface DiscordEmbedVideo extends DiscordEmbedLinkedMediaContent {}
export interface DiscordEmbedProvider extends DiscordEmbedLinkedComponent {
  name?: string;
}
export interface DiscordEmbedAuthor extends DiscordEmbedLinkedComponent {
  name?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}
export interface DiscordEmbedFields {
  name: string;
  value: string;
  inline?: boolean;
}

export const DiscordEmbedType = {
  rich: "rich",
  image: "image",
  video: "video",
  gifv: "gifv",
  article: "article",
  link: "link",
} as const;
export type DiscordEmbedType =
  typeof DiscordEmbedType[keyof typeof DiscordEmbedType];

export interface DiscordAllowedMentions {
  parse?: AllowedMentionTypes[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export type AllowedMentionTypes = "roles" | "users" | "everyone";

export type DiscordButtonsComponentType = {
  type: DiscordEmbedComponentType;
  custom_id?: string;
  disabled?: boolean;
  style?: number;
  label?: string;
  emoji?: DiscordEmoji;
  url?: string;
};
export type DiscordSelectMenusComponentType = {
  type: DiscordEmbedComponentType;
  custom_id?: string;
  disabled?: boolean;

  options: SelectOptions[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
};
export type DiscordActionRowsComponentType = {
  type: DiscordEmbedComponentType;
  components?: DiscordComponent[];
};
export type DiscordComponent =
  | DiscordButtonsComponentType
  | DiscordSelectMenusComponentType
  | DiscordActionRowsComponentType;

export const DiscordEmbedComponentType = {
  Action_Row: 1,
  Button: 2,
  Select_Menu: 3,
} as const;
export type DiscordEmbedComponentType =
  typeof DiscordEmbedComponentType[keyof typeof DiscordEmbedComponentType];

export interface SelectOptions {
  label: string;
  value: string;
  description?: string;
  emoji?: DiscordEmoji;
  default?: boolean;
}
export interface DiscordEmoji {
  id: string | null;
  name: string | null;
  roles?: DiscordRoles[];
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animatd?: boolean;
  available?: boolean;
}

export interface DiscordRoles {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionalbe: boolean;
  tags?: DiscordRoleTags;
}
export interface DiscordRoleTags {
  bot_id?: string;
  integration_id?: string;
  premium_subscriber?: null;
}

export interface GenerateMessage {
  form: PostRequestForm;
  coment: string;
  color: number;
}
