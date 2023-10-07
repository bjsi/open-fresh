# Open Fresh

An Open Source AI version of Hello Fresh.

## Features

- The AI prepares a custom meal plan tailored to you.
- The AI collects the ingredients required across all meals into a list.
- The AI uses selenium to go to your grocer of choice and adds the ingredients to your cart.
- All you need to do is check out!

## Command Line Interface

The program is split into two parts - creating a meal plan and ordering ingredients.

### Creating Meal Plans

To create a new meal plan, you can use the `create-meal-plan command`. This allows you to specify meal requirements via an optional requirements file or interactive prompts.

#### Using a Requirements File

If you have a requirements file, you can pass it as an option:

```bash
npm run dev -- create-meal-plan -r path/to/requirements.txt
```

#### Without a Requirements File

If you don't use a requirements file, the CLI will ask you for meal requirements interactively:

```bash
npm run dev -- create-meal-plan
```

### Ordering Ingredients

To order ingredients based on a pre-existing meal plan, use the order-ingredients command:

```bash
npm run dev -- order-ingredients path/to/meal-plan.txt
```

This will extract the ingredients from the meal plan and use web browser automation to add them to your cart. All you need to do is check out!

## Development

### Supporting More Grocery Websites

Supported sites:

- [x] Sainsburys

To add support for a new site:

- extend the `Grocer` class.
- implement the `login`, `search` and `addToCart` methods.

### Prompt Evals

- see `aiTests.ts` for prompt tests
- `npm run test` to run the entire prompt test suite
- `npm run test <test name>` to run a particular test
