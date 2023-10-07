import { Builder } from "selenium-webdriver";
import { Sainsburys } from "./grocers/sainsburys";
import dotenv from "dotenv";
import {
  Ingredient,
  extractIngredients,
  ingredientExtractorSchema,
} from "./ai/prompts/extractIngredients";
import { pickProduct } from "./ai/prompts/pickProduct";
import * as R from "remeda";
import {
  createMealPlan,
  createMealPlanSchema,
} from "./ai/prompts/createMealPlan";
import { createDriverProxy } from "./selenium/driver";
import { program } from "commander";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

dotenv.config();

const createAndLogMealPlan = async (requirements: string) => {
  const meals: string[] = [];
  const mealPlanStream = await createMealPlan(
    {
      requirements,
    },
    true
  );
  for await (const fragment of mealPlanStream) {
    if (fragment.isComplete) {
      if (fragment.value.mealRecipes.length > 0) {
        console.log(R.last(fragment.value.mealRecipes));
      }
      return fragment.value.mealRecipes;
    } else {
      const parsed = createMealPlanSchema.safeParse(fragment.value);
      if (parsed.success) {
        console.clear();
        console.log("Creating meal plan...");
        console.log(parsed.data.mealRecipes.join("\n\n"));
      }
    }
  }
  console.log("Done.");
  return meals;
};

const extractAndLogIngredients = async (args: { meals: string[] }) => {
  console.log("Extracting ingredients...");
  const ingredientsStream = await extractIngredients(
    {
      mealPlans: args.meals.join("\n"),
    },
    true
  );
  let lastIdx = 0;
  for await (const fragment of ingredientsStream) {
    if (fragment.isComplete) {
      if (fragment.value.ingredients.length > 0) {
        console.log(R.last(fragment.value.ingredients));
      }
      console.log("Done.");
      return fragment.value.ingredients;
    } else {
      const parsed = ingredientExtractorSchema.safeParse(fragment.value);
      if (parsed.success && parsed.data.ingredients.length - 1 > lastIdx) {
        console.log(parsed.data.ingredients[lastIdx]);
        lastIdx = parsed.data.ingredients.length - 1;
      }
    }
  }
  return [];
};

const addAllIngredientsToCart = async (args: {
  requirements: string;
  ingredients: Ingredient[];
}) => {
  const driver = createDriverProxy(
    await new Builder().forBrowser("chrome").build()
  );
  const grocer = new Sainsburys(driver);

  await grocer.openLoginPage();
  const loginRes = await grocer.login();

  for (const ingredient of args.ingredients) {
    const products = await grocer.search({
      query: ingredient.genericName,
    });
    if (products.type !== "success") {
      console.log(products);
      return;
    }

    const choice = await pickProduct(
      {
        ingredient: ingredient.genericName,
        customerContext: args.requirements,
        quantity: ingredient.totalQuantity,
        productSearchResults: JSON.stringify(
          products.data.slice(0, 10),
          null,
          2
        ),
      },
      false
    );

    console.log(JSON.stringify(choice, null, 2));

    const res = await grocer.addToCart({
      itemUrl:
        products.data.find((p) => p.name === choice.productName)?.url ?? "",
      quantity: choice.numToAddToCart,
    });

    console.log(res);
  }
};

program.version("1.0.0");

program
  .command("create-meal-plan")
  .option("-r, --requirements <file>", "Requirements file for the meal plan")
  .description("Create and log a meal plan")
  .action(async (options) => {
    let requirements: string | undefined;

    if (options.requirements) {
      const reqFilePath = path.join(__dirname, options.requirements);
      requirements = fs.readFileSync(reqFilePath, "utf-8");
    } else {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "requirements",
          message: `Enter any requirements you have for the meal plan. Here are some ideas (optional!):

1. calories and macros
2. cuisines you like / examples of foods you like
6. dietary restrictions
3. time to cook each meal
5. budget (per week or per meal)
7. what meals per day (eg. breakfast, snack, lunch, snack, dinner)
`,
        },
      ]);

      requirements = answers.requirements;
    }

    const { filename } = await inquirer.prompt([
      {
        type: "input",
        name: "filename",
        message: "Enter the filename for the meal plan:",
        default: "meal-plan.txt",
      },
    ]);

    const filePath = path.join(__dirname, "meal-plans", filename);
    if (fs.existsSync(filePath)) {
      console.log("Error: Filename already exists.");
      return;
    }
    if (!requirements) {
      return;
    }

    const meals = await createAndLogMealPlan(requirements);

    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          requirements,
          meals,
        },
        null,
        2
      )
    );
  });

program
  .command("order-ingredients <mealPlanFile>")
  .description("Order ingredients based on a meal plan file")
  .action(async (mealPlanFile: string) => {
    const mealPlanData = fs.readFileSync(
      path.join(__dirname, mealPlanFile),
      "utf-8"
    );
    const json = JSON.parse(mealPlanData) as {
      meals: string[];
      requirements: string;
      ingredients?: Ingredient[];
    };

    let ingredients: Ingredient[];

    if (json.ingredients) {
      // Ingredients already exist in the JSON
      console.log("Ingredients found in meal plan:", json.ingredients);
      ingredients = json.ingredients;
    } else {
      // Ingredients need to be extracted
      ingredients = await extractAndLogIngredients({ meals: json.meals });
    }

    await addAllIngredientsToCart({
      ingredients,
      requirements: json.requirements,
    });
  });

program.parse(process.argv);
