import { Builder } from "selenium-webdriver";
import { Sainsburys } from "./grocers/sainsburys";
import dotenv from "dotenv";
import {
  Ingredient,
  exampleIngredients,
  extractIngredients,
  ingredientExtractorSchema,
} from "./ai/prompts/extractIngredients";
import { pickProduct } from "./ai/prompts/pickProduct";
import * as R from "remeda";
import { createMealPlanForDay } from "./ai/prompts/createMealPlan";

dotenv.config();

const requirements = `
Create a lunch and dinner plan for me for the week.
Each meal should take max 20 mins to create.
I like spicy asian food, like noodles and curry, korean, indian, chinese are all good.
For lunch I also like to eat sandwiches with pickles.
I go to the gym a lot so I need lots of vegetables and very high protein (50+grams per meal).
The total cost for the week should come to less than 45 GBP.
`.trim();

const createWeekOfMeals = async () => {
  const days = [
    "Monday",
    // "Tuesday",
    // "Wednesday",
    // "Thursday",
    // "Friday",
    // "Saturday",
    // "Sunday",
  ];
  const meals: string[] = [];
  console.log("Creating week of meals...");
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    console.log(`Creating meal plan for ${day}...`);
    const mealPlanStream = await createMealPlanForDay(
      {
        requirements,
        day,
      },
      true
    );
    for await (const textFragment of mealPlanStream) {
      process.stdout.write(textFragment);
      if (meals[i] === undefined) {
        meals[i] = "";
      }
      meals[i] += textFragment;
    }
  }
  console.log("Done.");
  return meals;
};

const extractIngredientsFromWeekOfMeals = async (args: {
  weekOfMeals: string[];
}) => {
  console.log("Extracting ingredients...");
  const ingredientsStream = await extractIngredients(
    {
      mealPlans: args.weekOfMeals.join("\n"),
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
  ingredients: Ingredient[];
  test?: boolean;
}) => {
  const driver = await new Builder().forBrowser("chrome").build();
  const grocer = new Sainsburys(driver);

  await grocer.login();

  for (const ingredient of args.ingredients) {
    const products = await grocer.search({
      query: ingredient.name,
      test: args.test,
    });
    if (products.type === "success") {
      const choice = await pickProduct(
        {
          ingredient: ingredient.name,
          customerContext: requirements,
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

      // TODO: selenium errs here
      // TODO: need to be logged in to add to cart
      const res = await grocer.addToCart({
        itemUrl:
          products.data.find((p) => p.name === choice.productName)?.url ?? "",
        quantity: choice.numToAddToCart,
      });

      console.log(res);
    }
  }
};

async function main() {
  // const weekOfMeals = await createWeekOfMeals();
  // const ingredients = await extractIngredientsFromWeekOfMeals({
  //   weekOfMeals,
  // });
  const ingredients = exampleIngredients;
  await addAllIngredientsToCart({ ingredients, test: true });
}

main();
