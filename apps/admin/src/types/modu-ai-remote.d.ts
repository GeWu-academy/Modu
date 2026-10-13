declare module "moduAi/ModuAiRemote" {
  import type { ComponentType } from "react";

  export interface ModuAiHostContext {
    token?: string;
    userId?: string;
    tenantId?: string;
    displayName?: string;
    permissions?: string[];
    apiBaseUrl?: string;
    themeMode?: "light" | "dark";
  }

  const ModuAiRemote: ComponentType<{ context?: ModuAiHostContext }>;

  export default ModuAiRemote;
}
