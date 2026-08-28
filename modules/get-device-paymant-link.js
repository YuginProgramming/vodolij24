import axios from "axios";

export const checkRedirectAndParams = async (deviceID) => {
  try {
    // Робимо запит, але забороняємо автоматичний редірект
    const response = await axios.get(
      `https://vodoliy.net/easypay/pay_redirect.php?p=s&id=${deviceID}`,
      {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      }
    );

    const redirectUrl = response.headers.location;

    if (!redirectUrl) {
      console.log("Посилання не має редіректу (статус:", response.status, ")");
      return `https://vodoliy.net/easypay/pay_redirect.php?p=s&id=${deviceID}`;
    }

    const parsedUrl = new URL(redirectUrl);

    const baseUrl = parsedUrl.origin + parsedUrl.pathname;

    return baseUrl;
  } catch (error) {
    console.error("Помилка під час перевірки посилання:", error.message);
    return `https://vodoliy.net/easypay/pay_redirect.php?p=s&id=${deviceID}`;
  }
};
