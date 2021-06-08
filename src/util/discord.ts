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
const generateMessage: Function = (
  form: PostRequestForm
): DiscordWebhookMessage => {
  const footerData: EmbedFooter = {
    text: form.tag,
    icon_url:
      "https://cdn.discordapp.com/avatars/826647881800351765/0493a57e7c5a21dd4e434a153d44938e.webp?size=128",
  };
  return {
    content: "새로운 제보가 올라왔습니다!",
    embeds: [
      {
        title: form.title,
        description: form.content,
        footer: footerData,
        color: 65280,
      },
    ],
  };
};

export const sendMessage: Function = async (
  form: PostRequestForm,
  url: string
): Promise<void> => {
  const data: DiscordWebhookMessage = generateMessage(form);
  const res = await axios({
    method: "POST",
    url: url,
    data: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
