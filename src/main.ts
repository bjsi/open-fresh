import { Builder, By, Key, until } from "selenium-webdriver";
import { Sainsburys } from "./grocers/sainsburys";
import dotenv from "dotenv";

dotenv.config();

(async function example() {
  const driver = await new Builder().forBrowser("chrome").build();
  const grocer = new Sainsburys(driver);
  //   await grocer.login();
  await grocer.search("tofu");
})();
