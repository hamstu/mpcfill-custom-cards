import { buildXML } from "./build-xml.ts";
import { collectCards } from "./collect-cards.ts";
import { getBracket } from "./get-bracket.ts";
import { parseArguments, printHelp } from "./parse-args.ts";

async function main(inputArgs: string[]): Promise<void> {
  const args = parseArguments(inputArgs);

  // If help flag enabled, print help.
  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  const outputFile: string = args["output-file"] || "cards.xml";
  const inputDir: string = args["input-dir"] || "./cards";
  const defaultBack: string = args["default-back"] || "default-back";
  const dryRun: boolean = args["dry-run"] || false;
  const verbose: boolean = args["verbose"] || false;
  const stock: string = args["stock"] || "(S30) Standard Smooth";
  const foil: boolean = args["foil"] || false;

  const { cards, foundDefaultBack } = await collectCards(
    inputDir,
    defaultBack,
    verbose
  );

  if (cards.length === 0) {
    console.log("No card images found in", inputDir);
    Deno.exit(1);
  }

  if (!foundDefaultBack) {
    console.error(
      `No default back image found with the name "${defaultBack}" in the ${inputDir} directory.`
    );
    Deno.exit(1);
  }

  // Get bracket
  const bracket = getBracket(cards.filter((c) => !c.isCardBack).length);

  if (!bracket) {
    console.error("Number of cards exceeds the maximum bracket size of 612.");
    Deno.exit(1);
  }

  // Output xml file
  const xml = buildXML(cards, foundDefaultBack, {
    stock,
    foil,
    bracket,
  });

  if (verbose) console.log("Final XML\n", xml);

  if (!dryRun) await Deno.writeTextFile(outputFile, xml);
  console.log("✅ Wrote,", outputFile, "to disk.");
  console.log("You are ready to run MPCFill");
}

main(Deno.args);
