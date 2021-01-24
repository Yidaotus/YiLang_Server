import config from '../config.json';
const isDebug = process.env.NODE_ENV !== 'production';

export { config, isDebug };
