import localForage from "localforage";
import { encryptData, decryptData } from "./encryption";

export const saveCache = async (key: string, value: unknown): Promise<void> => {
  await localForage.setItem(key, value);
};

export const readCache = async <T = unknown>(
  key: string
): Promise<T | undefined | null> => {
  return localForage.getItem<T>(key);
};

export const saveEncryptCache = async ({
  key,
  value,
  password,
}: {
  key: string;
  value: unknown;
  password: string;
}) => {
  if (value === null || value === undefined) return;
  const data = await encryptData(
    typeof value !== "string" ? JSON.stringify(value) : value.toString(),
    password
  );
  await saveCache(key, data);
};

export const multipleSaveEncryptCache = async ({
  password,
  values,
}: {
  password: string;
  values: [key: string, value: unknown][];
}) => {
  await Promise.all(
    values.map(([key, value]) => saveEncryptCache({ password, key, value }))
  );
};
export const readEncryptCache = async <T>({
  key,
  password,
}: {
  key: string;
  password: string;
}): Promise<T | undefined> => {
  const value: string | null = (await readCache(key)) as string;
  if (!value) return undefined;
  const decryptedValue: string | undefined = await decryptData(value, password);
  try {
    return JSON.parse(decryptedValue);
  } catch {
    return decryptedValue as unknown as T;
  }
};

export const clearCache = async (): Promise<void> => {
  await localForage.clear();
};

export const removeCache = async (key: string): Promise<void> => {
  await localForage.removeItem(key);
};
