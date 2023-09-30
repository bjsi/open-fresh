import { Builder } from "selenium-webdriver";
import { Sainsburys } from "./grocers/sainsburys";
import dotenv from "dotenv";
import { createMealPlan } from "./ai/prompts/createMealPlan";
import { extractIngredients } from "./ai/prompts/extractIngredients";
import { pickProduct } from "./ai/prompts/pickProduct";

dotenv.config();

const requirements = `
Create a lunch and dinner plan for me for the week.
Each meal should take max 20 mins to create.
I like spicy asian food, like noodles and curry, korean, indian, chinese are all good.
For lunch I also like to eat sandwiches with pickles.
I go to the gym a lot so I need lots of vegetables and very high protein (50+grams per meal).
The total cost for the week should come to less than 45 GBP.
`.trim();

(async function example() {
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
  console.log("Creating meal plan...");
  for (const day of days) {
    const mealPlan = await createMealPlan({
      requirements,
      day,
    });
    meals.push(mealPlan);
  }

  console.log(meals.join("\n\n"));

  console.log("Extracting ingredients...");
  const { ingredients } = await extractIngredients({
    mealPlan: meals.join("\n"),
  });

  console.log(JSON.stringify(ingredients, null, 2));

  const driver = await new Builder().forBrowser("chrome").build();
  const grocer = new Sainsburys(driver);

  for (const ingredient of ingredients) {
    const products = await grocer.search({ query: ingredient.name });
    if (products.type === "success") {
      const choice = await pickProduct({
        ingredient: ingredient.name,
        customerContext: requirements,
        quantity: ingredient.totalQuantity,
        productSearchResults: JSON.stringify(
          products.data.slice(0, 10),
          null,
          2
        ),
      });

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
})();
