import axios from "axios";

import { DiscordDTO, AlgorithemDTO } from "../DTO";

interface GenerateMessage {
  form: AlgorithemDTO.PostRequestForm;
  coment: string;
  color: number;
}

const generateWebhookMessage: Function = ({
  form,
  coment,
  color,
}: GenerateMessage): DiscordDTO.SendDiscordWebhookMessage => {
  const footerData: DiscordDTO.DiscordEmbedFooter = {
    text: form.tag,
    icon_url:
      "https://cdn.discordapp.com/avatars/826647881800351765/0493a57e7c5a21dd4e434a153d44938e.webp?size=128",
  };
  return {
    content: coment,
    embeds: [
      {
        type: DiscordDTO.DiscordEmbedType.rich,
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
  const embed: DiscordDTO.DiscordEmbed = generateWebhookMessage({
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
  form: AlgorithemDTO.PostRequestForm,
  url: string
): Promise<void> => {
  const data: DiscordDTO.DiscordEmbed = generateWebhookMessage({
    form: form,
    coment: "새로운 알고리즘이 올라왔습니다!",
    color: 65280,
  });
  await sendMessage(url, data);
};

const sendMessage: Function = async (
  url: string,
  data: DiscordDTO.DiscordEmbed
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
