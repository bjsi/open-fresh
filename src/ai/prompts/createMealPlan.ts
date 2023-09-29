// considerations:
// 1. calories / macros
// incl. quantities
// 2. cuisines you like / examples of foods you like
// 6. dietary restrictions
// 3. time per meal
// 5. budget (per week or per meal)
// 7. what meals per day (eg. breakfast, snack, lunch, snack, dinner)

import { z } from "zod";

const mealSchema = z.object({
  meal: z.string(),
});

export const mealPlanSchema = z.object({
  monday: mealSchema,
  tuesday: mealSchema,
  wednesday: mealSchema,
  thursday: mealSchema,
  friday: mealSchema,
  saturday: mealSchema,
  sunday: mealSchema,
});

export type MealPlan = z.infer<typeof mealPlanSchema>;
