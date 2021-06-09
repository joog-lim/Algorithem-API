export const timeText = (date: Date): string => {
  let hours = date.getUTCHours() + 9;
  hours = hours > 23 ? hours - 24 : hours;

  let text = `${date.getFullYear()}년 ${date.getMonth()}월 ${date.getDate()}일 `;

  const timingText = ["06새벽", "11아침", "14점심", "17오후", "20저녁", "24밤"];

  text += timingText.filter((word) => Number(word.substring(0, 2)) < hours)[
    timingText.length - 1
  ];

  return text;
};
