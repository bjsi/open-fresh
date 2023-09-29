import { OpenAIChatMessage, OpenAIChatModel, generateText } from "modelfusion";
import { compilePrompt } from "./compilePrompt";
export const mealPlanPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef preparing a weekly meal plan for your customer. ` +
      `You need to create a meal plan that meets your customer's requirements. ` +
      `For each meal, you should create a recipe that includes the ingredients and instructions. ` +
      `You should write ingredient quantities in grams. `
  ),
  OpenAIChatMessage.user(`Customer requirements: {{ requirements }}.`.trim()),
  OpenAIChatMessage.user(`Send me the meal plan for {{ day }}.`.trim()),
];

export const createMealPlan = async (vars: {
  requirements: string;
  day: string;
}) => {
  const text = await generateText(
    new OpenAIChatModel({
      model: "gpt-4",
    }),
    compilePrompt(mealPlanPrompt, vars)
  );
  return text;
};
