import { Builder } from "selenium-webdriver";
import { Sainsburys } from "./grocers/sainsburys";
import dotenv from "dotenv";
import { createMealPlan } from "./ai/prompts/createMealPlan";

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
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const meals: string[] = [];
  for (const day of days) {
    const mealPlan = await createMealPlan({
      requirements,
      day,
    });
    meals.push(mealPlan);
  }

  const ingredients = await extractIngredients(meals.join("\n"));

  const driver = await new Builder().forBrowser("chrome").build();
  const grocer = new Sainsburys(driver);
  //   await grocer.login();
  await grocer.search({ query: "tofu", test: true });
})();
