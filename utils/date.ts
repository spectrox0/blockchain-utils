import dayjs from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/de";
import "dayjs/locale/it";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
export const formatUnixDate = (
  date: number,
  format = "ddd, MMMM, DD, YYYY hh:mm A",
  locale = "en"
) => dayjs.unix(date).locale(locale).format(format);

export const formatDate = (
  date: Date | string,
  format = "ddd, MMMM, DD, YYYY hh:mm A",
  locale = "en"
) => dayjs(date).locale(locale).format(format);

export const formatDateWithoutTimestamp = (
  date: Date | string | number,
  format = "ddd, MMMM, DD, YYYY",
  locale = "en"
) => dayjs(date).locale(locale).format(format);

export const formatDateUTC = (
  date: Date | string | number,
  format = "MMMM, DD, YYYY",
  locale = "en"
) => {
  return dayjs.utc(date).locale(locale).format(format);
};
