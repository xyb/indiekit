import fs from 'fs';
import * as settingsModel from '../models/settings.js';

/**
 * @exports settingsController
 * @returns {Promise|Object} Configuration object
 */
export const read = async () => {
  // Get app settings
  const app = await settingsModel.getAll();

  // Get package metadata
  const pkg = JSON.parse(fs.readFileSync('package.json'));

  // Combine app settings, package metadata and defaults
  const settings = {
    name: app.name || 'IndieKit',
    version: pkg.version,
    description: pkg.description,
    repository: pkg.repository,
    locale: app.locale || 'en',
    themeColor: app.themeColor || '#0000ee',
    defaultConfigType: app.defaultConfigType || 'jekyll',
    customConfigUrl: app.customConfigUrl || false
  };

  // Return app config
  return settings;
};