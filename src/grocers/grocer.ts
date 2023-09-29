import { WebDriver } from "selenium-webdriver";
import { Either } from "../types";

export enum LoginFail {
  "NoUsername" = "No username provided",
  "NoPassword" = "No password provided",
  "SeleniumError" = "Selenium error",
  "unknown" = "Unknown error",
  "details_incorrect" = "Username or password incorrect",
}
export const LOGIN_SUCCESS = "Successfully logged in." as const;

export enum SearchFail {
  "SeleniumError" = "Selenium error",
  "unknown" = "Unknown error",
}
export interface ProductSearchResult {
  name: string;
  price: string;
  url: string;
  rating?: string;
}

export abstract class Grocer {
  protected driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  abstract search(args: {
    query: string;
    test?: boolean;
  }): Promise<Either<SearchFail, ProductSearchResult[]>>;
  abstract login(): Promise<Either<LoginFail, typeof LOGIN_SUCCESS>>;
}
