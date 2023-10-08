import { By, Key, WebElement, until } from "selenium-webdriver";
import {
  Grocer,
  LOGIN_SUCCESS,
  LoginFail,
  SearchFail,
  ProductSearchResult,
  ADD_TO_CART_SUCCESS,
  AddToCartFail,
} from "./grocer";
import dotenv from "dotenv";
import { fail, success } from "../either";
import { filterAsync } from "./helpers";

dotenv.config();

export const exampleProductData: ProductSearchResult[] = [
  {
    name: "Cauldron Vegan Tofu Block 396g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/cauldron-original-tofu-396g",
    price: "£2.75",
    rating: "4.5 out of 5, 39 reviews",
  },
  {
    name: "Sainsbury's SO Organic Super Firm Tofu 300g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/sainsburys-so-organic-super-firm-tofu-300g",
    price: "£1.85",
    rating: "3.8 out of 5, 32 reviews",
  },
  {
    name: "Cauldron Vegan Marinated Tofu Pieces 160g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/cauldron-marinated-tofu-pieces-160g",
    price: "£2.85",
    rating: "4.2 out of 5, 38 reviews",
  },
  {
    name: "Clearspring Organic Japanese Silken & Smooth Tofu 300g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/clearspring-organic-tofu-300g",
    price: "£1.75",
    rating: "4.5 out of 5, 13 reviews",
  },
  {
    name: "The Tofoo Co. Teriyaki Tofu 280g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/the-tofoo-co-teriyaki",
    price: "£3.00",
    rating: "4.1 out of 5, 10 reviews",
  },
  {
    name: "Mori-Nu Silken Tofu Firm 349g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/mori-nu-silken-tofu-firm-349g",
    price: "£2.10",
    rating: "3.9 out of 5, 23 reviews",
  },
  {
    name: "SO Organic Super Firm Smoked Vegan Tofu 300g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/so-organic-super-firm-smoked-tofu-300g",
    price: "£2.50",
    rating: "3.5 out of 5, 13 reviews",
  },
  {
    name: "Plant Pioneers Vegan No Chicken Sweet & Sour with Tofu Fried...",
    url: "https://www.sainsburys.co.uk/gol-ui/product/plant-pioneer-s-s-tofu-fried-rice-400g",
    price: "£3.00",
    rating: "3.6 out of 5, 45 reviews",
  },
  {
    name: "Plant Pioneers Tofu Chunks in Soy & Spring Onion Sauce 225g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/plant-pioneers-tofu-chunks-in-soy-spring-onion-sauce-225g",
    price: "£1.25",
    rating: "2.3 out of 5, 8 reviews",
  },
  {
    name: "Plant Pioneers Tofu Chunks in Chilli & Garlic Sauce 225g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/plant-pioneers-tofu-chunks-in-chilli-garlic-sauce-225g",
    price: "£1.25",
    rating: "2.8 out of 5, 4 reviews",
  },
  {
    name: "The Tofoo Co. Naked Organic Tofu 280g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/tofoo-naked-tofu--organic-280g",
    price: "£2.30",
    rating: "4.8 out of 5, 40 reviews",
  },
  {
    name: "The Tofoo Co. Smoked Organic Tofu 225g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/tofoo-smoked-tofu--organic-225g",
    price: "£2.85",
    rating: "4.2 out of 5, 23 reviews",
  },
  {
    name: "The Tofoo Co. Naked Organic Tofu 450g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/the-tofoo-co-naked-xl-organic-tofu-450g",
    price: "£3.50",
    rating: "4.8 out of 5, 40 reviews",
  },
  {
    name: "Cauldron Quick & Tasty Tofu Block 250g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/cauldron-quick-tasty-tofu-block-250g",
    price: "£2.00",
    rating: "4.7 out of 5, 14 reviews",
  },
  {
    name: "Sainsbury's Plant Pioneers Tofu Burrito 400g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/sainsburys-plant-pioneers-tofu-burrito-400g",
    price: "£3.50",
    rating: "3.7 out of 5, 18 reviews",
  },
  {
    name: "S&B Japanese Instant Tofu Miso Soup 3x10g",
    url: "https://www.sainsburys.co.uk/gol-ui/product/s-b-japanese-instant-tofu-miso-soup-3x10g",
    price: "£3.50",
    rating: "5 out of 5, 1 reviews",
  },
  {
    name: "Aqua Libra Sparkling Water Infused with Blood Orange & Mango...",
    url: "https://www.sainsburys.co.uk/gol-ui/product/aqua-libra-sparkling-water-infused-with-blood-orange-mango-4x330ml",
    price: "£3.35",
  },
  {
    name: "Aqua Libra Sparkling Water Infused with Cucumber Mint & Lime...",
    url: "https://www.sainsburys.co.uk/gol-ui/product/aqua-libra-sparkling-water-infused-with-cucumber-mint-lime-4x330ml",
    price: "£3.35",
    rating: "3.2 out of 5, 32 reviews",
  },
];

function getUrlFromProduct(element: WebElement) {
  return element
    .findElement(By.css(".pt__link"))
    .getAttribute("href")
    .then((url) => url);
}

export const formatProduct = (product: ProductSearchResult) => {
  return `
Name: ${product.name}
Price: ${product.price}
Rating: ${product.rating} 
`.trim();
};

export class Sainsburys extends Grocer {
  async search(args: { query: string; test?: boolean }) {
    console.log(`Searching for ${args.query}...`);

    try {
      await this.driver.get(
        "https://www.sainsburys.co.uk/gol-ui/SearchResults/" +
          encodeURIComponent(args.query)
      );
      await this.acceptCookies();
      const resultsContainer = await this.driver.wait(
        until.elementLocated(By.css(".ln-o-grid.ln-o-grid--matrix")),
        5000
      );
      const elements = await resultsContainer.findElements(
        By.css(".pt__content")
      );
      const products = await Promise.all(elements.map(this.extractProductInfo));
      console.log(`Found ${products.length} products: `);
      console.log(products.map(formatProduct).join("\n\n"));
      return success(products);
    } catch (e) {
      console.log("Error searching.", e);
      return fail(SearchFail.SeleniumError);
    }
  }

  async extractProductInfo(element: WebElement): Promise<ProductSearchResult> {
    // Find the element containing the product name
    const productNameElement = await element.findElement(
      By.css('[data-test-id="product-tile-description"]')
    );
    const productLinkElement = await productNameElement.findElement(
      By.css("a")
    );
    const name = await productLinkElement.getAttribute("title");
    const url = await getUrlFromProduct(element);

    // Find the element containing the product price
    const productPriceElement = await element.findElement(
      By.css('[data-test-id="pt-retail-price"]')
    );
    const price = await productPriceElement.getText();

    const rating = await (
      await element.findElements(By.css('[data-testid="star-rating"]'))
    )[0]?.getAttribute("aria-label");

    // Create a JSON object
    const productInfo = {
      name,
      url,
      price,
      rating,
    };

    return productInfo;
  }

  async clearCart() {
    await this.driver.get("https://www.sainsburys.co.uk/gol-ui/trolley");
    await this.driver.wait(
      until.elementLocated(
        By.css('[data-test-id="open-modal-empty-trolley-button"]')
      ),
      5000
    );
    const emptyBtn = await this.driver.findElement(
      By.css('[data-test-id="open-modal-empty-trolley-button"]')
    );
    await emptyBtn.click();
    await this.driver.wait(
      until.elementLocated(By.css('[data-test-id="modal-primary-button"]')),
      5000
    );
    const confirmBtn = await this.driver.findElement(
      By.css('[data-test-id="modal-primary-button"]')
    );
    await confirmBtn.click();
  }

  async acceptCookies() {
    try {
      // Check if the cookie banner is displayed and accept cookies
      let isCookieBannerDisplayed = await this.driver
        .wait(until.elementLocated(By.id("onetrust-accept-btn-handler")), 5000)
        .catch(() => null);

      await this.driver.sleep(2000); // animation
      if (isCookieBannerDisplayed) {
        const btn = (
          await this.driver.findElements(By.id("onetrust-accept-btn-handler"))
        )[0];
        await this.driver.wait(until.elementIsVisible(btn), 5000);
        await this.driver.wait(until.elementIsEnabled(btn), 5000);
        await btn.click();
      }
      await this.driver.sleep(2000); // animation
    } catch {}
  }

  async addToCart(args: { itemUrl: string; quantity: number }) {
    try {
      const productElemnt = (
        await filterAsync(
          await this.driver.findElements(By.css(".pt__content")),
          async (e) => (await getUrlFromProduct(e)) === args.itemUrl
        )
      )[0];

      const addBtnCss = '[data-test-id="add-button"]';
      const addToCartBtn = await productElemnt.findElement(By.css(addBtnCss));
      await addToCartBtn.click();

      const addQuantityButton = await productElemnt.findElement(
        By.css('[data-test-id="pt-button-inc"]')
      );
      for (let i = 0; i < args.quantity - 1; i++) {
        await addQuantityButton.click();
      }
      return success(ADD_TO_CART_SUCCESS);
    } catch (e) {
      return fail(AddToCartFail.SeleniumError);
    }
  }

  async openHomePage() {
    await this.driver.get("https://www.sainsburys.co.uk/");
  }

  async login() {
    await this.openHomePage();
    await this.acceptCookies();
    const login = await this.driver.findElement(
      By.css('[data-id="loginForm"]')
    );
    await login.click();
    const groceryLogin = await this.driver.findElement(
      By.css('[data-testid="account-links-list-item-link"]')
    );
    await groceryLogin.click();

    console.log("Logging in...");
    const email = process.env.SAINSBURYS_EMAIL;
    const password = process.env.SAINSBURYS_PASSWORD;
    if (!email) {
      return fail(LoginFail.NoUsername);
    } else if (!password) {
      return fail(LoginFail.NoPassword);
    }
    try {
      await this.driver.wait(
        until.elementLocated(By.css('[data-testid="username"]')),
        5000
      );

      await this.acceptCookies();

      // Locate and fill in the email field
      let emailField = await this.driver.findElement(
        By.css('[data-testid="username"]')
      );
      await emailField.sendKeys(email);

      // Locate and fill in the password field
      let passwordField = await this.driver.findElement(
        By.css('[data-testid="password"]')
      );
      await passwordField.sendKeys(password, Key.RETURN);
      // TODO: check for code screen ("We've sent you a code")
      // could probably get around this by using users chrome user data dir
      // TODO: try again screen - just need to click the button

      await this.acceptCookies();
      console.log("Logged in.");

      // await this.clearCart();
    } catch (e) {
      return fail(LoginFail.SeleniumError);
    }
    return success(LOGIN_SUCCESS);
  }
}
