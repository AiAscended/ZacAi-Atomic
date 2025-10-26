import { registerSource } from '../url_lookup';

registerSource('internet_search', 'CommonCrawl', 'https://commoncrawl.org', 'Web crawl dataset');
registerSource('internet_search', 'MozRank', 'https://moz.com', 'SEO metrics and ranking signals');
registerSource(
  'internet_search',
  'BingWebMaster',
  'https://www.bing.com/webmaster',
  'Search engine webmaster resources'
);

export default () => registerSource;
