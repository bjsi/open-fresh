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
      `You need to collect the ingredients required for the meals into a list so you can purchase them.`
  ),
  OpenAIChatMessage.user(`Meal plan: {{ mealPlans }}`.trim()),
];

export const ingredientExtractorSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string(),
      totalQuantity: z.string(),
      mealsUsedIn: z.string().array(),
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
    name: "Extra Firm Tofu",
    totalQuantity: "200g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    name: "Bread",
    totalQuantity: "100g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    name: "Nutritional Yeast",
    totalQuantity: "20g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    name: "Turmeric",
    totalQuantity: "5g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    name: "Oil",
    totalQuantity: "10g",
    mealsUsedIn: [
      "Tofu Scramble Sandwich",
      "Spicy Chinese Szechuan Noodles with Chicken",
    ],
  },
  {
    name: "Pickles",
    totalQuantity: "50g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    name: "Spinach",
    totalQuantity: "100g",
    mealsUsedIn: [
      "Tofu Scramble Sandwich",
      "Spicy Chinese Szechuan Noodles with Chicken",
    ],
  },
  {
    name: "Chinese Noodles",
    totalQuantity: "100g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    name: "Chicken Breast",
    totalQuantity: "200g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    name: "Ginger",
    totalQuantity: "10g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    name: "Garlic",
    totalQuantity: "10g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    name: "Szechuan Peppercorns",
    totalQuantity: "5g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    name: "Soy Sauce",
    totalQuantity: "20ml",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    name: "Sesame Seeds",
    totalQuantity: "5g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
  {
    name: "Red Chilis",
    totalQuantity: "10g",
    mealsUsedIn: ["Spicy Chinese Szechuan Noodles with Chicken"],
  },
];
