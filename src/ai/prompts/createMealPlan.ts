import {
  OpenAIChatMessage,
  OpenAIChatModel,
  StructureStreamPart,
  generateStructure,
  streamStructure,
} from "modelfusion";
import { compilePrompt } from "./compilePrompt";
import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";
import { ZodSchema } from "./utils";

export const mealPlanPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef preparing recipes for your customer. ` +
      `You need to create recipes that meet your customer's requirements. ` +
      `For each recipe, write the meal type (eg. breakfast, lunch, dinner, snack etc.), the ingredients, cooking instructions and day. ` +
      `You should write ingredient quantities in grams. `
  ),
  OpenAIChatMessage.user(`Customer requirements: {{ requirements }}.`.trim()),
];

type CreateMealPlanVars = {
  requirements: string;
};

type MealPlan = z.infer<typeof createMealPlanSchema>;
export type Recipe = z.infer<typeof createMealPlanSchema>["recipes"][0];

export const createMealPlanSchema = z.object({
  recipes: z
    .object({
      name: z.string(),
      ingredients: z
        .object({
          name: z.string(),
          grams: z.string(),
        })
        .array(),
      instructions: z.string(),
      mealType: z.string(),
      day: z.string(),
    })
    .array(),
});

export const createMealPlanFunction = {
  name: "createRecipes",
  description: "Create recipes based on the customer's requirements.",
  parameters: zodToJsonSchema(createMealPlanSchema),
};

const createMealPlanStructure = {
  name: createMealPlanFunction.name,
  schema: new ZodSchema(createMealPlanSchema),
  description: createMealPlanFunction.description,
};

export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: false
): Promise<MealPlan>;
export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: true
): Promise<AsyncIterable<StructureStreamPart<MealPlan>>>;
export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: boolean
): Promise<
  | AsyncIterable<StructureStreamPart<MealPlan>>
  | z.infer<typeof createMealPlanSchema>
> {
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateStructure(
      model,
      createMealPlanStructure,
      compilePrompt(mealPlanPrompt, vars)
    );
  } else {
    return await streamStructure(
      model,
      createMealPlanStructure,
      compilePrompt(mealPlanPrompt, vars)
    );
  }
}
