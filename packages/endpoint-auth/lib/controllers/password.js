import { validationResult } from "express-validator";
import { createPasswordHash } from "../password.js";

export const passwordController = {
  /**
   * New password request
   *
   * @param {object} request - HTTP request
   * @param {object} response - HTTP response
   * @returns {object} HTTP response
   */
  get(request, response) {
    const { name } = request.app.locals.application;

    response.render("new-password", {
      title: response.__("auth.newPassword.title"),
      notice: request.query.setup
        ? response.__("auth.newPassword.setup.text", { app: name })
        : false,
    });
  },

  /**
   * New password response
   *
   * @param {object} request - HTTP request
   * @param {object} response - HTTP response
   * @returns {object} HTTP response
   */
  async post(request, response) {
    const { password } = request.body;

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).render("new-password", {
        title: response.__("auth.newPassword.title"),
        errors: errors.mapped(),
      });
    }

    if (password) {
      const secret = await createPasswordHash(password);

      response.render("new-password", {
        title: response.__("auth.newPassword.title"),
        password,
        secret,
      });
    }
  },
};
