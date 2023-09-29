import { z } from "zod";
import { OpenAIChatMessage } from "modelfusion";
import zodToJsonSchema from "zod-to-json-schema";

export const extractIngredientsPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef purchasing ingredients for your customer's meals. ` +
      `You need to aggregate the ingredients required for the meals into a list so you can purchase them.`
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
  description: "Extract intgredient information from a meal plan.",
  parameters: zodToJsonSchema(ingredientExtractorSchema),
};
