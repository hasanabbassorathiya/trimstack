import { createApp } from "./app.js";
import { createDatabase } from "./db/database.js";

const port = Number(process.env.PORT ?? 3001);

const db = createDatabase();
const app = createApp(db);

app.listen(port, () => {
  console.log(`TrimStack API listening on http://localhost:${port}`);
});
