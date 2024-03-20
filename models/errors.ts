import { showError } from "utils/message";

export class AppError extends Error {
  statusCode = 400;

  constructor(message: string, code?: number) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    showError(message);
    if (code) this.statusCode = 400;
  }

  getErrorMessage(): string {
    return this.message;
  }
}
