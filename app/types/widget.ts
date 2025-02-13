import { ReactNode } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WidgetProps<T = any> {
  config: T;
  adapters: WidgetAdapter<T, any>[];
  width: number;
  height?: number;
}

export interface WidgetAdapter<TConfig = any, TData = any> {
  initialize(config: TConfig): Promise<void>;
  fetchData(): Promise<TData>;
}

export interface WidgetDefinition<TConfig = any, TData = any> {
  component: (props: WidgetProps<TConfig>) => ReactNode;
  adapter: WidgetAdapter<TConfig, TData>;
  validator: (config: TConfig) => boolean;
  defaultWidth: number;
  defaultHeight: number;
}
