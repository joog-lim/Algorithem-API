import axios from "axios";

import { DiscordDTO, AlgorithemDTO } from "../DTO";

const generateWebhookMessage: Function = ({
  form,
  coment,
  color,
}: DiscordDTO.GenerateMessage): DiscordDTO.SendDiscordWebhookMessage => {
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

export const sendNewAlgorithemMessage: Function = async (
  data: AlgorithemDTO.PostRequestForm
): Promise<void> => {
  const embed: DiscordDTO.SendDiscordWebhookMessage = generateWebhookMessage({
    form: data,
    coment: "새로운 알고리즘이 기다리고있습니다!",
    color: 1752220,
  });
  await sendMessage(process.env.DISCORD_MANAGEMENT_WEBHOOK, embed);
};

export const sendChangeStatusMessage: Function = async (
  data: AlgorithemDTO.PostRequestForm,
  {
    beforeStatus,
    afterStatus,
  }: {
    beforeStatus: AlgorithemDTO.PostStatus;
    afterStatus: AlgorithemDTO.PostStatus;
  },
  reason: string
): Promise<void> => {
  const changeReason = reason ? `\n변경 사유 : ${reason}` : "";
  const embed: DiscordDTO.SendDiscordWebhookMessage = generateWebhookMessage({
    form: data,
    coment: `해당 알고리즘의 상태가 업데이트됐습니다.\n${beforeStatus} -> ${afterStatus}${changeReason}`,
    color: 15844367,
  });
  await sendMessage(process.env.DISCORD_MANAGEMENT_WEBHOOK, embed);
};
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
