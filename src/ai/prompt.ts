// Meal Plan Agent

import { z } from "zod";

// considerations:
// 1. calories / macros
// 2. cuisine preferences
// 3. examples of foods you like
// 3. time
// 4. equipment
// 5. budget
// 6. dietary restrictions
// 7. number of meals per day
// 8. snacks

const mealSchema = z.object({
  meal: z.string(),
});

const mealPlanSchema = z.object({
  monday: mealSchema,
  tuesday: mealSchema,
  wednesday: mealSchema,
  thursday: mealSchema,
  friday: mealSchema,
  saturday: mealSchema,
  sunday: mealSchema,
});

// would be good to be able to give feedback on specific recipes

// Ingredient Extractor Prompt

const ingredientExtractorSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      specialConsiderations: z.string().optional(),
    })
  ),
});

// foreach ingredient grocer.search(ingredient.name) returns
// a big array of products
//  {
//    "name": "Cauldron Vegan Tofu Block 396g",
//    "url": null,
//    "price": "£2.75",
//    "rating": "4.5 out of 5, 39 reviews"
//  },
//  {
//    "name": "Sainsbury's SO Organic Super Firm Tofu 300g",
//    "url": null,
//    "price": "£1.85",
//    "rating": "3.8 out of 5, 32 reviews"
//  },
// ...

// Ingredient Purchasing Agent

// pick a product, add to cart

// considerations:
// 1. quantity of ingredient - this is just a test meal, try to pick something that is not too much or too little
// 2. price - match what the user is willing to pay

// added all items to cart, now the user can login
// check all ingredients are needed, read side-by-side with the recipes
