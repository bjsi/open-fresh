// Ingredient Extractor Prompt

import { z } from "zod";

export const ingredientExtractorSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string(),
      totalQuantity: z.string(),
      meals: z.string().array(),
    })
  ),
});
