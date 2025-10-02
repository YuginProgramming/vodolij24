import axios from "axios";
import { logger } from "../logger/index.js";

export const createUserTransaction = async ({
  device,
  date,
  waterRequested,
  waterFullfilled,
  cashPaymant,
  cardPaymant,
  onlinePaymant,
  paymantChange,
  cardId,
}) => {
  try {
    const create = await axios.post("http://localhost/transactions/create", {
      device,
      date,
      waterRequested,
      waterFullfilled,
      cashPaymant,
      cardPaymant,
      onlinePaymant,
      paymantChange,
      cardId,
    });

    logger.info(
      "User trasaction already created. Transaction ID: " + create?.data?.id
    );
  } catch (error) {
    logger.warn("Cant create user transaction" + error);
  }
};
