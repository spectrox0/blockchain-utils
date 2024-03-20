type TypeOptions = "info" | "success" | "warning" | "error";
const toast = (
  msg: string,
  options: { type: TypeOptions; autoClose: number; toastId: string }
) => {
  // Code here
};
export const showMessage = ({
  id,
  type = "info",
  msg = "Error",
  autoClose,
}: {
  id?: string;
  type?: TypeOptions;
  msg: string;
  autoClose?: number;
}) => {
  toast(msg, {
    type,
    autoClose: autoClose || 7000,
    toastId: id || msg,
  });
};

export const showError = (msg: string) => {
  showMessage({ type: "error", msg });
};
