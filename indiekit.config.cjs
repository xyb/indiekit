const process = require("node:process");
require("dotenv").config();

module.exports = {
  application: {
    _devMode: process.env.NODE_ENV === "development",
    mongodbUrl: process.env.MONGO_URL,
    ...(process.env.RAILWAY_ENVIRONMENT && {
      url: `https://${process.env.RAILWAY_STATIC_URL}`,
    }),
  },
  plugins: [
    "@indiekit/endpoint-activitypub",
    "@indiekit/preset-jekyll",
    "@indiekit/store-file-system",
    "@indiekit/syndicator-mastodon",
    "@indiekit/syndicator-twitter",
  ],
  publication: {
    me: process.env.PUBLICATION_URL,
    timeZone: process.env.TZ,
  },
  "@indiekit/endpoint-activitypub": {
    ...(process.env.RAILWAY_ENVIRONMENT && {
      domain: process.env.RAILWAY_STATIC_URL,
    }),
    username: "indiekit",
    displayName: "Indiekit",
    summary: "Testing Indiekit’s ActivityPub integration",
    icon: {
      type: "Image",
      mediaType: "image/png",
      url: "https://avatars.githubusercontent.com/u/68553280?s=180",
      width: 180,
      height: 180,
    },
  },
  "@indiekit/store-file-system": {
    directory: "tmp",
  },
  "@indiekit/syndicator-mastodon": {
    checked: true,
    forced: true,
    url: process.env.MASTODON_URL,
    user: process.env.MASTODON_USER,
  },
  "@indiekit/syndicator-twitter": {
    checked: true,
    forced: true,
    user: process.env.TWITTER_USER,
  },
};
