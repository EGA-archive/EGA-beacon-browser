export function parseVariant(variant) {
  const [chrom, pos, ref, alt] = variant.split("-");
  return {
    chrom: `chr${chrom}`,
    pos: Number(pos),
    ref,
    alt,
  };
}

export function buildVariant({ chrom, pos, ref, alt }) {
  return `${chrom.replace("chr", "")}-${pos}-${ref}-${alt}`;
}

export function getInterval(pos) {
  return {
    start: pos,
    end: pos + 1,
  };
}
