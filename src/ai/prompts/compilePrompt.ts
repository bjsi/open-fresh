import { OpenAIChatMessage } from "modelfusion";

export const compilePrompt = (
  messages: OpenAIChatMessage[],
  variables: Record<string, string>
): OpenAIChatMessage[] => {
  const compiledPrompt = messages.map((m) => ({
    ...m,
    content: m.content?.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
      return variables[key];
    }),
  })) as OpenAIChatMessage[];
  return compiledPrompt;
};
