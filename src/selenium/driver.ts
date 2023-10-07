import { WebDriver } from "selenium-webdriver";

// normal webdriver error stack sucks

export function createDriverProxy(driver: WebDriver) {
  return new Proxy(driver, {
    get(target, propKey) {
      // @ts-ignore
      const origMethod = target[propKey];
      if (typeof origMethod === "function") {
        // @ts-ignore
        return async function (...args) {
          const stack = new Error("start of stack trace wrapper").stack;
          try {
            // @ts-ignore
            return await target[propKey](...args);
          } catch (e) {
            // @ts-ignore
            e.stack = e.stack + "\n" + stack;
            throw e;
          }
        };
      } else {
        return origMethod;
      }
    },
  });
}
