import { registerSource } from '../url_lookup';

registerSource('general', 'Wikipedia', 'https://en.wikipedia.org', 'General reference');
registerSource(
  'general',
  'StackOverflow',
  'https://stackoverflow.com',
  'Programming Q&A and examples'
);
registerSource('general', 'CommonCrawl', 'https://commoncrawl.org', 'Web crawl datasets');

export default () => registerSource;
