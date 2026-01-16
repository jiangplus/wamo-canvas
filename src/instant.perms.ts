// Docs: https://www.instantdb.com/docs/permissions
// Visibility levels:
// - private: only owner can view and edit
// - protected: owner can edit, everyone can view
// - public: everyone can view and edit

import type { InstantRules } from "@instantdb/react";

const rules = {
  // Canvases - visibility-based access control
  // null visibility is treated as 'private' (default)
  canvases: {
    allow: {
      view: "canView",
      create: "isAuthenticated",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isOwner: "auth.id in data.ref('owner.id')",
      isPublic: "data.visibility == 'public'",
      isProtected: "data.visibility == 'protected'",
      canView: "isOwner || isPublic || isProtected",
    },
  },

  // Elements - based on canvas visibility
  elements: {
    allow: {
      view: "canView",
      create: "canEdit",
      update: "canEdit",
      delete: "canEdit",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isCanvasOwner: "auth.id in data.ref('canvas.owner.id')",
      isCanvasPublic: "data.ref('canvas.visibility')[0] == 'public'",
      isCanvasProtected: "data.ref('canvas.visibility')[0] == 'protected'",
      canView: "isCanvasOwner || isCanvasPublic || isCanvasProtected",
      canEdit: "isCanvasOwner || isCanvasPublic",
    },
  },

  // Connections - based on canvas visibility
  connections: {
    allow: {
      view: "canView",
      create: "canEdit",
      update: "canEdit",
      delete: "canEdit",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isCanvasOwner: "auth.id in data.ref('canvas.owner.id')",
      isCanvasPublic: "data.ref('canvas.visibility')[0] == 'public'",
      isCanvasProtected: "data.ref('canvas.visibility')[0] == 'protected'",
      canView: "isCanvasOwner || isCanvasPublic || isCanvasProtected",
      canEdit: "isCanvasOwner || isCanvasPublic",
    },
  },

  // Comments - based on canvas visibility, authors can modify their own
  comments: {
    allow: {
      view: "canView",
      create: "canEdit",
      update: "isAuthor",
      delete: "isAuthor",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isAuthor: "auth.id in data.ref('author.id')",
      isCanvasOwner: "auth.id in data.ref('element.canvas.owner.id')",
      isCanvasPublic: "data.ref('element.canvas.visibility')[0] == 'public'",
      isCanvasProtected: "data.ref('element.canvas.visibility')[0] == 'protected'",
      canView: "isCanvasOwner || isCanvasPublic || isCanvasProtected",
      canEdit: "isCanvasOwner || isCanvasPublic",
    },
  },
} satisfies InstantRules;

export default rules;
