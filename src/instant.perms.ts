// Docs: https://www.instantdb.com/docs/permissions
// Visibility levels:
// - private: only owner can view and edit
// - protected: owner can edit, everyone can view
// - public: everyone can view and edit

import type { InstantRules } from "@instantdb/react";

const rules = {
  $users: {
    allow: {
      view: "true",
    },
    fields: {
      email: "true",
      imageURL: "true",
      displayName: "true",
    },
  },
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
      isOwner: "auth.id != null && auth.id in data.ref('owner.id')",
      isMember: "auth.id != null && auth.id in data.ref('memberships.user.id')",
      isPublic: "data.visibility == 'public'",
      isProtected: "data.visibility == 'protected'",
      canView: "isPublic || isProtected || isOwner || isMember",
    },
  },

  // Elements - based on canvas visibility
  elements: {
    allow: {
      view: "canView",
      create: "canEdit",
      update: "canEdit && (!isLocked || isCreator)",
      delete: "canEdit && (!isLocked || isCreator)",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isCanvasOwner: "auth.id != null && auth.id in data.ref('canvas.owner.id')",
      isCanvasMember: "auth.id != null && auth.id in data.ref('canvas.memberships.user.id')",
      isCanvasPublic: "data.ref('canvas.visibility')[0] == 'public'",
      isCanvasProtected: "data.ref('canvas.visibility')[0] == 'protected'",
      canView: "isCanvasPublic || isCanvasProtected || isCanvasOwner || isCanvasMember",
      canEdit: "isAuthenticated && (isCanvasOwner || isCanvasMember)",
      isCreator: "auth.id != null && auth.id in data.ref('creator.id')",
      isLocked: "data.isLocked == true",
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
      isCanvasOwner: "auth.id != null && auth.id in data.ref('canvas.owner.id')",
      isCanvasMember: "auth.id != null && auth.id in data.ref('canvas.memberships.user.id')",
      isCanvasPublic: "data.ref('canvas.visibility')[0] == 'public'",
      isCanvasProtected: "data.ref('canvas.visibility')[0] == 'protected'",
      canView: "isCanvasPublic || isCanvasProtected || isCanvasOwner || isCanvasMember",
      canEdit: "isAuthenticated && (isCanvasOwner || isCanvasMember)",
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
      isAuthor: "auth.id != null && auth.id in data.ref('author.id')",
      isCanvasOwner: "auth.id != null && auth.id in data.ref('element.canvas.owner.id')",
      isCanvasMember: "auth.id != null && auth.id in data.ref('element.canvas.memberships.user.id')",
      isCanvasPublic: "data.ref('element.canvas.visibility')[0] == 'public'",
      isCanvasProtected: "data.ref('element.canvas.visibility')[0] == 'protected'",
      canView: "isCanvasPublic || isCanvasProtected || isCanvasOwner || isCanvasMember",
      canEdit: "isAuthenticated && (isCanvasOwner || isCanvasMember)",
    },
  },
  canvas_memberships: {
    allow: {
      view: "canView",
      create: "canCreate",
      update: "false",
      delete: "canDelete",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isSelf: "auth.id != null && auth.id in data.ref('user.id')",
      isCanvasOwner: "auth.id != null && auth.id in data.ref('canvas.owner.id')",
      isCanvasPublic: "data.ref('canvas.visibility')[0] == 'public'",
      isCanvasProtected: "data.ref('canvas.visibility')[0] == 'protected'",
      canView: "isSelf || isCanvasOwner",
      canCreate: "isAuthenticated && (isCanvasPublic || isCanvasProtected)",
      canDelete: "isSelf || isCanvasOwner",
    },
  },
} satisfies InstantRules;

export default rules;
