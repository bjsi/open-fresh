import {
  OpenAIChatMessage,
  OpenAIChatModel,
  StructureStreamPart,
  generateStructure,
  streamStructure,
} from "modelfusion";
import { compilePrompt } from "./compilePrompt";
import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";
import { ZodSchema } from "./utils";

export const mealPlanPrompt = [
  OpenAIChatMessage.system(
    `You are a private chef preparing a meal plan for your customer. ` +
      `You need to create a meal plan that meets your customer's requirements. ` +
      `For each meal, write a detailed recipe that includes the meal type (breakfast, lunch, dinner, snack etc.), the ingredients, cooking instructions and day. ` +
      `You should write ingredient quantities in grams. `
  ),
  OpenAIChatMessage.user(`Customer requirements: {{ requirements }}.`.trim()),
];

type CreateMealPlanVars = {
  requirements: string;
};

type MealPlan = z.infer<typeof createMealPlanSchema>;

export const createMealPlanSchema = z.object({
  mealRecipes: z.array(z.string()),
});

export const createMealPlanFunction = {
  name: "createMealPlan",
  description: "Create a meal plan.",
  parameters: zodToJsonSchema(createMealPlanSchema),
};

const createMealPlanStructure = {
  name: createMealPlanFunction.name,
  schema: new ZodSchema(createMealPlanSchema),
  description: createMealPlanFunction.description,
};

export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: false
): Promise<MealPlan>;
export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: true
): Promise<AsyncIterable<StructureStreamPart<MealPlan>>>;
export async function createMealPlan(
  vars: CreateMealPlanVars,
  stream: boolean
): Promise<
  | AsyncIterable<StructureStreamPart<MealPlan>>
  | z.infer<typeof createMealPlanSchema>
> {
  const model = new OpenAIChatModel({
    model: "gpt-4",
  });
  if (!stream) {
    return await generateStructure(
      model,
      createMealPlanStructure,
      compilePrompt(mealPlanPrompt, vars)
    );
  } else {
    return await streamStructure(
      model,
      createMealPlanStructure,
      compilePrompt(mealPlanPrompt, vars)
    );
  }
}

export const exampleMealPlan = `
LUNCH - Tofu Scramble Sandwich

Ingredients:
- Bread (100g)
- Extra Firm Tofu (200g)
- Nutritional Yeast (20g)
- Turmeric (5g)
- Oil (10g)
- Pickles (50g)
- Spinach (50g)

Instructions:
1. Drain and press the tofu to remove as much water as possible.
2. Heat the oil in a pan and crumble in the tofu.
3. Add the nutritional yeast, turmeric, and a good pinch of salt and pepper to the pan.
4. Scramble everything together until heated through.
5. Toast the bread and make a sandwich with the tofu scramble, pickles, and spinach.

DINNER - Spicy Chinese Szechuan Noodles with Chicken

Ingredients:
- Chinese Noodles (100g)
- Chicken Breast (200g)
- Ginger (10g)
- Garlic (10g)
- Szechuan Peppercorns (5g)
- Soy Sauce (20ml)
- Sesame Seeds (5g)
- Red Chilis (10g)
- Spinach (50g)

Instructions:
1. Cook the noodles according to the package instructions.
2. Slice the chicken breast into thin strips.
3. Heat the oil in a pan and fry the ginger, garlic, and Szechuan peppercorns for a minute or two until fragrant.
4. Add the chicken to the pan and fry until cooked through.
5. Add the soy sauce, red chilis, and sesame seeds to the pan and stir everything together.
6. Add the cooked noodles to the pan and mix thoroughly so the noodles are coated in sauce.
7. Wilt the spinach in the pan, stir through the noodles, and serve.

Both of these meals are high in protein and should be suitable for your dietary needs. The tofu scramble sandwich is packed with protein thanks to the tofu and nutritional yeast, and the Szechuan noodles have plenty of protein from the chicken. The dishes also contain a good amount of vegetables per serving. The total cost for the ingredients should be well within your 45 GBP budget for the week, assuming you have basic ingredients like oil, salt, and pepper at home.
`.trim();
