require('dotenv').config();

const config = module.exports;

// Server
config.name = 'IndieKit';
config.port = process.env.PORT || 3000;
config.cache = {
  dir: process.env.PWD + '/.cache',
  'max-age': process.env.INDIEKIT_CACHE_EXPIRES || 86400,
  config: 'config.json',
  memos: 'memos.json'
};

// IndieAuth
config.indieauth = {
  'token-endpoint': process.env.INDIEAUTH_TOKEN_ENDPOINT || 'https://tokens.indieauth.com/token'
};

// Publication
config.url = process.env.INDIEKIT_URL || console.error('Missing INDIEKIT_URL');
config['pub-config'] = process.env.INDIEKIT_CONFIG_PATH || 'indiekit.json';

// Github
config.github = {
  token: process.env.GITHUB_TOKEN || console.error('Missing GITHUB_TOKEN'),
  user: process.env.GITHUB_USER || console.error('Missing GITHUB_USER'),
  repo: process.env.GITHUB_REPO || console.error('Missing GITHUB_REPO'),
  branch: process.env.GITHUB_BRANCH || 'master'
};

if (process.env.NODE_ENV === 'test') {
  config.github = {
    token: 'abc123',
    user: 'username',
    repo: 'repo'
  };
}
