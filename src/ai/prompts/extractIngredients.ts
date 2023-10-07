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
      `For each ingredient, use generic ingredient names focusing only on the core item without the preparation state. ` +
      `Ignore salt and pepper and cooking oil. ` +
      `Include any details that are important to the ingredient, such as the type of tofu or the type of noodles. `
  ),
  OpenAIChatMessage.user(`Meal plan: {{ mealPlans }}`.trim()),
];

export const ingredientExtractorSchema = z.object({
  ingredients: z.array(
    z.object({
      genericName: z.string(),
      totalQuantity: z.string(),
      mealsUsedIn: z.string().array(),
      details: z.string().optional(),
    })
  ),
});

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

export const exampleIngredients = [
  {
    genericName: "Extra Firm Tofu",
    totalQuantity: "200g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    genericName: "Bread",
    totalQuantity: "100g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    genericName: "Nutritional Yeast",
    totalQuantity: "20g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    genericName: "Turmeric",
    totalQuantity: "5g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    genericName: "Oil",
    totalQuantity: "10g",
    mealsUsedIn: [
      "Tofu Scramble Sandwich",
      "Spicy Chinese Szechuan Noodles with Chicken",
    ],
  },
  {
    genericName: "Pickles",
    totalQuantity: "50g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    genericName: "Spinach",
    totalQuantity: "100g",
    mealsUsedIn: [
      "Tofu Scramble Sandwich",
      "Spicy Chinese Szechuan Noodles with Chicken",
    ],
  },
  {
    genericName: "Chinese Noodles",
    totalQuantity: "100g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    genericName: "Chicken Breast",
    totalQuantity: "200g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    genericName: "Ginger",
    totalQuantity: "10g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    genericName: "Garlic",
    totalQuantity: "10g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    genericName: "Szechuan Peppercorns",
    totalQuantity: "5g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    genericName: "Soy Sauce",
    totalQuantity: "20ml",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    genericName: "Sesame Seeds",
    totalQuantity: "5g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    genericName: "Red Chilis",
    totalQuantity: "10g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
];
