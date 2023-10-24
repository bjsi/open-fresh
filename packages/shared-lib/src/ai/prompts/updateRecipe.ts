import {
  OpenAIChatMessage,
  OpenAIChatModel,
  StructureStreamPart,
  generateStructure,
  streamStructure,
} from "modelfusion";
import { compilePrompt } from "./compilePrompt";
import { MealPlan, Recipe, recipeSchema } from "./createMealPlan";
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
  stream: false,
  signal?: AbortSignal
): Promise<Recipe>;
export async function updateRecipe(
  vars: UpdateRecipeVars,
  stream: true,
  signal?: AbortSignal
): Promise<AsyncIterable<StructureStreamPart<Recipe>>>;
export async function updateRecipe(
  vars: UpdateRecipeVars,
  stream: boolean,
  signal?: AbortSignal
): Promise<AsyncIterable<StructureStreamPart<Recipe>> | Recipe> {
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateStructure(
      model,
      updateRecipeStructure,
      compilePrompt(updateRecipePrompt, vars),
      {
        run: {
          abortSignal: signal,
        },
      }
    );
  } else {
    return await streamStructure(
      model,
      updateRecipeStructure,
      compilePrompt(updateRecipePrompt, vars),
      {
        run: {
          abortSignal: signal,
        },
      }
    );
  }
}
