// Publish only independently verifiable mentions, with permission for any quote.
// A paid audit is not an endorsement. Leave this empty until a genuine mention exists.
export type ExternalMention = {
  publisher: string;
  title: string;
  url: `https://${string}`;
  published: `${number}-${number}-${number}`;
};

export const externalMentions: readonly ExternalMention[] = [];
