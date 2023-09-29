import { z } from "zod";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodStructureDefinition,
  generateStructure,
} from "modelfusion";
import zodToJsonSchema from "zod-to-json-schema";

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

type IngredientExtract = z.infer<typeof ingredientExtractorSchema>;

export const extractIngredientsFunction = {
  name: "extractIngredients",
  description: "Extract ingredient information from a meal plan.",
  parameters: zodToJsonSchema(ingredientExtractorSchema),
};

new ZodStructureDefinition<"extractIngredients", IngredientExtract>({
  name: "extractIngredients",
  schema: z.object({}),
});

export const extractIngredients = async (vars: { mealPlan: string }) => {
  const text = await generateStructure(
    new OpenAIChatModel({
      model: "gpt-4",
    }),
    {
      name: extractIngredientsFunction.name,
      schema: ingredientExtractorSchema,
      description: extractIngredientsFunction.description,
    },
    extractIngredientsPrompt
  );
};
