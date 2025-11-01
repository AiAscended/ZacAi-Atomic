import { registerSource } from "../url_lookup"

registerSource("general", "Wikipedia", "https://en.wikipedia.org/wiki/", "General reference encyclopedia")
registerSource("general", "Britannica", "https://www.britannica.com/search?query=", "Encyclopedia Britannica")
registerSource(
  "general",
  "Stanford Encyclopedia",
  "https://plato.stanford.edu/search/searcher.py?query=",
  "Stanford Encyclopedia of Philosophy",
)
registerSource("general", "StackOverflow", "https://stackoverflow.com", "Programming Q&A and examples")
registerSource("general", "CommonCrawl", "https://commoncrawl.org", "Web crawl datasets")

export default () => registerSource
