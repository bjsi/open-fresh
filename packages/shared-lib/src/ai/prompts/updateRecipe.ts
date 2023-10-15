import {
  OpenAIChatMessage,
  OpenAIChatModel,
  generateText,
  streamText,
} from "modelfusion";
import { compilePrompt } from "./compilePrompt";
import { recipeSchema } from "./createMealPlan";
import { ZodSchema } from "./utils";
import zodToJsonSchema from "zod-to-json-schema";

export const updateRecipePrompt = [
  OpenAIChatMessage.system(
    `You are a private chef preparing a meal plan for your customer. ` +
      `You need to update a recipe based on your customer's feedback. `
  ),
  OpenAIChatMessage.assistant(`{{ mealPlan }}`),
  OpenAIChatMessage.user(`Customer feedback: {{ feedback }}.`.trim()),
];

export const updateRecipeFunction = {
  name: "updateRecipe",
  description: "Update a recipe based on the customer's feedback.",
  parameters: zodToJsonSchema(recipeSchema),
};

export const updateRecipeStructure = {
  name: updateRecipeFunction.name,
  schema: new ZodSchema(recipeSchema),
  description: updateRecipeFunction.description,
};

export type UpdateRecipeVars = {
  mealPlan: string;
  feedback: string;
};

export async function updateRecipe(
  vars: UpdateRecipeVars,
  stream: false
): Promise<string>;
export async function updateRecipe(
  vars: UpdateRecipeVars,
  stream: true
): Promise<AsyncIterable<string>>;
export async function updateRecipe(
  vars: UpdateRecipeVars,
  stream: boolean
): Promise<AsyncIterable<string> | string> {
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateText(model, compilePrompt(updateRecipePrompt, vars));
  } else {
    return await streamText(model, compilePrompt(updateRecipePrompt, vars));
  }
}
