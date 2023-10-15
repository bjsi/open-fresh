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
    `You are a personal chef purchasing ingredients for a customer's meals. ` +
      `You must match the quantity of ingredient required to minimize waste. ` +
      `Assume that any left over ingredients will be thrown out. ` +
      `Higher quality products are preferable, but should not be chosen if they are too expensive for the customer's budget. ` +
      `You should also consider the contexts in which the ingredient will be used. ` +
      `Give a couple of sentences of reasoning for your choice.`
  ),
  OpenAIChatMessage.user(
    `
Ingredient:
{{ ingredient }}

Customer context:
{{ customerContext }}

Quantity:
{{ quantity }}

Product search results:
{{ productSearchResults }}
`.trim()
  ),
];

export const pickProductSchema = z.object({
  reasoning: z.string(),
  productName: z.string(),
  productId: z.number(),
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
  console.log(`Picking the best product for ${vars.ingredient}...`);
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
