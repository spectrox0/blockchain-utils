// eslint-disable-next-line prefer-regex-literals
export const RegPassword = new RegExp(
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.{8,})/,
  "i"
);
