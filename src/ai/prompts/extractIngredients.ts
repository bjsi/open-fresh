import { z } from "zod";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  generateStructure,
} from "modelfusion";
import zodToJsonSchema from "zod-to-json-schema";
import { ZodSchema } from "./utils";
import { compilePrompt } from "./compilePrompt";

export const extractIngredientsPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef purchasing ingredients for your customer's meals. ` +
      `You need to collect the ingredients required for the meals into a list so you can purchase them.`
  ),
  OpenAIChatMessage.user(`Meal plan: {{ mealPlan }}`.trim()),
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

export const extractIngredientsFunction = {
  name: "extractIngredients",
  description: "Extract ingredient information from a meal plan.",
  parameters: zodToJsonSchema(ingredientExtractorSchema),
};

export const extractIngredients = async (vars: { mealPlan: string }) => {
  const text = await generateStructure(
    new OpenAIChatModel({
      model: "gpt-4",
    }),
    {
      name: extractIngredientsFunction.name,
      schema: new ZodSchema(ingredientExtractorSchema),
      description: extractIngredientsFunction.description,
    },
    compilePrompt(extractIngredientsPrompt, vars)
  );
  return text;
};

export const exampleIngredients = [
  {
    name: "Bread",
    totalQuantity: "100g",
    mealsUsedIn: ["Tofu Scramble Sandwich"],
  },
  {
    name: "Extra Firm Tofu",
    totalQuantity: "200g",
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
