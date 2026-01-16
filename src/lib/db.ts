import { init } from "@instantdb/react";
import schema from "../instant.schema";

export const db = init({
  appId: import.meta.env.VITE_INSTANT_APP_ID,
  schema,
});

// Re-export useful utilities
export { id, tx } from "@instantdb/react";
