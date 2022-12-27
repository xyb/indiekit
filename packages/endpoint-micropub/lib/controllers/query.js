import { IndiekitError } from "@indiekit/error";
import { getConfig, queryConfig } from "../config.js";
import { getMf2Properties, jf2ToMf2 } from "../mf2.js";
import { getCursor } from "../pagination.js";

/**
 * Query previously published posts
 *
 * @param {object} request - HTTP request
 * @param {object} response - HTTP response
 * @param {Function} next - Next middleware callback
 * @returns {object} HTTP response
 */
export const queryController = async (request, response, next) => {
  const { application, publication } = request.app.locals;
  let { q, url } = request.query;

  try {
    if (!application.hasDatabase) {
      throw IndiekitError.notImplemented(
        response.__("NotImplementedError.database")
      );
    }

    const config = getConfig(application, publication);

    if (!q) {
      throw IndiekitError.badRequest(
        response.__("BadRequestError.missingParameter", "q")
      );
    }

    let item;
    if (url) {
      item = await publication.posts.findOne({ "properties.url": url });

      if (!item) {
        throw IndiekitError.notFound(
          response.__("NotFoundError.resource", "post")
        );
      }
    }

    // `category` param is used to query `categories` configuration property
    q = q === "category" ? "categories" : q;

    switch (q) {
      case "config": {
        return response.json(config);
      }

      case "source": {
        // Return mf2 for a given source URL (optionally filtered by properties)
        if (url) {
          const mf2 = jf2ToMf2(item.properties);
          const { properties } = request.query;
          return response.json(getMf2Properties(mf2, properties));
        }

        // Return mf2 for previously published posts (cursor paginated)
        const cursor = await getCursor(publication.posts, request.query);

        return response.json({
          ...(cursor.hasNext && { after: cursor.lastItem }),
          ...(cursor.hasPrev && { before: cursor.firstItem }),
          items: cursor.items.map((post) => jf2ToMf2(post.properties)),
        });
      }

      default: {
        // Query configuration value (can be filtered, limited and offset)
        if (config[q]) {
          const { filter, limit, offset } = request.query;
          return response.json({
            [q]: queryConfig(config[q], { filter, limit, offset }),
          });
        }

        throw IndiekitError.notImplemented(
          response.__("NotImplementedError.query", { key: "q", value: q })
        );
      }
    }
  } catch (error) {
    next(error);
  }
};
