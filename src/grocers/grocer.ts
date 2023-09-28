import { WebDriver } from "selenium-webdriver";
import { Either } from "../types";

export enum LoginFail {
    "NoUsername" = "No username provided",
    "NoPassword" = "No password provided",
    "SeleniumError" = "Selenium error",
    "unknown" = "Unknown error",
    "details_incorrect" = "Username or password incorrect"
} 
export const LOGIN_SUCCESS = "Successfully logged in." as const;

export abstract class Grocer {
    protected driver: WebDriver
    protected abstract homepageUrl: string;

    constructor(driver: WebDriver) {
        this.driver = driver;
    }

    abstract search(query: string): void;
    abstract login(): Promise<Either<LoginFail, typeof LOGIN_SUCCESS>>;
}