import xmlFormat from "npm:xml-formatter";

import { CardFile, XMLConfig } from "./types.ts";

export function buildXML(cards: CardFile[], defaultBack: string, config: XMLConfig): string {
  let quantity = 0;
  const fronts = [];
  const backs = [];
  const backMap = new Map<
    string,
    { slots: string; name: string; query: string }
  >();

  let slotCounter = 0;

  for (const card of cards) {
    if (card.isCardBack) continue;

    const frontSlots = Array.from(
      { length: card.copies },
      (_, i) => slotCounter + i
    ).join(",");
    fronts.push({
      id: card.path,
      slots: frontSlots,
      name: card.filename,
      query: card.filename,
    });
    quantity += card.copies;

    if (card.back) {
      if (!backMap.has(card.back)) {
        backMap.set(card.back, {
          slots: frontSlots,
          name:
            cards.find((c) => c.path === card.back)?.filename ||
            "Unknown Back Name",
          query:
            cards.find((c) => c.path === card.back)?.filename ||
            "Unknown Back Query",
        });
      } else {
        const existingBack = backMap.get(card.back)!;
        existingBack.slots += `,${frontSlots}`;
      }
    }

    slotCounter += card.copies;
  }

  for (const [id, { slots, name, query }] of backMap.entries()) {
    backs.push({ id, slots, name, query });
  }

  const frontsXML = fronts
    .map(
      ({ id, slots, name, query }) =>
        `<card>\n<id>${id}</id>\n<slots>${slots}</slots>\n<name>${name}</name>\n<query>${query}</query>\n</card>`
    )
    .join("\n");

  const backsXML = backs
    .map(
      ({ id, slots, name, query }) =>
        `<card>\n<id>${id}</id>\n<slots>${slots}</slots>\n<name>${name}</name>\n<query>${query}</query>\n</card>`
    )
    .join("\n");

  const xml = `
<order>
    <details>
        <quantity>${quantity}</quantity>
        <bracket>${config.bracket}</bracket>
        <stock>${config.stock}</stock>
        <foil>${config.foil}</foil>
    </details>
    <fronts>
        ${frontsXML}
    </fronts>
    <backs>
        ${backsXML}
    </backs>
    <cardback>${defaultBack}</cardback>
</order>`.trim();

  // @ts-expect-error - Deno doesn't understand the types for this
  const formatted = xmlFormat(xml, { collapseContent: true });

  return formatted;
}
