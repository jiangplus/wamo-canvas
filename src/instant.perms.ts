// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  // Canvases - authenticated users can create, owners can modify
  canvases: {
    allow: {
      view: "isAuthenticated",
      create: "isAuthenticated",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isOwner: "auth.id in data.ref('owner.id')",
    },
  },

  // Elements - anyone authenticated can view, creators/canvas owners can modify
  elements: {
    allow: {
      view: "isAuthenticated",
      create: "isAuthenticated",
      update: "canModify",
      delete: "canModify",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isCreator: "auth.id in data.ref('creator.id')",
      isCanvasOwner: "auth.id in data.ref('canvas.owner.id')",
      canModify: "isCreator || isCanvasOwner",
    },
  },

  // Connections - authenticated users can manage
  connections: {
    allow: {
      view: "isAuthenticated",
      create: "isAuthenticated",
      update: "isAuthenticated",
      delete: "isAuthenticated",
    },
    bind: {
      isAuthenticated: "auth.id != null",
    },
  },

  // Comments - authors can modify their own comments
  comments: {
    allow: {
      view: "isAuthenticated",
      create: "isAuthenticated",
      update: "isAuthor",
      delete: "isAuthor",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isAuthor: "auth.id in data.ref('author.id')",
    },
  },
} satisfies InstantRules;

export default rules;
