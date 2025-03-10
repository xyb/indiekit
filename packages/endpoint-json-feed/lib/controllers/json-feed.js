import { jsonFeed } from "../json-feed.js";

export const jsonFeedController = async (request, response) => {
  const { application, publication } = request.app.locals;
  const feedUrl = new URL(request.originalUrl, application.url).href;
  const posts = await publication.posts
    .find({
      "properties.post-status": {
        $ne: "draft",
      },
    })
    .toArray();

  return response
    .type("application/feed+json")
    .json(jsonFeed(application, feedUrl, posts));
};
