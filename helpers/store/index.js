import { IndiekitError } from "@indiekit/error";
import { fetch } from "undici";

const defaults = {
  baseUrl: "https://store.example",
};

/**
 * @typedef Response
 * @property {object} response - HTTP response
 */
export default class TestStore {
  constructor(options = {}) {
    this.id = "test-store";
    this.meta = import.meta;
    this.name = "Test store";
    this.options = { ...defaults, ...options };
  }

  get info() {
    const { baseUrl, user } = this.options;
    return {
      name: "Test store",
      uid: `${baseUrl}/${user}`,
    };
  }

  /**
   * @private
   * @param {string} path - Request path
   * @param {string} [method=GET] - Request method
   * @param {object} [body] - Request body
   * @returns {Function} Store client interface
   */
  async #client(path, method = "GET", body) {
    const { baseUrl, user } = this.options;
    const url = new URL(path, `${baseUrl}/${user}/`);

    try {
      const response = await fetch(url.href, {
        method,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response;
    } catch (error) {
      throw new IndiekitError(error.message, {
        cause: error,
        plugin: this.name,
        status: error.status,
      });
    }
  }

  /**
   * Create file
   *
   * @param {string} path - Path to file
   * @param {string} content - File content
   * @param {string} message - Commit message
   * @returns {Promise<Response>} A promise to the response
   */
  async createFile(path, content, message) {
    await this.#client(path, "PUT", { content, message });
    return true;
  }

  /**
   * Read file
   *
   * @param {string} path - Path to file
   * @returns {Promise<Response>} A promise to the response
   */
  async readFile(path) {
    const response = await this.#client(path);
    const { content } = await response.json();
    return content;
  }

  /**
   * Update file
   *
   * @param {string} path - Path to file
   * @param {string} content - File content
   * @param {string} message - Commit message
   * @returns {Promise<Response>} A promise to the response
   */
  async updateFile(path, content, message) {
    await this.#client(path, "PATCH", { content, message });
    return true;
  }

  /**
   * Delete file
   *
   * @param {string} path - Path to file
   * @param {string} message - Commit message
   * @returns {Promise<Response>} A promise to the response
   */
  async deleteFile(path, message) {
    await this.#client(path, "DELETE", { message });
    return true;
  }

  init(Indiekit) {
    Indiekit.addStore(this);
  }
}
