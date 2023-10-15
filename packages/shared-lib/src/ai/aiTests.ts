import { EvaluateTestSuite, generateTable } from "promptfoo";
import { z } from "zod";
import promptfoo from "promptfoo";
import dotenv from "dotenv";
import {
  pickProductFunction,
  pickProductPrompt,
  pickProductSchema,
} from "./prompts/pickProduct";
import { exampleProductData, formatProduct } from "../grocers/sainsburys";
import {
  extractIngredientsFunction,
  extractIngredientsPrompt,
  ingredientExtractorSchema,
} from "./prompts/extractIngredients";
import {
  createMealPlanFunction,
  createMealPlanSchema,
  formatMeal,
  mealPlanPrompt,
  recipeSchema,
} from "./prompts/createMealPlan";
import {
  SuggestReplacementIngredientsVars,
  formatReplacementIngredientsAsFeedback,
  suggestReplacementIngredient,
  suggestReplacementIngredientsFunction,
  suggestReplacementIngredientsPrompt,
  suggestReplacementIngredientsSchema,
} from "./prompts/suggestReplacementIngredients";
import {
  UpdateRecipeVars,
  updateRecipeFunction,
  updateRecipePrompt,
} from "./prompts/updateRecipe";

dotenv.config();

const testOptions = (opts: { prompt: Record<any, any>; functions?: any[] }) => {
  return {
    prompts: [JSON.stringify(opts.prompt)],
    providers: [
      {
        id: "openai:gpt-4",
        config: {
          functions: opts.functions,
        },
      },
    ],
    defaultTest: {
      options: {
        postprocess: "JSON.stringify(JSON.parse(output.arguments), null, 2)",
      },
    },
  };
};

const assertValidSchema = (schema: z.ZodSchema<any>) => {
  return {
    type: "javascript",
    value: (output: any) => {
      const json = JSON.parse(output);
      const validation = schema.safeParse(json);
      if (!validation.success) {
        return {
          pass: false,
          score: 0,
          reason: validation.error.message,
        };
      } else {
        return {
          pass: true,
          score: 1,
          reason: "Successfully parsed JSON using zod schema.",
        };
      }
    },
  } as const;
};

// considerations:
// 1. calories / macros
// incl. quantities
// 2. cuisines you like / examples of foods you like
// 6. dietary restrictions
// 3. time per meal
// 5. budget (per week or per meal)
// 7. what meals per day (eg. breakfast, snack, lunch, snack, dinner)

const promptTests: Record<string, EvaluateTestSuite> = {
  "replace-ingredient": {
    ...testOptions({
      prompt: suggestReplacementIngredientsPrompt,
      functions: [suggestReplacementIngredientsFunction],
    }),
    tests: [
      {
        vars: {
          name: "enchilada sauce",
          genericName: "enchilada sauce",
          totalQuantity: "1 cup",
          mealsUsedIn: "chicken enchiladas",
          customerContext: "I'm making chicken enchiladas for dinner.",
        } satisfies SuggestReplacementIngredientsVars,
        assert: [assertValidSchema(suggestReplacementIngredientsSchema)],
      },
    ],
  },
  "update-recipe": {
    ...testOptions({
      prompt: updateRecipePrompt,
      functions: [updateRecipeFunction],
    }),
    tests: [
      {
        vars: {
          mealPlan: formatMeal({
            name: "Gluten Free Enchiladas",
            ingredients: [
              {
                name: "Gluten Free Corn Tortillas",
                grams: "200",
              },
              {
                name: "Red Enchilada Sauce",
                grams: "400",
              },
              {
                name: "Chicken Breast",
                grams: "400",
              },
              {
                name: "Black Beans",
                grams: "200",
              },
              {
                name: "Cheese",
                grams: "200",
              },
            ],
            instructions:
              "Preheat oven to 375 degrees. Cook chicken until no longer pink. Fill tortillas with chicken and black beans, roll up and place in baking dish. Cover with enchilada sauce and cheese. Bake for 20 minutes or until cheese is bubbly.",
            mealType: "Dinner",
            day: "Monday",
          }),
          feedback: formatReplacementIngredientsAsFeedback("enchilada sauce", {
            reasoning:
              "Enchilada sauce is a key ingredient in chicken enchiladas, providing the dish with its characteristic flavor. If it's not available, a combination of tomato sauce, chili powder, and garlic powder can be used as a substitute. These ingredients together mimic the tangy, spicy, and slightly sweet flavor of enchilada sauce.",
            replacementIngredients: [
              {
                name: "tomato sauce",
                genericName: "tomato sauce",
                totalQuantity: "1 cup",
                mealsUsedIn: ["chicken enchiladas"],
              },
              {
                name: "chili powder",
                genericName: "chili powder",
                totalQuantity: "2 teaspoons",
                mealsUsedIn: ["chicken enchiladas"],
              },
              {
                name: "garlic powder",
                genericName: "garlic powder",
                totalQuantity: "1 teaspoon",
                mealsUsedIn: ["chicken enchiladas"],
              },
            ],
          }),
        } satisfies UpdateRecipeVars,
        assert: [assertValidSchema(recipeSchema)],
      },
    ],
  },
  "meal-plan": {
    ...testOptions({
      prompt: mealPlanPrompt,
      functions: [createMealPlanFunction],
    }),
    tests: [
      {
        vars: {
          requirements:
            `Create a lunch and dinner plan for me for me on Monday. ` +
            `each meal should take max 15 mins to create. ` +
            `I like asian food, but I live in the UK so can't get obscure ingredients. ` +
            `I go to the gym a lot so I need high protein.`,
        },
        assert: [assertValidSchema(createMealPlanSchema)],
      },
    ],
  },
  "pick-product": {
    ...testOptions({
      prompt: pickProductPrompt,
      functions: [pickProductFunction],
    }),
    tests: [
      {
        vars: {
          ingredient: "firm tofu",
          productSearchResults: JSON.stringify(
            exampleProductData.map(formatProduct).slice(0, 10)
          ),
          quantity: "1kg",
          customerContext:
            `Create a lunch and dinner plan for me. ` +
            `each meal should take max 15 mins to create. ` +
            `I like asian food, but I live in the UK so can't get obscure ingredients. ` +
            `I go to the gym a lot so I need high protein.`,
        },
        assert: [assertValidSchema(pickProductSchema)],
      },
    ],
  },
  "extract-ingredients": {
    ...testOptions({
      prompt: extractIngredientsPrompt,
      functions: [extractIngredientsFunction],
    }),
    tests: [
      {
        vars: {
          mealPlan: `
Lunch: Teriyaki Chicken Stir Fry
Ingredients:
- 200g chicken breast
- 100g broccoli
- 100g bell peppers
- 50g onion
- 30g teriyaki sauce
- 15g olive oil
- 5g sesame seeds
Instructions:
1. Cut the chicken breast into thin slices.
2. Heat the olive oil in a pan over medium heat.
3. Add the chicken to the pan and cook until it's no longer pink.
4. Add the broccoli, bell peppers, and onion to the pan and stir fry for about 5 minutes.
5. Pour the teriyaki sauce over the chicken and vegetables and stir well to combine.
6. Sprinkle the sesame seeds over the top and serve.

Dinner: Beef and Vegetable Stir Fry
Ingredients:
- 200g beef strips
- 100g bell peppers
- 100g snap peas
- 50g onion
- 30g soy sauce
- 15g olive oil
- 5g sesame seeds
Instructions:
1. Heat the olive oil in a pan over medium heat.
2. Add the beef strips to the pan and cook until they're browned.
3. Add the bell peppers, snap peas, and onion to the pan and stir fry for about 5 minutes.
4. Pour the soy sauce over the beef and vegetables and stir well to combine.
5. Sprinkle the sesame seeds over the top and serve.        
          `.trim(),
        },
        assert: [assertValidSchema(ingredientExtractorSchema)],
      },
    ],
  },
};

const main = async () => {
  const arg = process.argv[2];
  const tests = Object.entries(promptTests).filter(
    ([testName]) => !arg || testName === arg
  );
  if (!tests.length) {
    console.log(`No tests found for ${arg}`);
    return;
  }
  for (const [testName, test] of tests) {
    console.log(`Running test ${testName}`);
    const results = await promptfoo.evaluate(
      {
        ...test,
        env: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        },
      },
      {
        maxConcurrency: 2,
        showProgressBar: true,
      }
    );
    console.log(generateTable(results, Number.MAX_SAFE_INTEGER).toString());
  }
};

main();
