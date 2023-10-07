import {
  OpenAIChatMessage,
  OpenAIChatModel,
  generateText,
  streamText,
} from "modelfusion";
import { compilePrompt } from "./compilePrompt";

export const improveMealPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef preparing a meal plan for your customer. ` +
      `You need to update a meal plan based on your customer's feedback. `
  ),
  OpenAIChatMessage.assistant(`Meal plan: {{ mealPlan }}.`.trim()),
  OpenAIChatMessage.user(`Customer feedback: {{ requirements }}.`.trim()),
];

type CreateMealPlanVars = {
  mealPlan: string;
  feedback: string;
};

export async function improveMeal(
  vars: CreateMealPlanVars,
  stream: false
): Promise<string>;
export async function improveMeal(
  vars: CreateMealPlanVars,
  stream: true
): Promise<AsyncIterable<string>>;
export async function improveMeal(
  vars: CreateMealPlanVars,
  stream: boolean
): Promise<AsyncIterable<string> | string> {
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateText(model, compilePrompt(improveMealPrompt, vars));
  } else {
    return await streamText(model, compilePrompt(improveMealPrompt, vars));
  }
}
