// Performs liftover for a single variant string between genome assemblies.
// Steps:
// 1. Parse the input variant (chr-pos-ref-alt)
// 2. Compute the genomic interval covered by the variant
// 3. Call the liftover service to convert coordinates
// 4. Validate the liftover response
// 5. Rebuild and return the variant using the lifted position

import { parseVariant, buildVariant, getInterval } from "./variantParser";
import { liftoverInterval } from "./liftoverService";

export async function liftoverVariant(variant, genome) {
  // Parse the variant into structured components (chrom, pos, ref, alt)
  const parsed = parseVariant(variant);

  // Compute start/end interval based on position and reference length
  const { start, end } = getInterval(parsed.pos, parsed.ref);

  // Call liftover API to convert coordinates between assemblies
  const result = await liftoverInterval({
    chrom: parsed.chrom,
    start,
    end,
    fromGenome: genome,
  });

  // Guard against invalid or empty liftover responses
  if (result.output_start == null) {
    throw new Error("Invalid liftover response");
  }

  // Build and return the lifted variant string using the new position
  return buildVariant({
    chrom: parsed.chrom,
    pos: Number(result.output_start),
    ref: parsed.ref,
    alt: parsed.alt,
  });
}
