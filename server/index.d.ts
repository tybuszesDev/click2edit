/// <reference types="node" />
import type { Server } from "node:http";

export type EditableServerOptions = {
  endpoint?: string;
  password?: string;
  filePath?: string;
  port?: number;
  corsOrigin?: string;
};

export declare function createEditableServer(options?: EditableServerOptions): {
  server: Server;
  start: () => Server;
};
