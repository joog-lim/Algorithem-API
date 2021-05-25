export const timeText = (date: Date): string => {
  let hours = date.getUTCHours() + 9;
  if (hours > 23) hours -= 24;
  let text = `${date.getFullYear()}년 ${date.getMonth()}월 ${date.getDate()}일 `;
  if (hours < 6) text += "새벽";
  else if (hours < 11) text += "아침";
  else if (hours < 14) text += "점심";
  else if (hours < 15) text += "오후";
  else if (hours < 20) text += "저녁";
  else if (hours < 24) text += "밤";
  return text;
};
