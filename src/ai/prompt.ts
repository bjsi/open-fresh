// Meal Plan Agent

import { z } from "zod";
import { ProductSearchResult } from "../grocers/grocer";
import { OpenAIChatMessage } from "modelfusion";

// would be good to be able to give feedback on specific recipes

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

// export const fixNextTypeError = async (config: FixNextTypeErrorConfig) => {
//   const messages = [
//     OpenAIChatMessage.system(
//       `Two expert TypeScript programmers are fixing a type error. ` +
//         `Their type error solving strategy is as follows: 1) They read the error context source code thoroughly and note any details that could help solve the type error. ` +
//         `2) They come up with hypotheses and debate the best way to fix the error. 3) They agree on a next step and take it.`
//     ),
//   ];

//   const typeErrs = await trpc.getNextTypeErrorInFile.query({
//     file: config.startFile,
//   });
//   if (!typeErrs.success) {
//     console.log("Failed to get type errors");
//     return;
//   }

//   const typeErr = typeErrs.data;
//   const context = typeErr.source_code;

//   messages.push(
//     OpenAIChatMessage.user(
//       `Error:
// ${JSON.stringify(omit(typeErr, ["source_code"]), null, 2)}

// Please look at the context below and reason about what to do next:

// Context:
// ${context}
// `.trim()
//     )
//   );

//   const runId = new Date().toISOString();
//   const runLogFile = projectRoot + "/runs/" + runId + ".json";

//   while (true) {
//     const msgs = JSON.stringify(messages, null, 2);
//     console.log(msgs);
//     if (config.runLoggingEnabled) {
//       writeFileSync(runLogFile, msgs, "utf-8");
//     }
//     try {
//       const { tool, parameters, result, text } = await useToolOrGenerateText(
//         new OpenAIChatModel({
//           model: config.modelName ?? "gpt-4",
//           temperature: 0,
//           maxCompletionTokens: 2000,
//         }),
//         [
//           findDeclaration,
//           getSourceCode,
//           getSourceCodeFor,
//           searchTool,
//           writeTextToFile,
//           taskComplete,
//         ],
//         OpenAIChatFunctionPrompt.forToolsCurried(messages)
//       );

//       switch (tool) {
//         case null: {
//           console.log(`TEXT: ${result}\n`);
//           messages.push(OpenAIChatMessage.assistant(text));
//           break;
//         }
//         case "taskComplete":
//           console.log(`TASK COMPLETE\n`);
//           break;
//         default:
//           console.log(
//             `TOOL: ${tool}\nPARAMETERS: ${JSON.stringify(
//               parameters,
//               null,
//               2
//             )}\n`
//           );
//           messages.push(OpenAIChatMessage.toolCall({ text, tool, parameters }));
//           messages.push(OpenAIChatMessage.toolResult({ tool, result }));
//       }
//     } catch (e) {
//       if (e instanceof SchemaValidationError) {
//         console.log(`Schema validation error: ${e.message}`);
//         messages.push(OpenAIChatMessage.system(e.message));
//       }
//     }
//   }
// };

// pick a product, add to cart

// considerations:
// 1. quantity of ingredient - this is just a test meal, try to pick something that is not too much or too little
// 2. price - match what the user is willing to pay

// added all items to cart, now the user can login
// check all ingredients are needed, read side-by-side with the recipes
