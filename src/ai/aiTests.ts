import { EvaluateTestSuite, generateTable } from "promptfoo";
import { z } from "zod";
import promptfoo from "promptfoo";
import dotenv from "dotenv";
import {
  pickProductFunction,
  pickProductPrompt,
  pickProductSchema,
} from "./prompts/pickProduct";
import { exampleProductData } from "../grocers/sainsburys";
import {
  extractIngredientsFunction,
  extractIngredientsPrompt,
  ingredientExtractorSchema,
} from "./prompts/extractIngredients";

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

const promptTests: Record<string, EvaluateTestSuite> = {
  "pick-product": {
    ...testOptions({
      prompt: pickProductPrompt,
      functions: [pickProductFunction],
    }),
    tests: [
      {
        vars: {
          ingredient: "firm tofu",
          productSearchResults: JSON.stringify(exampleProductData.slice(0, 10)),
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
Lunch Plan
Day 1: Tofu Stir-Fry
Ingredients: Firm tofu, bell peppers, onions, soy sauce, olive oil
Protein Source: Firm tofu
Steps:
Pan-fry cubed tofu until golden.
Stir-fry bell peppers and onions.
Mix with soy sauce.
Day 2: Chicken Teriyaki Rice Bowl
Ingredients: Chicken breast, teriyaki sauce, rice, broccoli
Protein Source: Chicken breast
Steps:
Grill chicken and coat with teriyaki sauce.
Steam rice and broccoli.
Assemble in a bowl.
Dinner Plan
Day 1: Beef and Broccoli Stir-Fry
Ingredients: Beef strips, broccoli, garlic, soy sauce, olive oil
Protein Source: Beef strips
Steps:
Stir-fry beef strips until brown.
Add broccoli and garlic.
Drizzle soy sauce and cook until broccoli is tender.
Day 2: Spicy Prawn Noodles
Ingredients: Prawns, noodles, chili flakes, garlic, olive oil
Protein Source: Prawns
Steps:
Cook noodles.
Sauté prawns and garlic.
Toss with noodles and chili flakes.          
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
