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
import { ingredientSchema } from "./extractIngredients";

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

export type MealPlan = z.infer<typeof createMealPlanSchema>;

export const recipeSchema = z.object({
  mealType: z.string(),
  day: z.string(),
  name: z.string(),
  ingredients: z
    .object({
      name: z.string(),
      grams: z.string(),
    })
    .array(),
  instructions: z.string(),
});

export type Recipe = z.infer<typeof recipeSchema>;

export const createMealPlanSchema = z.object({
  recipes: recipeSchema.array(),
});

export const partialCreateMealPlanSchema = createMealPlanSchema.deepPartial();

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

export const partialRecipeSchema = recipeSchema.deepPartial();

const titleCase = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function formatMeal(meal: z.infer<typeof partialRecipeSchema>): string {
  return [
    formatHeading(meal.mealType, meal.day),
    formatName(meal.name),
    "<br/>",
    formatIngredients(meal.ingredients),
    "<br/>",
    formatInstructions(meal.instructions),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function formatHeading(mealType?: string, day?: string) {
  return mealType
    ? `### ${titleCase(mealType)}` + (day ? ` on ${day}` : "")
    : "";
}

function formatName(name?: string): string {
  return name ? `#### ${titleCase(name)}` : "";
}

function formatIngredients(
  ingredients?: { name?: string; grams?: string }[]
): string {
  if (!ingredients) return "";

  const formattedIngredients = ingredients
    .filter((ingredient) => ingredient.name && ingredient.grams)
    .map(
      (ingredient) =>
        `- ${ingredient.name} (${ingredient.grams?.replace("g$", "")}g)`
    )
    .join("\n");

  return formattedIngredients ? `Ingredients:\n${formattedIngredients}` : "";
}

function formatInstructions(instructions?: string): string {
  return instructions ? `Instructions:\n${instructions}` : "";
}

export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: false,
  signal?: AbortSignal
): Promise<MealPlan>;
export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: true,
  signal?: AbortSignal
): Promise<AsyncIterable<StructureStreamPart<MealPlan>>>;
export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: boolean,
  signal?: AbortSignal
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
      compilePrompt(mealPlanPrompt, vars),
      {
        run: {
          abortSignal: signal,
        },
      }
    );
  } else {
    return await streamStructure(
      model,
      createMealPlanStructure,
      compilePrompt(mealPlanPrompt, vars),
      {
        run: {
          abortSignal: signal,
        },
      }
    );
  }
}

export const mealPlanFileSchema = z.object({
  meals: recipeSchema.array(),
  requirements: z.string(),
  ingredients: ingredientSchema.array().optional(),
});
