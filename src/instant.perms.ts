// Docs: https://www.instantdb.com/docs/permissions
// Visibility levels:
// - readonly: owner can edit, everyone can view
// - public: everyone can view and edit (default)

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
  // All canvases are viewable by everyone (readonly or public)
  canvases: {
    allow: {
      view: "true",
      create: "isAuthenticated",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isOwner: "auth.id != null && auth.id in data.ref('owner.id')",
      isMember: "auth.id != null && auth.id in data.ref('memberships.user.id')",
      isPublic: "data.visibility == 'public'",
      isReadonly: "data.visibility == 'readonly'",
    },
  },

  // Elements - all viewable, edit based on canvas visibility
  elements: {
    allow: {
      view: "true",
      create: "canEdit",
      update: "canEdit && (!isLocked || isCreator)",
      delete: "canEdit && (!isLocked || isCreator)",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isCanvasOwner: "auth.id != null && auth.id in data.ref('canvas.owner.id')",
      isCanvasMember: "auth.id != null && auth.id in data.ref('canvas.memberships.user.id')",
      isCanvasPublic: "data.ref('canvas.visibility')[0] == 'public'",
      canEdit: "isAuthenticated && (isCanvasOwner || isCanvasMember || isCanvasPublic)",
      isCreator: "auth.id != null && auth.id in data.ref('creator.id')",
      isLocked: "data.isLocked == true",
    },
  },

  // Connections - all viewable, edit based on canvas visibility
  connections: {
    allow: {
      view: "true",
      create: "canEdit",
      update: "canEdit",
      delete: "canEdit",
    },
    bind: {
      isAuthenticated: "auth.id != null",
      isCanvasOwner: "auth.id != null && auth.id in data.ref('canvas.owner.id')",
      isCanvasMember: "auth.id != null && auth.id in data.ref('canvas.memberships.user.id')",
      isCanvasPublic: "data.ref('canvas.visibility')[0] == 'public'",
      canEdit: "isAuthenticated && (isCanvasOwner || isCanvasMember || isCanvasPublic)",
    },
  },

  // Comments - all viewable, authors can modify their own
  comments: {
    allow: {
      view: "true",
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
      canEdit: "isAuthenticated && (isCanvasOwner || isCanvasMember || isCanvasPublic)",
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
      canView: "isSelf || isCanvasOwner",
      canCreate: "isAuthenticated",
      canDelete: "isSelf || isCanvasOwner",
    },
  },
} satisfies InstantRules;

export default rules;
