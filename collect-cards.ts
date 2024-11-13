import type { CardFile } from "./types.ts";

const IMAGE_EXTS = /\.(jpg|jpeg|png)$/i;
const FILENAME_REGEX =
  /^(?<name>.+?)\s*(?:\[c-(?<copies>\d+)\])?\s*(?:\[b-(?<back>.+?)\])?\s*(?:\((?<hash>[\w\-]{24,})\))?\.(?<extension>jpg|png|jpeg)$/i;

export async function collectCards(
  inputDir: string,
  defaultBack: string,
  verbose: boolean
): Promise<{ cards: CardFile[]; foundDefaultBack: string | null }> {
  const imageFiles: string[] = [];
  let foundDefaultBack: string | null = null;
  try {
    for await (const entry of Deno.readDir(inputDir)) {
      if (entry.isFile && IMAGE_EXTS.test(entry.name)) {
        imageFiles.push(entry.name);
      }
      if (entry.isFile && entry.name.startsWith(`${defaultBack}.`)) {
        const relativePath = `${inputDir}/${entry.name}`;
        const absolutePath = new URL(relativePath, import.meta.url);
        const path = decodeURIComponent(absolutePath.pathname);
        foundDefaultBack = path;
      }
    }
  } catch (e) {
    console.error(
      "Error reading input-dir:",
      inputDir,
      "– are you sure it exists?"
    );
    Deno.exit(1);
  }

  imageFiles.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  // Make card objects
  const cardFiles: CardFile[] = imageFiles.map((filename) => {
    const relativePath = `${inputDir}/${filename}`;
    const absolutePath = new URL(relativePath, import.meta.url);
    const path = decodeURIComponent(absolutePath.pathname);
    const match = FILENAME_REGEX.exec(filename);
    const copies = match?.groups?.copies ? parseInt(match.groups.copies) : 1;
    const back = match?.groups?.back;
    const nameWithoutExtension = match?.groups?.name || filename;

    return {
      nameWithoutExtension,
      filename,
      path,
      copies,
      back,
      isCardBack: false, // Will be updated later
    };
  });

  // Get names of all cardbacks
  const allCardbacks = cardFiles.map((card) => card.back).filter(Boolean);

  // Tag cardbacks (any cards that are used as cardbacks)
  const taggedCardBacks = cardFiles.map((card, index) => {
    if (allCardbacks.find((cb) => cb === card.nameWithoutExtension)) {
      card.isCardBack = true;
    }
    if (card.back === "next") {
      cardFiles[index + 1].isCardBack = true;
    }
    if (card.nameWithoutExtension === defaultBack) {
      card.isCardBack = true;
    }
    return card;
  });

  // Replace cardback names with hashes
  const withCardBacks = taggedCardBacks.map((card, index) => {
    // shortcut, if the cardback is "next", use the next card in the list
    if (card.back === "next") {
      card.back = taggedCardBacks[index + 1]?.path;
      return card;
    }
    const cardback = cardFiles.find(
      (cb) => cb.nameWithoutExtension === card.back
    );
    if (cardback) {
      card.back = cardback.path;
    }
    return card;
  });

  if (verbose) console.log("Card files:", withCardBacks);

  return { cards: withCardBacks, foundDefaultBack };
}
