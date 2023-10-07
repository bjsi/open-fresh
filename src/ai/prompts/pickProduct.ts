import {
  OpenAIChatMessage,
  OpenAIChatModel,
  StructureStreamPart,
  generateStructure,
  streamStructure,
} from "modelfusion";
import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";
import { ZodSchema } from "./utils";
import { compilePrompt } from "./compilePrompt";

export const pickProductPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef purchasing ingredients for your customer's meals. ` +
      `You are shown a list of products for a given ingredient and you must pick the best one, taking into account the following things:\n` +
      `- Try to match the quantity of ingredient required to minimize waste.\n` +
      `- Try to pick the highest quality products for the customer's budget.\n` +
      `Give a couple of sentences of reasoning for your choice.`
  ),
  OpenAIChatMessage.user(
    `
Ingredient: {{ ingredient }}

Customer context: {{ customerContext }}

Quantity: {{ quantity }}

Product search results:
{{ productSearchResults }}
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

const pickProductStructure = {
  name: pickProductFunction.name,
  schema: new ZodSchema(pickProductSchema),
  description: pickProductFunction.description,
};

type PickProductVars = {
  ingredient: string;
  customerContext: string;
  quantity: string;
  productSearchResults: string;
};

export async function pickProduct(
  vars: PickProductVars,
  stream: true
): Promise<
  AsyncIterable<StructureStreamPart<z.infer<typeof pickProductSchema>>>
>;
export async function pickProduct(
  vars: PickProductVars,
  stream: false
): Promise<z.infer<typeof pickProductSchema>>;
export async function pickProduct(vars: PickProductVars, stream: boolean) {
  console.log(
    `Picking the best product for ${vars.ingredient} (${vars.quantity})...`
  );
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateStructure(
      model,
      pickProductStructure,
      compilePrompt(pickProductPrompt, vars)
    );
  } else {
    return await streamStructure(
      model,
      pickProductStructure,
      compilePrompt(pickProductPrompt, vars)
    );
  }
}
