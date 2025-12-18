import { registerSource } from "../url_lookup";

// Register a small set of canonical English sources (can be extended at runtime)
registerSource(
  "english",
  "Merriam-Webster",
  "https://www.merriam-webster.com",
  "Dictionary and usage",
);
registerSource(
  "english",
  "Oxford",
  "https://www.oxfordlearnersdictionaries.com",
  "Dictionary and corpus examples",
);
registerSource(
  "english",
  "Thesaurus",
  "https://www.thesaurus.com",
  "Synonyms/thesaurus",
);

export const englishSources = () => registerSource;

export default englishSources;
