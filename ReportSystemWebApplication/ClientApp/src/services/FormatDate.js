import { format } from "date-fns";

export const formatDate = (date, defaultText) => {
  if (!date) return defaultText;
  return format(date, "DD-MM-YYYY");
};
