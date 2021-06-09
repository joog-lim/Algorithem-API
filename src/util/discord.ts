import axios from "axios";
import { PostRequestForm } from "model/schema/posts";

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
export const sendDeleteMessage: Function = async (
  coment: string,
  url: string
): Promise<void> => {
  const embed: DiscordWebhookMessage = generateMessage({
    form: {
      title: "게시글 삭제 요청",
      content: "게시글 삭제 요청입니다.",
      tag: "삭제 요청",
    },
    coment: coment,
    color: 16711680,
  });
  await sendMessage(url, embed);
};
export const sendUpdateMessage: Function = async (
  form: PostRequestForm,
  url: string
): Promise<void> => {
  const data: DiscordWebhookMessage = generateMessage({
    form: form,
    coment: "새로운 제보가 올라왔습니다!",
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
