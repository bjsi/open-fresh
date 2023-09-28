import { By, Key, WebElement, until } from "selenium-webdriver";
import { Grocer, LOGIN_SUCCESS, LoginFail } from "./grocer";
import dotenv from "dotenv";
import { fail, success } from "../either";

dotenv.config();

export class Sainsburys extends Grocer {
  homepageUrl: string = "https://www.sainsburys.co.uk";

  async search(query: string) {
    const encodedQuery = encodeURIComponent(query);
    await this.driver.get(
      "https://www.sainsburys.co.uk/gol-ui/SearchResults/" + encodedQuery
    );
    await this.acceptCookies();
    await this.driver.wait(
      until.elementLocated(By.css(".pt__content")),
      10_000
    );
    const elements = await this.driver.findElements(By.css(".pt__content"));
    const products = await Promise.all(elements.map(this.extractProductInfo));
    console.log(JSON.stringify(products, null, 2));
    return products;
  }

  async extractProductInfo(element: WebElement): Promise<{
    name: string;
    price: string;
    rating: string | undefined;
    url: string;
  }> {
    // Find the element containing the product name
    const productNameElement = await element.findElement(
      By.css('[data-test-id="product-tile-description"]')
    );
    const name = await productNameElement.getText();
    // TODO: fix
    const url = await productNameElement.getAttribute("href");

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

  async acceptCookies() {
    // Check if the cookie banner is displayed and accept cookies
    let isCookieBannerDisplayed = await this.driver
      .wait(until.elementLocated(By.id("onetrust-accept-btn-handler")), 10_000)
      .catch(() => null);
    await this.driver.sleep(2000); // animation
    if (isCookieBannerDisplayed) {
      let acceptCookiesButton = await this.driver.findElement(
        By.id("onetrust-accept-btn-handler")
      );
      await acceptCookiesButton.click();
    }
  }

  async login() {
    const email = process.env.SAINSBURYS_EMAIL;
    const password = process.env.SAINSBURYS_PASSWORD;
    if (!email) {
      return fail(LoginFail.NoUsername);
    } else if (!password) {
      return fail(LoginFail.NoPassword);
    }
    try {
      await this.driver.get("https://account.sainsburys.co.uk/gol/login");

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
      await passwordField.sendKeys(password, Key.RETURN); // Assuming the form submits upon pressing Enter

      // TODO: check for code screen
      // "We've sent you a code"
    } catch (e) {
      return fail(LoginFail.SeleniumError);
    }
    return success(LOGIN_SUCCESS);
  }
}
