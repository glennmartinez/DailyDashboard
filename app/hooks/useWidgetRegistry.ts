import { useContext, createContext } from "react";
import { WidgetRegistry } from "../services/widgetRegistry";

export interface WidgetRegistryContextType {
  registry: WidgetRegistry;
}

export const WidgetRegistryContext = createContext<WidgetRegistryContextType | null>(null);

export function useWidgetRegistry(): WidgetRegistry {
  const context = useContext(WidgetRegistryContext);
  if (!context) {
    throw new Error("useWidgetRegistry must be used within a WidgetRegistryProvider");
  }
  return context.registry;
}
