import { createEditableServer } from "click2edit/server";

createEditableServer({
  port: 3001,
  endpoint: "/__editable",
  password: "secret123",
  filePath: "editable-content.json",
}).start();
