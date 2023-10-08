import {
  OpenAIChatMessage,
  OpenAIChatModel,
  StructureStreamPart,
  generateStructure,
  streamStructure,
} from "modelfusion";
import { z } from "zod";
import {
  extractIngredientsPrompt,
  ingredientSchema,
} from "./extractIngredients";
import { compilePrompt } from "./compilePrompt";
import { ZodSchema } from "./utils";
import zodToJsonSchema from "zod-to-json-schema";

export const suggestReplacementIngredientsPrompt = [
  OpenAIChatMessage.system(
    `You are a personal chef purchasing ingredients for a customer's meals. ` +
      `The desired ingredient you wanted is not available. ` +
      `You must find a replacement ingredient or combination of ingredients that will work in the recipe. ` +
      `Give a couple of sentences of reasoning for your choice.`
  ),
  OpenAIChatMessage.user(
    `
Desired Ingredient:
{{ ingredient }}

Desired Quantity:
{{ quantity }}

Meals Used In:
{{ mealsUsedIn }}

Customer context:
{{ customerContext }}
`.trim()
  ),
];

export const suggestReplacementIngredientsSchema = z.object({
  reasoning: z.string(),
  replacementIngredients: ingredientSchema.array(),
});

type SuggestReplacementIngredients = z.infer<
  typeof suggestReplacementIngredientsSchema
>;

export const suggestReplacementIngredientsFunction = {
  name: "suggestReplacementIngredients",
  description: "Suggest a replacement ingredient.",
  parameters: zodToJsonSchema(suggestReplacementIngredientsSchema),
};

export const suggestReplacementIngredientsStructure = {
  name: suggestReplacementIngredientsFunction.name,
  schema: new ZodSchema(suggestReplacementIngredientsSchema),
  description: suggestReplacementIngredientsFunction.description,
};

export const formatReplacementIngredientsAsFeedback = (
  unavailableIngredient: string,
  { replacementIngredients, reasoning }: SuggestReplacementIngredients
) => {
  return `
${unavailableIngredient} is not available.   

Please update the recipe to use the following ingredients as a replacement for ${unavailableIngredient}:
${replacementIngredients
  .map((ingredient) => {
    return `- ${ingredient.name} (${ingredient.totalQuantity})`;
  })
  .join("\n")}`;
};

export type SuggestReplacementIngredientsVars = {
  ingredient: string;
  quantity: string;
  mealsUsedIn: string;
  customerContext: string;
};

export async function suggestReplacementIngredient(
  vars: SuggestReplacementIngredientsVars,
  stream: false
): Promise<SuggestReplacementIngredients>;
export async function suggestReplacementIngredient(
  vars: SuggestReplacementIngredientsVars,
  stream: true
): Promise<AsyncIterable<StructureStreamPart<SuggestReplacementIngredients>>>;
export async function suggestReplacementIngredient(
  vars: SuggestReplacementIngredientsVars,
  stream: boolean
): Promise<
  | AsyncIterable<StructureStreamPart<SuggestReplacementIngredients>>
  | SuggestReplacementIngredients
> {
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateStructure(
      model,
      suggestReplacementIngredientsStructure,
      compilePrompt(extractIngredientsPrompt, vars)
    );
  } else {
    return await streamStructure(
      model,
      suggestReplacementIngredientsStructure,
      compilePrompt(extractIngredientsPrompt, vars)
    );
  }
}
