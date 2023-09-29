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
