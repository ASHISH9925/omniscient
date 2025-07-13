interface User {
  username: string;
  profile: { image: string };
  messages: string[];
}

interface CurrentUser {
  name: string;
}

interface Data {
  current_user: CurrentUser;
  messages: User[];
}

interface UserResult {
  username: string;
  image: string;
  word_freq: string[];
  len: number;
}

interface Result {
  users: UserResult[];
  max_len: number;
  current_user: CurrentUser;
}

// Optimized tokenizer with single regex operation - only words, no numbers
const tokenize = (text: string): string[] =>
  text.toLowerCase().match(/[a-z]+/g) || [];

// Frequency counter using reduce for better performance
const createFreqDist = (tokens: string[]): Map<string, number> =>
  tokens.reduce(
    (freq, token) => freq.set(token, (freq.get(token) || 0) + 1),
    new Map()
  );

// Get top N words efficiently
const getTopWords = (freq: Map<string, number>, limit: number): string[] =>
  [...freq.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);

// Comprehensive stopwords set
const STOPWORDS = new Set([
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "s",
  "k",
  "to",
  "u",
  "no",
  "ok",
]);

// Add username parts to stopwords (DRY helper)
const addUsernameToStopwords = (
  stopwords: Set<string>,
  username: string
): void => {
  username.split(" ").forEach((part) => stopwords.add(part.toLowerCase()));
};

// Process single user's messages (DRY extraction)
const processUserMessages = (
  user: User,
  stopwords: Set<string>
): { words: string[]; freq: Map<string, number> } => {
  const tokens = tokenize(user.messages.join(" "));
  const words = tokens.filter((w) => !stopwords.has(w));
  return { words, freq: createFreqDist(words) };
};

function processMessages(data: Data): Result {
  const stopwords = new Set(STOPWORDS);

  // Add current user's name to stopwords once
  addUsernameToStopwords(stopwords, data.current_user.name);

  let maxLen = 0;
  const users: UserResult[] = [];

  for (const user of data.messages) {
    // Add current user's username to stopwords
    addUsernameToStopwords(stopwords, user.username);

    // Process user messages
    const { words, freq } = processUserMessages(user, stopwords);

    // Update max length
    maxLen = Math.max(maxLen, words.length);

    // Build user result
    users.push({
      username: user.username,
      image: user.profile.image,
      word_freq: getTopWords(freq, 10),
      len: words.length,
    });
  }

  return {
    users,
    max_len: maxLen,
    current_user: data.current_user,
  };
}

import { publicProcedure } from "../trpc";
import data from "../../assets/data.json";

export const getMessageAnalysis = publicProcedure.query(async () => {
  return processMessages(data as Data);
});
