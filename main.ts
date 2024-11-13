import { buildXML } from "./build-xml.ts";
import { collectCards } from "./collect-cards.ts";
import { parseArguments, printHelp } from "./parse-args.ts";

async function main(inputArgs: string[]): Promise<void> {
  const args = parseArguments(inputArgs);

  // If help flag enabled, print help.
  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  const outputDir: string = args["output-dir"] || "./cards";
  const outputFile: string = args["output-file"] || "cards.xml";
  const inputDir: string = args["input-dir"] || "./custom-cards";
  const defaultBack: string = args["default-back"] || "default-back";
  const dryRun: boolean = args["dry-run"] || false;
  const verbose: boolean = args["verbose"] || false;

  const cards = await collectCards(inputDir, defaultBack, verbose);

  if (cards.length === 0) {
    console.log("No card images found in", inputDir);
    Deno.exit(1);
  }

  // Copy all to output dir, renaming if necessary
  if (!dryRun) await Deno.mkdir(outputDir, { recursive: true });
  for (const card of cards) {
    const newPath = `${outputDir}/${card.renameTo || card.filename}`;
    if (!dryRun) await Deno.copyFile(card.path, newPath);
    if (verbose) console.log(`-> Copied ${card.path} to ${newPath}`);
  }

  // Output xml file
  const xml = buildXML(cards, {
    stock: "(S30) Standard Smooth",
    foil: false,
    bracket: 18, // TODO; Update this to be calculated
  });

  if (verbose) console.log("Final XML\n", xml);

  if (!dryRun) await Deno.writeTextFile(outputFile, xml);
  console.log("✅ Wrote,", outputFile, "to disk.");
  console.log("You are ready to run MPCFill");
}

main(Deno.args);
