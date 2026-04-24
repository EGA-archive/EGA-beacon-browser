// Performs liftover for a single variant string between genome assemblies.
// Steps:
// 1. Parse the input variant (chr-pos-ref-alt)
// 2. Compute the genomic interval covered by the variant
// 3. Call the liftover service to convert coordinates
// 4. Validate the liftover response
// 5. Rebuild and return the variant using the lifted position

import { parseVariant, buildVariant } from "./variantParser";
import { liftoverInterval } from "./liftoverService";

export async function liftoverVariant(variant, genome) {
  const parsed = parseVariant(variant);

  const normalizeChrom = (chrom) => chrom.replace(/^chr/i, "");

  const result = await liftoverInterval({
    chrom: normalizeChrom(parsed.chrom),
    start: parsed.pos,
    refBases: parsed.ref,
    altBases: parsed.alt,
    fromGenome: genome,
  });

  console.log("📡 LIFTOVER RESPONSE:", result);

  if (!result?.pos) {
    console.error("❌ Invalid liftover response:", result);
    throw new Error("Invalid liftover response");
  }

  const liftedPos = Number(result.pos);

  const liftedVariant = buildVariant({
    chrom: normalizeChrom(result.chr || parsed.chrom),
    pos: liftedPos,
    ref: result.ref || parsed.ref,
    alt: result.alt || parsed.alt,
  });

  return liftedVariant;
}
