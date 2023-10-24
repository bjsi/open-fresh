// requires cookie + other auth tokens
// not sure it makes sense
// but maybe login, get cookies and auth tokens, then use the API could work?
// then you only need to use selenium to login
// cookie -> document.cookie
// bearer auth -> localStorage.getItem("oidc.user:https://account.sainsburys.co.uk:gol").access_token

async function searchProducts(
  keyword: string,
  pageNumber: number,
  pageSize: number,
  storeId: string
) {
  const baseUrl =
    "https://www.sainsburys.co.uk/groceries-api/gol-services/product/v1/product";
  const params = new URLSearchParams({
    "filter[keyword]": keyword,
    page_number: pageNumber.toString(),
    page_size: pageSize.toString(),
    sort_order: "FAVOURITES_FIRST",
    store_identifier: storeId,
    region: "England",
    flexi_stores: "",
  });

  const url = `${baseUrl}?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    throw error;
  }
}

interface AddToCartPayload {
  quantity: number;
  uom: string;
  selected_catchweight: string;
  product_uid: string;
}

async function addToCart(
  pickTime: string,
  storeNumber: string,
  payload: AddToCartPayload
) {
  const baseUrl =
    "https://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket/item";
  const params = new URLSearchParams({
    pick_time: pickTime,
    store_number: storeNumber,
  });

  const url = `${baseUrl}?${params.toString()}`;

  // still unauthorized error, try re-pasting
  const wcauthtoken = "";
  const cookie = "";
  const bearer = "";
  const userAgent = "";

  const headers = {
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    Authorization: `Bearer ${bearer}`,
    "Content-Type": "application/json",
    Cookie: cookie,
    // 'Enabled-Feature-Flags': '...',
    "User-Agent": userAgent,
    Wcauthtoken: wcauthtoken,
    Origin: "https://www.sainsburys.co.uk",
    Referer: "https://www.sainsburys.co.uk/gol-ui/SearchResults/glass",
    "Sec-Ch-Ua":
      '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"macOS"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  };

  const requestOptions: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(url, requestOptions);
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Failed to add to cart: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error adding to cart: ${error}`);
    throw error;
  }
}

const main = async () => {
  const pickTime = new Date().toISOString();
  const storeNumber = "";
  const payload: AddToCartPayload = {
    quantity: 1,
    uom: "ea",
    selected_catchweight: "",
    product_uid: "8089145",
  };
  const res = await addToCart(pickTime, storeNumber, payload);
  console.log(res);
};

main();
// https://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket/item?pick_time=2023-10-16T12%3A33%3A12Z

// https://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket?calculate=true&pick_time=2023-10-16T12%3A47%3A13Z

// https://www.sainsburys.co.uk/groceries-api/gol-services/basket/v1/basket
// Request Method:
// DELETE

// Update Basket
// Request URL:
// https://www.sainsburys.co.uk/groceries-api/gol-services/basket/v2/basket?pick_time=2023-10-16T12%3A57%3A10Z
// Request Method:
// PUT
// [
// {
// 	"quantity": 2,
// 		"uom": "ea",
// 		"selected_catchweight": "",
// 		"item_uid": "19522370397"
// }
// ]
