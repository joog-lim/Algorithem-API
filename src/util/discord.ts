import axios from "axios";
import { PostRequestForm } from "model/schema/posts";

export const sendMessage: Function = async (
  form: PostRequestForm
): Promise<void> => {
  const res = await axios({
    method: "POST",
    url: process.env.DISCORD_WEBHOOK ?? "",
    data: {
      content: `**${form.title}#${form.tag}**\n\`\`\`\n${form.content}\`\`\``,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(res.data);
};

export const sendTestMessage: Function = async (
  form: PostRequestForm
): Promise<void> => {
  const res = await axios({
    method: "POST",
    url: process.env.DISCORD_TEST_WEBHOOK ?? "",
    data: {
      content: `**${form.title}#${form.tag}**\n\`\`\`\n${form.content}\`\`\``,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(res.data);
};
