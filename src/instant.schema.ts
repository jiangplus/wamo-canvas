// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    // Canvas/Board - groups elements for collaboration
    canvases: i.entity({
      name: i.string(),
      visibility: i.string().indexed().optional(), // 'private' | 'protected' | 'public' (default: private)
      createdAt: i.number().indexed(),
    }),
    // Canvas elements (images, text, stickers)
    elements: i.entity({
      type: i.string(), // 'image' | 'text' | 'sticker'
      content: i.string(), // URL, text content, or emoji
      x: i.number(),
      y: i.number(),
      width: i.number(),
      height: i.number().optional(),
      rotation: i.number(),
      isLocked: i.boolean(),
      texture: i.string().optional(),
      shape: i.json().optional(), // { clipPath, borderRadius }
      scale: i.number(),
      zIndex: i.number().indexed(),
      style: i.json().optional(), // Text styling
      createdAt: i.number().indexed(),
    }),
    // Connections between elements
    connections: i.entity({
      text: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
    // Comments on elements
    comments: i.entity({
      text: i.string(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    // Canvas ownership
    canvasOwner: {
      forward: { on: "canvases", has: "one", label: "owner" },
      reverse: { on: "$users", has: "many", label: "ownedCanvases" },
    },
    // Elements belong to a canvas
    canvasElements: {
      forward: { on: "elements", has: "one", label: "canvas", onDelete: "cascade" },
      reverse: { on: "canvases", has: "many", label: "elements" },
    },
    // Element creator
    elementCreator: {
      forward: { on: "elements", has: "one", label: "creator" },
      reverse: { on: "$users", has: "many", label: "createdElements" },
    },
    // Connection endpoints
    connectionFrom: {
      forward: { on: "connections", has: "one", label: "fromElement", onDelete: "cascade" },
      reverse: { on: "elements", has: "many", label: "outgoingConnections" },
    },
    connectionTo: {
      forward: { on: "connections", has: "one", label: "toElement", onDelete: "cascade" },
      reverse: { on: "elements", has: "many", label: "incomingConnections" },
    },
    // Connection belongs to canvas
    canvasConnections: {
      forward: { on: "connections", has: "one", label: "canvas", onDelete: "cascade" },
      reverse: { on: "canvases", has: "many", label: "connections" },
    },
    // Comments on elements
    elementComments: {
      forward: { on: "comments", has: "one", label: "element", onDelete: "cascade" },
      reverse: { on: "elements", has: "many", label: "comments" },
    },
    // Comment author
    commentAuthor: {
      forward: { on: "comments", has: "one", label: "author" },
      reverse: { on: "$users", has: "many", label: "comments" },
    },
  },
  rooms: {
    // Real-time presence for canvas collaboration
    canvas: {
      presence: i.entity({
        odId: i.string(), // odId is operation document id, used for cursor tracking
        odUpdatedAt: i.number(),
        cursor: i.json(), // { x, y }
        selectedElementId: i.string().optional(),
        userName: i.string().optional(),
        avatar: i.string().optional(),
      }),
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
