import React, { ReactNode } from "react";
import { WidgetRegistry } from "../../services/widgetRegistry";
import { WidgetRegistryContext } from "../../hooks/useWidgetRegistry";

interface WidgetRegistryProviderProps {
  registry: WidgetRegistry;
  children: ReactNode;
}

export function WidgetRegistryProvider({
  registry,
  children,
}: WidgetRegistryProviderProps) {
  return (
    <WidgetRegistryContext.Provider value={{ registry }}>
      {children}
    </WidgetRegistryContext.Provider>
  );
}
