<h1 align="center">
    <img src="https://raw.githubusercontent.com/bjsi/open-fresh/main/img/open-fresh-logo.png" alt="Open Fresh Logo" height="200">
    <br/>
    Open Fresh - 🍔 An Open Source, AI-enabled meal service
</h1>

<h3 align="center">Generate a meal plan and have the AI order the ingredients for you. All you need to do is check out!</h3>

<br/>

## 🚀 Overview

Welcome to Open Fresh, an AI agent I built with GPT to help me improve my diet. The AI will generate a meal plan for you according to your tastes and order the ingredients from Sainsbury's. I use this every week to help me eat better and save time. I hope you find it useful too!

### ✨ Features

- **Custom Meal Plans**: The AI will prepares a custom meal plan tailored to you based on whatever dietary requirements you specify.
- **Automated Grocery Shopping**: The AI agent uses Selenium to log in to your grocer of choice and add the ingredients to your cart.
- **Smart Ingredient Substitution**: If an ingredient is unavailable, the AI will find a suitable replacement and update the recipe.

<div align="center">
    <img src="https://raw.githubusercontent.com/bjsi/open-fresh/main/img/open-fresh-example.jpeg" alt="Open Fresh Example">
</div>

### 📽️ Tutorial

- TODO: Open Fresh will be hosted on a website soon. In the meantime, you can run it locally using the instructions below.

## How To Run

### Command Line Interface

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
