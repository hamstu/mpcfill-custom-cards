# MPCFill Custom Cards

This is a simple, command line application that prepares an XML file for [MPC Autofill](https://github.com/chilli-axe/mpc-autofill) to upload and autofill custom cards from your local hard drive (vs. MPCFill's default behavior which pulls images down from indexed Google Drives).

This script is designed to be run first, to prepare am XML file, which you can then run with MPCFill as usual.

## Usage

First put your custom cards in a directory called `cards` (can be changed, if you like). You can name them however you want, but there are some special modifiers you can use to change number of copies or use custom backs.

### Number of copies

To increase the number of copies of a card, put `[c-N]` in the filename, where `N` is the number of copies you want. E.g., the following will put 4 copies of the card in your order.

```
cards
├── Counterspell [c-4].jpeg
├── default-back.png
```

### Card back

Cards will use the card back of a file named `default-back.[png|jpg|jpeg]` by default. But if it's an MDFC or you want to override that, you can do it with `[b-Card Name]` tag. Where `Card Name` is the name (without file extension) of the card you want to use as a back. Example:

```
cards
├── Counterspell [c-4] [b-My Custom Back].jpeg
├── My Custom Back.jpeg
├── default-back.png
```

For convenience you can also use the `[b-next]` tag, which will use the next card in alphebetical order as the card back. **You must ensure the cards are ordered correctly when sorted alphabetically –  e.g., by renaming them – for this to work.**

```
cards
├── 1 - Ojer Taq, Deepest Foundation [b-next].jpg
├── 2 - Temple of Civilization.jpg
├── default-back.png
```

Note how numbers are prefixed on the cards above to ensure sequential ordering.

### Running the script

Now that your images are ready, head to releases to download the latest release for your system. Place the executable in the same directory as your `cards` folder.

Then you can run it from the command line:

```bash
Usage: mpcfill-cards [OPTIONS...]

Optional flags:
  -h, --help                Display this help and exit
  -i, --input-dir <dir>     Input directory for the custom card images (defaults to ./cards)
  -f, --output-file <file>  Output path for the card XML (defaults to ./cards.xml)
  -b, --default-back <id>   Name (without file extension) of the default card back image (defaults to 'default-back')
  -s, --stock <stock>       Stock type for the cards (defaults to '(S30) Standard Smooth')
  -ff, --foil               Enable foil printing
  -d, --dry-run             Run script without writing any files
  -v, --verbose             Print verbose output to the terminal
```

### Examples:

Run with defaults. Copies images and creates an XML.

```bash
./mpcfill-cards
```

Run with verbose and debug logs:

```bash
./mpcfill-cards --dry-run --verbose
```

### Creating the order

Once this script has run, you can run `mpc-autofill` in the same directory and it should see your custom built XML and properly autofill the images.

## How it works

When MPCFill runs it looks for XML files in the current directory. By crafting an XML with absolute file paths we can force it to upload and autofill our local images, instead of trying to fetch them from Google Drives.

## Local Development

This script is built with Deno and TypeScript.

```bash
git clone git@github.com:hamstu/mpcfill-cards.git
cd mpcfill-cards

deno run --allow-read --allow-write main.ts --dry-run --verbose
```

To build

```bash
./build.sh
```

Then check the releases folder. Currently it build for mac OS (arm/intel) and Windows. [Linux could be added easily as it's supported by Deno](https://docs.deno.com/runtime/reference/cli/compiler/#supported-targets).
