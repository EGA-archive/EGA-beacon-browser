// Utility helpers

// Parses a variant string into a structured object
// Adds "chr" prefix to chromosome
// Converts position to a number
export function parseVariant(variant) {
  const [chrom, pos, ref, alt] = variant.split("-");
  return {
    chrom: `chr${chrom}`,
    pos: Number(pos),
    ref,
    alt,
  };
}

// Builds a variant string from structured components
// Removes the "chr" prefix before returning the final string
export function buildVariant({ chrom, pos, ref, alt }) {
  return `${chrom.replace("chr", "")}-${pos}-${ref}-${alt}`;
}

// Computes the genomic interval covered by a variant
// Currently assumes single-base variants (end = start + 1)
// Used for liftover and interval-based queries
export function getInterval(pos) {
  return {
    start: pos,
    end: pos + 1,
  };
}
