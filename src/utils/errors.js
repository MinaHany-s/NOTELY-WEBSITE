import { translateCurrent } from "../i18n/translations.js";

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const message = error?.response?.data?.message || error?.message || fallback;
  return translateCurrent(message);
}
