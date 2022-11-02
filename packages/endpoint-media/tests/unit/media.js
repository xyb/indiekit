import test from "ava";
import { setGlobalDispatcher } from "undici";
import { storeAgent } from "@indiekit-test/mock-agent";
import { getFixture } from "@indiekit-test/fixtures";
import { mediaData } from "@indiekit-test/media-data";
import { publication } from "@indiekit-test/publication";
import { media } from "../../lib/media.js";

setGlobalDispatcher(storeAgent());

test.beforeEach((t) => {
  t.context.file = {
    buffer: getFixture("file-types/photo.jpg", false),
    originalname: "photo.jpg",
  };
});

test("Uploads a file", async (t) => {
  const result = await media.upload(publication, mediaData, t.context.file);

  t.deepEqual(result, {
    location: "https://website.example/photo.jpg",
    status: 201,
    json: {
      success: "create",
      success_description:
        "Media uploaded to https://website.example/photo.jpg",
    },
  });
});

test("Throws error uploading a file", async (t) => {
  await t.throwsAsync(media.upload(false, mediaData, t.context.file), {
    message: "storeMessageTemplate is not a function",
  });
});
