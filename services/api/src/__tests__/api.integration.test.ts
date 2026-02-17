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
