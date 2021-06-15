export const replaceLtGtQuot = (text: string): string => {
  return text.replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;");
};
