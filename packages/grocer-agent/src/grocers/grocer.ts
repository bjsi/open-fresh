import { WebDriver } from "selenium-webdriver";

interface Fail<L> {
  readonly type: "fail";
  readonly error: L;
}

interface Success<R> {
  readonly type: "success";
  readonly data: R;
}

type Either<L, R> = Fail<L> | Success<R>;

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
  id: number;
  name: string;
  price: string;
  url: string;
  rating?: string;
}

export enum AddToCartFail {
  "SeleniumError" = "Selenium error",
  "unknown" = "Unknown error",
}
export const ADD_TO_CART_SUCCESS = "Successfully added to cart." as const;

// TODO: include screenshot in fail

export abstract class Grocer {
  protected driver: WebDriver;

  protected constructor(driver: WebDriver) {
    this.driver = driver;
  }

  abstract search(args: {
    query: string;
    test?: boolean;
  }): Promise<Either<SearchFail, ProductSearchResult[]>>;

  abstract login(): Promise<Either<LoginFail, typeof LOGIN_SUCCESS>>;

  abstract addToCart(args: {
    itemUrl: string;
    quantity: number;
  }): Promise<Either<AddToCartFail, typeof ADD_TO_CART_SUCCESS>>;
}
