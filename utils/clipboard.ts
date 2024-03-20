import { showMessage } from "./message";

// eslint-disable-next-line consistent-return
export const readTextToClipboard = async (): Promise<string | undefined> => {
  try {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.readText();
    }
    showMessage({ msg: "Error", type: "error" });
  } catch (err) {
    if (err instanceof Error) showMessage({ type: "error", msg: err?.message });
  }
};
