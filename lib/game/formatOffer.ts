/**
 * Formats an offer cost like "3 Offers (3 sips)" using the game's offer_definition string.
 * offerDefinition is stored on the game row, e.g. "1 sip".
 */
export function formatOfferCost(offerCost: number, offerDefinition: string): string {
  const match = offerDefinition.trim().match(/^(\d+)\s+(.+)$/);
  const offerLabel = `${offerCost} Offer${offerCost !== 1 ? "s" : ""}`;
  if (match) {
    const unitCount = parseInt(match[1], 10);
    const unit = match[2];
    const total = offerCost * unitCount;
    const unitPlural = total !== 1 && !unit.endsWith("s") ? unit + "s" : unit;
    return `${offerLabel} (${total} ${unitPlural})`;
  }
  return `${offerLabel} (${offerCost}× ${offerDefinition})`;
}
