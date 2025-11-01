import { registerSource } from "../url_lookup"

registerSource("internet_search", "CommonCrawl", "https://commoncrawl.org", "Web crawl dataset")
registerSource("internet_search", "MozRank", "https://moz.com", "SEO metrics and ranking signals")
registerSource(
  "internet_search",
  "BingWebMaster",
  "https://www.bing.com/webmaster",
  "Search engine webmaster resources",
)

registerSource("internet_search", "Google", "https://www.google.com/search?q=", "Google Search")
registerSource("internet_search", "Bing", "https://www.bing.com/search?q=", "Bing Search")
registerSource("internet_search", "DuckDuckGo", "https://duckduckgo.com/?q=", "DuckDuckGo Search")
registerSource("internet_search", "Wikipedia", "https://en.wikipedia.org/wiki/", "Wikipedia")

export default () => registerSource
