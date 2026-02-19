import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../app.js";
import { pool } from "../db/pool.js";

beforeEach(async () => {
  await pool.query("DELETE FROM user_subscriptions");
  await pool.query("DELETE FROM users");
});

after(async () => {
  await pool.end();
});

test("signup, login, and subscription lifecycle", async () => {
  const email = `user_${Date.now()}@example.com`;

  const signup = await request(app)
    .post("/auth/signup")
    .send({
      email,
      password: "password123",
      timezone: "America/New_York"
    });

  assert.equal(signup.status, 201);
  assert.equal(signup.body.user.email, email);

  const login = await request(app)
    .post("/auth/login")
    .send({
      email,
      password: "password123"
    });

  assert.equal(login.status, 200);
  assert.ok(login.body.token);
  const token = login.body.token as string;

  const createSubscription = await request(app)
    .post("/subscriptions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      topicId: 2,
      locality: "San Francisco, CA",
      frequency: "daily"
    });

  assert.equal(createSubscription.status, 201);
  assert.equal(createSubscription.body.subscription.topic_id, "2");

  const subscriptionId = createSubscription.body.subscription.id;

  const patchSubscription = await request(app)
    .patch(`/subscriptions/${subscriptionId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      frequency: "weekly",
      locality: "San Jose, CA"
    });

  assert.equal(patchSubscription.status, 200);
  assert.equal(patchSubscription.body.subscription.frequency, "weekly");
  assert.equal(patchSubscription.body.subscription.locality, "San Jose, CA");

  const listSubscriptions = await request(app)
    .get("/subscriptions")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(listSubscriptions.status, 200);
  assert.equal(listSubscriptions.body.subscriptions.length, 1);

  const deleteSubscription = await request(app)
    .delete(`/subscriptions/${subscriptionId}`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(deleteSubscription.status, 204);

  const listAfterDelete = await request(app)
    .get("/subscriptions")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(listAfterDelete.status, 200);
  assert.equal(listAfterDelete.body.subscriptions[0].is_active, false);
});

test("admin endpoints require admin role", async () => {
  const email = `admin_check_${Date.now()}@example.com`;

  const signup = await request(app)
    .post("/auth/signup")
    .send({
      email,
      password: "password123",
      timezone: "UTC"
    });

  assert.equal(signup.status, 201);

  const loginAsUser = await request(app)
    .post("/auth/login")
    .send({
      email,
      password: "password123"
    });
  assert.equal(loginAsUser.status, 200);

  const userToken = loginAsUser.body.token as string;
  const forbiddenAdminOverview = await request(app)
    .get("/admin/overview")
    .set("Authorization", `Bearer ${userToken}`);
  assert.equal(forbiddenAdminOverview.status, 403);

  await pool.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [email.toLowerCase()]);

  const loginAsAdmin = await request(app)
    .post("/auth/login")
    .send({
      email,
      password: "password123"
    });
  assert.equal(loginAsAdmin.status, 200);

  const adminToken = loginAsAdmin.body.token as string;
  const adminOverview = await request(app)
    .get("/admin/overview")
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(adminOverview.status, 200);
  assert.ok(adminOverview.body.overview);
});

test("unsubscribe request and confirmation opt-out email delivery", async () => {
  const email = `unsubscribe_${Date.now()}@example.com`;

  const signup = await request(app)
    .post("/auth/signup")
    .send({
      email,
      password: "password123",
      timezone: "UTC"
    });
  assert.equal(signup.status, 201);

  const login = await request(app)
    .post("/auth/login")
    .send({
      email,
      password: "password123"
    });
  assert.equal(login.status, 200);

  const token = login.body.token as string;
  const requestUnsubscribe = await request(app)
    .post("/unsubscribe/request")
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.equal(requestUnsubscribe.status, 200);
  assert.ok(requestUnsubscribe.body.token);
  assert.ok(requestUnsubscribe.body.unsubscribeUrl);

  const confirm = await request(app)
    .post("/unsubscribe/confirm")
    .send({ token: requestUnsubscribe.body.token });
  assert.equal(confirm.status, 200);

  const userRow = await pool.query(`SELECT email_opt_out FROM users WHERE email = $1`, [
    email.toLowerCase()
  ]);
  assert.equal(userRow.rows[0].email_opt_out, true);

  const eventRow = await pool.query(
    `SELECT event_type FROM email_events WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
    [signup.body.user.id]
  );
  assert.equal(eventRow.rows[0].event_type, "unsubscribed");
});
