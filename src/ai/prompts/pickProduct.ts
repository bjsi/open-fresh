import { OpenAIChatMessage } from "modelfusion";
import { ProductSearchResult } from "../../grocers/grocer";
import { MealPlan } from "./createMealPlan";
import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";

export const pickProductPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef purchasing ingredients for your customer's meals. ` +
      `You are shown a list of products for a given ingredient and you must pick the best one, taking into account the following criteria:\n` +
      `- Your customer's budget: Remember that this is just one ingredient for the customer's weekly meal plan.\n` +
      `- The quantity of ingredient required.\n` +
      `- The quality of the product.\n` +
      `Give a couple of sentences of reasoning for your choice.`
  ),
  OpenAIChatMessage.user(
    `
Ingredient: {{ ingredient }}
Customer context: {{ customerContext }}
Quantity: {{ quantity }}
Product search results: {{ productSearchResults }}
`.trim()
  ),
];

export const pickProductSchema = z.object({
  reasoning: z.string(),
  productName: z.string(),
  numToAddToCart: z.number(),
});

export const pickProductFunction = {
  name: "pickProduct",
  description: "Pick the best product from a list of products.",
  parameters: zodToJsonSchema(pickProductSchema),
};

export const pickProduct = async (
  ingredient: string,
  // useful context to know the user's budget
  customerContext: string,
  mealPlan: MealPlan,
  productSearchResults: ProductSearchResult[]
) => {};
