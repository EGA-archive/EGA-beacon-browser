import { parseVariant, buildVariant, getInterval } from "./variantParser";
import { liftoverInterval } from "./liftoverService";

export async function liftoverVariant(variant, genome) {
  const parsed = parseVariant(variant);
  const { start, end } = getInterval(parsed.pos, parsed.ref);

  const result = await liftoverInterval({
    chrom: parsed.chrom,
    start,
    end,
    fromGenome: genome,
  });

  console.log("res", result);

  if (result.output_start == null) {
    throw new Error("Invalid liftover response");
  }

  return buildVariant({
    chrom: parsed.chrom,
    pos: Number(result.output_start),
    ref: parsed.ref,
    alt: parsed.alt,
  });
}
