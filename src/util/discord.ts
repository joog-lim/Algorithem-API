import axios from "axios";
import { PostRequestForm } from "../model/posts";

interface EmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}
interface Embed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  color?: number;
  footer?: EmbedFooter;
}
interface DiscordWebhookMessage {
  content?: string;
  embeds: [Embed];
}
interface GenerateMessage {
  form: PostRequestForm;
  coment: string;
  color: number;
}

const generateMessage: Function = ({
  form,
  coment,
  color,
}: GenerateMessage): DiscordWebhookMessage => {
  const footerData: EmbedFooter = {
    text: form.tag,
    icon_url:
      "https://cdn.discordapp.com/avatars/826647881800351765/0493a57e7c5a21dd4e434a153d44938e.webp?size=128",
  };
  return {
    content: coment,
    embeds: [
      {
        title: form.title,
        description: form.content,
        footer: footerData,
        color: color,
      },
    ],
  };
};
interface DiscordDeletedMessage {
  coment: string;
  reason: string;
  url: string;
  number: number;
}
export const sendDeleteMessage: Function = async (
  arg: DiscordDeletedMessage
): Promise<void> => {
  const embed: DiscordWebhookMessage = generateMessage({
    form: {
      title: arg.coment,
      description: arg.reason,
      tag: `${arg.number} 알고리즘 삭제 요청`,
    },
    coment: "알고리즘 삭제 요청입니다.",
    color: 16711680,
  });
  await sendMessage(arg.url, embed);
};
export const sendUpdateMessage: Function = async (
  form: PostRequestForm,
  url: string
): Promise<void> => {
  const data: DiscordWebhookMessage = generateMessage({
    form: form,
    coment: "새로운 알고리즘이 올라왔습니다!",
    color: 65280,
  });
  await sendMessage(url, data);
};

const sendMessage: Function = async (
  url: string,
  data: DiscordWebhookMessage
): Promise<void> => {
  const res = await axios({
    method: "POST",
    url: url,
    data: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
