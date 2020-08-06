import getPostType from 'post-type-discovery';
import HttpError from 'http-errors';
import {mf2tojf2} from '@paulrobertlloyd/mf2tojf2';
import * as update from './update.js';
import {
  renderPath,
  getPermalink,
  getPostTypeConfig
} from './utils.js';

export const postData = {
  /**
   * Create post data
   *
   * @param {object} publication Publication configuration
   * @param {object} mf2 microformats2
   * @returns {object} Post data
   */
  create: async (publication, mf2) => {
    try {
      if (!publication) {
        throw new Error('No publication configuration provided');
      }

      if (!mf2) {
        throw new Error('No microformats included in request');
      }

      const {config, me} = publication;

      // Post type
      const type = getPostType(mf2);
      const typeConfig = getPostTypeConfig(type, config);

      // Post properties
      const properties = mf2tojf2({items: [mf2]});
      properties['post-type'] = type;

      // Post paths
      const path = renderPath(typeConfig.post.path, properties);
      let url = renderPath(typeConfig.post.url, properties);
      url = getPermalink(me, url);

      // Post data
      const postData = {path, url, properties, mf2};
      return postData;
    } catch (error) {
      throw new HttpError(400, error.message, {
        value: 'invalid_request'
      });
    }
  },

  /**
   * Read post data
   *
   * @param {object} publication Publication configuration
   * @param {string} url URL of existing post
   * @returns {object} Post data
   */
  read: async (publication, url) => {
    try {
      if (!publication) {
        throw new Error('No publication configuration provided');
      }

      if (!url) {
        throw new Error('No URL provided');
      }

      const {posts} = publication;
      return posts.get(url);
    } catch (error) {
      throw new HttpError(400, error.message, {
        value: 'invalid_request'
      });
    }
  },

  /**
   * Update post data
   *
   * @param {object} publication Publication configuration
   * @param {string} url URL of existing post
   * @param {object} operation Requested operation
   * @returns {object} Post data
   */
  update: async (publication, url, operation) => {
    try {
      if (!publication) {
        throw new Error('No publication configuration provided');
      }

      if (!url) {
        throw new Error('No URL provided');
      }

      if (!url) {
        throw new Error('No update operation provided');
      }

      const {config, me, posts} = publication;
      const {mf2} = await posts.get(url);

      // Add properties
      if (operation.add) {
        mf2.properties = update.addProperties(mf2.properties, operation.add);
      }

      // Replace property entries
      if (operation.replace) {
        mf2.properties = update.replaceEntries(mf2.properties, operation.replace);
      }

      // Remove properties and/or property entries
      if (operation.delete) {
        if (Array.isArray(operation.delete)) {
          mf2.properties = update.deleteProperties(mf2.properties, operation.delete);
        } else {
          mf2.properties = update.deleteEntries(mf2.properties, operation.delete);
        }
      }

      // Post type
      const type = getPostType(mf2);
      const typeConfig = getPostTypeConfig(type, config);

      // Post properties
      const properties = mf2tojf2({items: [mf2]});
      properties['post-type'] = type;

      // Post paths
      const path = renderPath(typeConfig.post.path, properties);
      let updatedUrl = renderPath(typeConfig.post.url, properties);
      updatedUrl = getPermalink(me, updatedUrl);

      // Return post data
      const updatedPostData = {path, url: updatedUrl, properties, mf2};
      return updatedPostData;
    } catch (error) {
      throw new HttpError(400, error.message, {
        value: 'invalid_request'
      });
    }
  }
};