import test from "ava";
import supertest from "supertest";
import { JSDOM } from "jsdom";
import { testServer } from "@indiekit-test/server";
import { cookie } from "@indiekit-test/session";

test("Returns list of previously uploaded files", async (t) => {
  const server = await testServer();
  const request = supertest.agent(server);
  const response = await request.get("/files").set("cookie", [cookie()]);
  const dom = new JSDOM(response.text);
  const result = dom.window.document.querySelector("title").textContent;

  t.is(result, "Uploaded files - Test configuration");

  server.close(t);
});
