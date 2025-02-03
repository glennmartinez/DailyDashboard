export interface WidgetProps<T = any> {
  config: T;
  width: number;
  height: number;
}

export interface WidgetAdapter<TConfig = any, TData = any> {
  initialize(config: TConfig): Promise<void>;
  fetchData(): Promise<TData>;
}

export interface WidgetDefinition<TConfig = any, TData = any> {
  component: React.ComponentType<WidgetProps<TConfig>>;
  adapter: WidgetAdapter<TConfig, TData>;
  validateConfig: (config: any) => boolean;
}
