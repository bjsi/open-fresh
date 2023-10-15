import { Sainsburys, formatProduct } from "grocer-agent";
import dotenv from "dotenv";
import {
  Ingredient,
  extractIngredients,
  formatIngredient,
  ingredientExtractorSchema,
  ingredientSchema,
} from "shared-lib";
import { pickProduct } from "shared-lib";
import * as R from "remeda";
import { createMealPlan, formatMeal, recipeSchema } from "shared-lib";
import { program } from "commander";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { z } from "zod";
import { suggestReplacementIngredient } from "shared-lib";
import { Grocer } from "grocer-agent";

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
      return fragment.value.recipes;
    } else {
      console.clear();
      console.log("Creating meal plan...");
      console.log(JSON.stringify(fragment.value, null, 2));
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
  grocer: Grocer;
  mealPlanData: MealPlanFileData;
  mealPlanFile: string;
  requirements: string;
  ingredients: Ingredient[];
}) => {
  for (let i = 0; i < args.ingredients.length; i++) {
    const ingredient = args.ingredients[i];
    const products = await args.grocer.search({
      query: ingredient.genericName,
    });
    if (products.type !== "success") {
      console.log(products);
      return;
    }

    const choice = await pickProduct(
      {
        ingredient: formatIngredient(ingredient),
        customerContext: args.requirements,
        productSearchResults: products.data.map(formatProduct).join("\n\n"),
      },
      false
    );

    console.log(JSON.stringify(choice, null, 2));

    const itemUrl =
      products.data.find((p) => p.id === choice.productId)?.url ?? "";
    if (!choice || !choice.productName || !itemUrl) {
      console.log(
        `${ingredient.name} is not available. Finding replacements...`
      );
      const replacementIngredients = await suggestReplacementIngredient(
        {
          ...ingredient,
          mealsUsedIn: ingredient.mealsUsedIn.join(", "),
          customerContext: args.requirements,
        },
        false
      );

      // splice in the replacement ingredients
      const newIngredients = [...args.ingredients];
      newIngredients.splice(
        args.ingredients.findIndex((i) => i.name === ingredient.name),
        1,
        ...replacementIngredients.replacementIngredients
      );

      writeMealPlanFile(args.mealPlanFile, {
        ...args.mealPlanData,
        ingredients: newIngredients,
      });

      await addAllIngredientsToCart({
        grocer: args.grocer,
        mealPlanData: {
          ...args.mealPlanData,
          // only use the ingredients that haven't been added yet
          ingredients: newIngredients.slice(i),
        },
        mealPlanFile: args.mealPlanFile,
        requirements: args.requirements,
        // only use the ingredients that haven't been added yet
        ingredients: newIngredients.slice(i),
      });

      return;
    }

    const res = await args.grocer.addToCart({
      itemUrl,
      quantity: choice.numToAddToCart,
    });

    console.log(res);
  }
};

program.version("1.0.0");

program
  .command("plan")
  .option("-r, --requirements <file>", "Requirements file for the meal plan")
  .description("Create a new meal plan")
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

const mealPlanFileSchema = z.object({
  meals: recipeSchema.array(),
  requirements: z.string(),
  ingredients: ingredientSchema.array().optional(),
});

type MealPlanFileData = z.infer<typeof mealPlanFileSchema>;

function writeMealPlanFile(
  fileName: string,
  data: MealPlanFileData
): MealPlanFileData {
  fs.writeFileSync(
    path.join(__dirname, fileName),
    JSON.stringify(data, null, 2)
  );
  return data;
}

function readMealPlanFile(fileName: string): MealPlanFileData | undefined {
  try {
    const json = JSON.parse(
      fs.readFileSync(path.join(__dirname, fileName), "utf-8")
    );
    const parsed = mealPlanFileSchema.safeParse(json);
    if (!parsed.success) {
      console.log(parsed.error);
      return undefined;
    } else {
      return parsed.data;
    }
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

program
  .command("order <mealPlanFile>")
  .description("Order ingredients from a meal plan file")
  .action(async (mealPlanFile: string) => {
    const mealPlanData = readMealPlanFile(mealPlanFile);
    if (!mealPlanData) {
      return;
    }

    let ingredients: Ingredient[];

    if (mealPlanData.ingredients) {
      // Ingredients already exist in the JSON
      console.log("Ingredients found in meal plan:", mealPlanData.ingredients);
      ingredients = mealPlanData.ingredients;
    } else {
      // Ingredients need to be extracted
      ingredients = await extractAndLogIngredients({
        meals: mealPlanData.meals.map(formatMeal),
      });
      writeMealPlanFile(mealPlanFile, {
        ...mealPlanData,
        ingredients,
      });
    }

    const grocer = await Sainsburys.create();

    const loginRes = await grocer.login();
    await grocer.clearCart();

    await addAllIngredientsToCart({
      grocer,
      mealPlanData,
      mealPlanFile,
      ingredients,
      requirements: mealPlanData.requirements,
    });
  });

program.parse(process.argv);
