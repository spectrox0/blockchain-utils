/* eslint-disable @typescript-eslint/ban-types */
import { FC, PropsWithChildren } from "react";

export type FCC<T = {}> = FC<PropsWithChildren<T>>;

export type ListC<T = {}> = { items: T[] };

type ValueOf<T> = T[keyof T];
export type Entries<T> = [keyof T, ValueOf<T>][];
