import test from "ava";
import { IndiekitError } from "@indiekit/error";
import { getFixture } from "@indiekit-test/fixtures";
import {
  createStatus,
  getAbsoluteUrl,
  getStatusIdFromUrl,
  htmlToStatusText,
  isTootUrl,
} from "../../lib/utils.js";

test.beforeEach((t) => {
  t.context = {
    me: "https://website.example",
    tootUrl: "https://mastodon.example/@username/1234567890987654321",
  };
});

test("Creates a status with article post name and URL", (t) => {
  const result = createStatus(
    JSON.parse(getFixture("jf2/article-content-provided-html-text.jf2")),
    {
      serverUrl: "https://mastodon.example",
    }
  );

  t.is(result.status, "What I had for lunch https://foo.bar/lunchtime");
});

test("Creates a status with HTML content", (t) => {
  const result = createStatus(
    JSON.parse(getFixture("jf2/note-content-provided-html.jf2")),
    {
      serverUrl: "https://mastodon.example",
    }
  );

  t.is(result.status, "> I ate a cheese sandwich, which was > 10.");
});

test("Creates a status with HTML content and appends last link", (t) => {
  const result = createStatus(
    JSON.parse(getFixture("jf2/note-content-provided-html-with-link.jf2")),
    {
      serverUrl: "https://mastodon.example",
    }
  );

  t.is(
    result.status,
    "> I ate a cheese sandwich, which was > 10. https://en.wikipedia.org/wiki/Cheese"
  );
});

test("Creates a status with HTML content and doesn’t append Mastodon link", (t) => {
  const result = createStatus(
    JSON.parse(
      getFixture("jf2/note-content-provided-html-with-mastodon-link.jf2")
    ),
    {
      serverUrl: "https://mastodon.example",
    }
  );

  t.is(result.status, "I ate @cheese’s sandwich, which was nice.");
});

test("Creates a reblog with status URL and post content", (t) => {
  const result = createStatus(
    JSON.parse(getFixture("jf2/repost-mastodon.jf2")),
    {
      serverUrl: "https://mastodon.example",
    }
  );

  t.is(
    result.status,
    `Someone else who likes cheese sandwiches. ${t.context.tootUrl}`
  );
});

test("Adds link to status post is in reply to", (t) => {
  const result = createStatus(
    JSON.parse(getFixture("jf2/reply-mastodon.jf2")),
    {
      serverUrl: "https://mastodon.example",
    }
  );

  t.is(result.status, "I ate a cheese sandwich too!");
  t.is(result.in_reply_to_status_id, "1234567890987654321");
});

test("Throws creating a status if post is off-service reply", (t) => {
  t.throws(
    () => {
      createStatus(JSON.parse(getFixture("jf2/reply-twitter.jf2")), {
        serverUrl: "https://mastodon.example",
      });
    },
    {
      instanceOf: IndiekitError,
      message: "Not a reply to a URL at this target",
    }
  );
});

test("Creates a status with a photo", (t) => {
  const result = createStatus(
    {
      content: {
        html: "<p>Here’s the cheese sandwich I ate.</p>",
      },
    },
    {
      mediaIds: ["1", "2", "3", "4"],
      serverUrl: "https://mastodon.example",
    }
  );

  t.is(result.status, "Here’s the cheese sandwich I ate.");
  t.deepEqual(result.media_ids, ["1", "2", "3", "4"]);
});

test("Tests if string is a toot permalink", (t) => {
  t.true(
    isTootUrl(
      "https://mastodon.example/@username/1234567890987654321",
      "https://mastodon.example"
    )
  );
  t.false(isTootUrl("https://getindiekit.com", "https://mastodon.example"));
});

test("Gets absolute URL", (t) => {
  const result = getAbsoluteUrl(
    `${t.context.me}/media/photo.jpg`,
    t.context.me
  );

  t.is(result, `${t.context.me}/media/photo.jpg`);
});

test("Gets absolute URL by prepending publication URL", (t) => {
  const result = getAbsoluteUrl("/media/photo.jpg", t.context.me);

  t.is(result, `${t.context.me}/media/photo.jpg`);
});

test("Gets status ID from Mastodon permalink", (t) => {
  const result = getStatusIdFromUrl(
    "https://mastodon.example/@username/1234567890987654321"
  );

  t.is(result, "1234567890987654321");
});

test("Convert HTML to status text", (t) => {
  const result = htmlToStatusText(
    "<p>I ate a <em>cheese</em> sandwich, which was nice.</p>",
    "https://mastodon.example"
  );

  t.is(result, "I ate a cheese sandwich, which was nice.");
});

test("Convert HTML to status text, appending last link href if present", (t) => {
  const result = htmlToStatusText(
    '<p>Hello <a href="/hello">world</a>, hello <a href="https://moon.example">moon</a>.</p>',
    "https://mastodon.example"
  );

  t.is(result, "Hello world, hello moon. https://moon.example");
});
