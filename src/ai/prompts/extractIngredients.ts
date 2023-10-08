import { z } from "zod";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  StructureStreamPart,
  generateStructure,
  streamStructure,
} from "modelfusion";
import zodToJsonSchema from "zod-to-json-schema";
import { ZodSchema } from "./utils";
import { compilePrompt } from "./compilePrompt";

export const extractIngredientsPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef purchasing ingredients for your customer's meals. ` +
      `You need to extract the raw ingredients required for the meals into a list so you can purchase them. ` +
      `For each ingredient, include the generic ingredient name focusing only on the core item without the preparation state. ` +
      `Ignore salt and pepper and cooking oil. ` +
      `Include details about how the ingredient will be used, as this will help you to choose the right product. `
  ),
  OpenAIChatMessage.user(`Meal plan: {{ mealPlans }}`.trim()),
];

export const ingredientExtractorSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string(),
      genericName: z.string(),
      totalQuantity: z.string(),
      usedFor: z.string().array(),
    })
  ),
});

export const formatIngredient = (ingredient: Ingredient) => {
  return `
Name: ${ingredient.name}
Generic Name: ${ingredient.genericName}
Total Quantity: ${ingredient.totalQuantity}
Used For: ${ingredient.usedFor.join(", ")}
`.trim();
};

type IngredientExtractor = z.infer<typeof ingredientExtractorSchema>;

export type Ingredient = z.infer<
  typeof ingredientExtractorSchema
>["ingredients"][0];

export const extractIngredientsFunction = {
  name: "extractIngredients",
  description: "Extract ingredient information from a meal plan.",
  parameters: zodToJsonSchema(ingredientExtractorSchema),
};

const extractIngredientsStructure = {
  name: extractIngredientsFunction.name,
  schema: new ZodSchema(ingredientExtractorSchema),
  description: extractIngredientsFunction.description,
};

type ExtractIngredientsVars = {
  mealPlans: string;
};

export async function extractIngredients(
  vars: ExtractIngredientsVars,
  stream: false
): Promise<IngredientExtractor>;
export async function extractIngredients(
  vars: ExtractIngredientsVars,
  stream: true
): Promise<AsyncIterable<StructureStreamPart<IngredientExtractor>>>;
export async function extractIngredients(
  vars: ExtractIngredientsVars,
  stream: boolean
): Promise<
  AsyncIterable<StructureStreamPart<IngredientExtractor>> | IngredientExtractor
> {
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateStructure(
      model,
      extractIngredientsStructure,
      compilePrompt(extractIngredientsPrompt, vars)
    );
  } else {
    return await streamStructure(
      model,
      extractIngredientsStructure,
      compilePrompt(extractIngredientsPrompt, vars)
    );
  }
}
