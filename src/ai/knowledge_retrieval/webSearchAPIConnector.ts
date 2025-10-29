/**
 * File: src/ai/knowledge_retrieval/webSearchAPIConnector.ts
 * Purpose: Web search connector with mock search results for testing
 * Simulates Google, Bing, and DuckDuckGo search results
 */

export interface WebResult {
  id: string
  title: string
  snippet: string
  url?: string
}

/**
 * Mock search function that simulates real search engine results
 * In production, this would connect to real search APIs (Google, Bing, DuckDuckGo)
 */
export const webSearch = async (query: string, limit = 5): Promise<WebResult[]> => {
  const lowerQuery = query.toLowerCase()

  // Programming languages history
  if (lowerQuery.includes("programming language") && lowerQuery.includes("history")) {
    return [
      {
        id: "1",
        title: "History of programming languages - Wikipedia",
        snippet:
          "The first high-level programming language was Plankalkül, created by Konrad Zuse between 1942 and 1945. The first commercially available language was FORTRAN (FORmula TRANslation), developed in 1954-1957 by John Backus at IBM.",
        url: "https://en.wikipedia.org/wiki/History_of_programming_languages",
      },
      {
        id: "2",
        title: "Timeline of programming languages",
        snippet:
          "1957: FORTRAN, 1958: LISP, 1959: COBOL, 1964: BASIC, 1970: Pascal, 1972: C, 1983: C++, 1991: Python, 1995: Java, JavaScript, PHP, 2000: C#, 2009: Go, 2010: Rust, 2012: TypeScript",
        url: "https://en.wikipedia.org/wiki/Timeline_of_programming_languages",
      },
      {
        id: "3",
        title: "Evolution of Programming Languages",
        snippet:
          "Programming languages have evolved from machine code and assembly language to high-level languages that are easier for humans to read and write. Modern languages focus on developer productivity, safety, and performance.",
        url: "https://www.computerhistory.org/timeline/software-languages/",
      },
    ]
  }

  // 99 red balloons
  if (lowerQuery.includes("99") && lowerQuery.includes("red") && lowerQuery.includes("balloon")) {
    return [
      {
        id: "1",
        title: "99 Luftballons - Wikipedia",
        snippet:
          '99 Luftballons (German: "99 Balloons") is a song by the German band Nena from their 1983 self-titled album. An English version titled "99 Red Balloons" was also released. The song is an anti-war protest song about 99 balloons floating into the air, mistaken for UFOs, causing a general to send pilots to investigate, leading to a chain reaction that results in war.',
        url: "https://en.wikipedia.org/wiki/99_Luftballons",
      },
      {
        id: "2",
        title: "Nena - 99 Red Balloons (Official Music Video)",
        snippet:
          "The iconic 1980s anti-war song by German band Nena. The song reached #1 in multiple countries and became one of the most successful German-language songs in English-speaking countries.",
        url: "https://www.youtube.com/watch?v=La4Dcd1aUcE",
      },
    ]
  }

  // AI history / who invented AI
  if (
    (lowerQuery.includes("ai") || lowerQuery.includes("artificial intelligence")) &&
    (lowerQuery.includes("invent") ||
      lowerQuery.includes("history") ||
      lowerQuery.includes("who") ||
      lowerQuery.includes("origin"))
  ) {
    return [
      {
        id: "1",
        title: "History of artificial intelligence - Wikipedia",
        snippet:
          'The field of artificial intelligence (AI) was formally founded in 1956 at a conference at Dartmouth College. The term "artificial intelligence" was coined by John McCarthy. Early pioneers include Alan Turing (Turing Test, 1950), Marvin Minsky, and Herbert Simon.',
        url: "https://en.wikipedia.org/wiki/History_of_artificial_intelligence",
      },
      {
        id: "2",
        title: "Who Invented AI? The Fathers of Artificial Intelligence",
        snippet:
          "John McCarthy is considered the father of AI for coining the term in 1956. Alan Turing laid the theoretical groundwork with his 1950 paper 'Computing Machinery and Intelligence.' Other key figures include Marvin Minsky, Herbert Simon, and Allen Newell.",
        url: "https://www.britannica.com/technology/artificial-intelligence",
      },
      {
        id: "3",
        title: "Why was AI invented?",
        snippet:
          "AI was invented to create machines that could perform tasks requiring human intelligence: reasoning, learning, problem-solving, perception, and language understanding. The goal was to automate complex tasks and augment human capabilities.",
        url: "https://www.ibm.com/topics/artificial-intelligence",
      },
    ]
  }

  // How AI works
  if (
    (lowerQuery.includes("ai") || lowerQuery.includes("artificial intelligence")) &&
    (lowerQuery.includes("work") || lowerQuery.includes("how") || lowerQuery.includes("does"))
  ) {
    return [
      {
        id: "1",
        title: "How Does AI Work? | IBM",
        snippet:
          "AI works by combining large amounts of data with fast, iterative processing and intelligent algorithms. AI systems learn from patterns in data through machine learning, neural networks, and deep learning. They use this learning to make predictions, classifications, and decisions.",
        url: "https://www.ibm.com/topics/artificial-intelligence",
      },
      {
        id: "2",
        title: "Artificial Intelligence: How AI Works",
        snippet:
          "AI systems process data through layers of artificial neurons (neural networks), adjusting weights and biases through training. They use techniques like supervised learning, unsupervised learning, and reinforcement learning to improve performance over time.",
        url: "https://www.techtarget.com/searchenterpriseai/definition/AI-Artificial-Intelligence",
      },
    ]
  }

  // Generic fallback for any search query
  if (lowerQuery.length > 3) {
    return [
      {
        id: "1",
        title: `Search results for: ${query}`,
        snippet: `Mock search result for "${query}". In production, this would return real results from Google, Bing, or DuckDuckGo. The search system is functioning correctly.`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      },
    ]
  }

  return []
}

export const searchWeb = webSearch
