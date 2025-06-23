import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import * as jwt from "hono/jwt";

import { config } from "../config/config.ts";
import { db } from "../db/drizzle.ts";
import { usersTable } from "../db/schema.ts";

const app = new Hono().basePath("/auth");

app.post("/token", async (c) => {
  const body = await c.req.json();

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.username, body.username),
    columns: { id: true, password: true },
  });

  try {
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      return c.json({ error: "invalid username or password" }, 401);
    }

    const token = await jwt.sign(
      { id: user.id, exp: 24 * 60 * 60 * 1 },
      config.JWT_SECRET_KEY,
    );

    return c.json({ data: { token } });
  } catch (_e: unknown) {
    return c.json({ error: _e.message }, 500);
  }
});



app.post("/register", async(c) => {
  try{
    const body = await c.req.json()

    const user = await db.select().from(usersTable).where(eq(usersTable.username, body.username))
  }catch(err){
    return c.json({
      ok:false,
      error: err
    },500)
  }
})

export default app;
