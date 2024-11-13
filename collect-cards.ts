import type { CardFile } from "./types.ts";
import { getFileHash } from "./util.ts";

const IMAGE_EXTS = /\.(jpg|jpeg|png)$/i;
const FILENAME_REGEX =
  /^(?<name>.+?)\s*(?:\[c-(?<copies>\d+)\])?\s*(?:\[b-(?<back>.+?)\])?\s*(?:\((?<hash>[\w\-]{24,})\))?\.(?<extension>jpg|png|jpeg)$/i;

export async function collectCards(
  inputDir: string,
  defaultBack: string,
  verbose: boolean
): Promise<CardFile[]> {
  const imageFiles: string[] = [];
  try {
    for await (const entry of Deno.readDir(inputDir)) {
      if (entry.isFile && IMAGE_EXTS.test(entry.name)) {
        imageFiles.push(entry.name);
      }
    }
  } catch (e) {
    console.error("Error reading input-dir:", inputDir, "– are you sure it exists?");
    Deno.exit(1);
  }

  imageFiles.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  // Make card objects
  const cardFilePromises: Promise<CardFile>[] = imageFiles.map(
    async (filename) => {
      const path = `${inputDir}/${filename}`;
      const match = FILENAME_REGEX.exec(filename);
      const extension = match?.groups?.extension;
      let name = match?.groups?.name + (extension ? `.${extension}` : "");
      name = name.replaceAll("(", "").replaceAll(")", "");
      let nameWithoutExtension = match?.groups?.name || filename.split(".")[0];
      nameWithoutExtension = nameWithoutExtension
        .replaceAll("(", "")
        .replaceAll(")", "");

      const computedHash = (await getFileHash(path)).slice(0, 33);
      const existingId = match?.groups?.hash;
      const hash = existingId ? existingId : computedHash;

      const copies = match?.groups?.copies ? parseInt(match.groups.copies) : 1;
      const back = match?.groups?.back || defaultBack;
      const renameTo = `${nameWithoutExtension} (${hash}).${extension}`;

      return {
        name,
        nameWithoutExtension,
        filename,
        path,
        renameTo,
        hash,
        copies,
        back,
        isCardBack: false, // Updated later
      };
    }
  );

  const cardFiles = await Promise.all(cardFilePromises);

  // Get names of all cardbacks
  const allCardbacks = cardFiles.map((card) => card.back);

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
      card.back = taggedCardBacks[index + 1]?.hash;
      return card;
    }
    const cardback = cardFiles.find(
      (cb) => cb.nameWithoutExtension === card.back
    );
    if (cardback) {
      card.back = cardback.hash;
    }
    return card;
  });

  if (verbose) console.log("Card files:", withCardBacks);

  return withCardBacks;
}
