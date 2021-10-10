import axios from "axios";
import { DocumentType } from "@typegoose/typegoose";

import { DiscordDTO, AlgorithemDTO } from "../DTO";
import { Post } from "../model/posts";

const generateWebhookMessage: Function = ({
  form,
  coment,
  description,
  color,
}: DiscordDTO.GenerateMessage): DiscordDTO.SendDiscordWebhookMessage => {
  const footerData: DiscordDTO.DiscordEmbedFooter = {
    text: form.tag,
    icon_url:
      "https://cdn.discordapp.com/avatars/826647881800351765/0493a57e7c5a21dd4e434a153d44938e.webp?size=128",
  };
  return {
    embeds: [
      {
        type: DiscordDTO.DiscordEmbedType.rich,
        title: coment,
        description: description,
        fields: [
          {
            name: form.title,
            value: form.content,
            inline: false,
          },
        ],
        footer: footerData,
        color: color,
      },
    ],
  };
};

export const sendNewAlgorithemMessage: Function = async (
  data: AlgorithemDTO.PostRequestForm
): Promise<void> => {
  const message: DiscordDTO.SendDiscordWebhookMessage = generateWebhookMessage({
    form: data,
    coment: "알고리즘 갱신!",
    description: "새로운 알고리즘이 기다리고있습니다!",
    color: 1752220,
  });
  await sendMessage(process.env.DISCORD_MANAGEMENT_WEBHOOK, message);
};

export const sendSetRejectedMessage: Function = async (
  data: AlgorithemDTO.PostRequestForm,
  reason: string
): Promise<void> => {
  const changeReason = reason ? `\n**거절 사유** : ${reason}` : "";
  const message: DiscordDTO.SendDiscordWebhookMessage = generateWebhookMessage({
    form: { title: data.title, content: " ", tag: data.tag },
    coment: "거절된 알고리즘",
    description: `해당 알고리즘이 거절되었습니다.${changeReason}`,
    color: 16711680,
  });
  await sendMessage(process.env.DISCORD_RECJECTED_WEBHOOK, message);
};

export const sendReportMessage: Function = async (
  data: AlgorithemDTO.PostRequestForm,
  reason: string
): Promise<void> => {
  const changeReason = reason ? `\n**신고 사유** : ${reason}` : "";
  const message: DiscordDTO.SendDiscordWebhookMessage = generateWebhookMessage({
    form: data,
    coment: "알고리즘 신고",
    description: `해당 알고리즘이 신고되었습니다.${changeReason}`,
    color: 16711680,
  });
  await sendMessage(process.env.DISCORD_REPORT_WEBHOOK, message);
};

export const sendACCEPTEDAlgorithemMessage: Function = async (
  data: AlgorithemDTO.PostRequestForm
): Promise<void> => {
  const message: DiscordDTO.SendDiscordWebhookMessage = generateWebhookMessage({
    form: data,
    coment: "알고리즘 갱신!",
    description: "새로운 알고리즘이 기다리고있습니다!",
    color: 1752220,
  });
  await sendMessage(process.env.DISCORD_ACCEPTED_WEBHOOK, message);
};

export const algorithemDeleteEvenetMessage: Function = async (
  post: DocumentType<Post>,
  reason: string
): Promise<void> => {
  const deletedReason: string = reason ? `\n**삭제 사유** : ${reason}` : "";
  const message: DiscordDTO.SendDiscordWebhookMessage = generateWebhookMessage({
    form: {
      title: post.title,
      content: post.content,
      tag: post.tag,
    },
    coment: "알고리즘이 삭제됨",
    description: `${post.number}번째 알고리즘이 삭제되었습니다.${deletedReason}`,
    color: 16711680,
  });
  await sendMessage(process.env.DISCORD_ABOUT_DELETE_WEBHOOK, message);
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
