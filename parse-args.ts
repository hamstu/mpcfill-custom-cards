import { parse } from "https://deno.land/std@0.200.0/flags/mod.ts";
import type { Args } from "https://deno.land/std@0.200.0/flags/mod.ts";

export function parseArguments(args: string[]): Args {
  // All boolean arguments
  const booleanArgs = ["dry-run", "verbose", "foil"];

  // All string arguments
  const stringArgs = ["output-file", "output-dir", "input-dir", "default-back", "stock"];

  // And a list of aliases
  const alias = {
    help: "h",
    "dry-run": "d",
    "output-file": "f",
    "output-dir": "o",
    "input-dir": "i",
    "default-back": "b",
    "verbose": "v",
    "stock": "s",
    "foil": "ff",
  };

  return parse(args, {
    alias,
    boolean: booleanArgs,
    string: stringArgs,
    stopEarly: false,
    "--": true,
  });
}

export function printHelp(): void {
  console.log(`Usage: mpcfill-custom-cards [OPTIONS...]`);
  console.log("\nOptional flags:");
  console.log("  -h, --help                Display this help and exit");
  console.log("  -i, --input-dir <dir>     Input directory for the custom card images (defaults to ./cards)");
  console.log("  -f, --output-file <file>  Output path for the card XML (defaults to ./cards.xml)");
  console.log("  -b, --default-back <id>   Name (without file extension) of the default card back image (defaults to 'default-back')");
  console.log("  -s, --stock <stock>       Stock type for the cards (defaults to '(S30) Standard Smooth')");
  console.log("  -ff, --foil               Enable foil printing");
  console.log("  -d, --dry-run             Run script without writing any files");
  console.log("  -v, --verbose             Print verbose output to the terminal");
}
