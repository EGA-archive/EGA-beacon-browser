// Normalizes genotype count keys from different datasets/versions into one stable shape.

// NOTE: For now, hemizygous/homozygous/heterozygous defaults to 0 when missing.

export const normalizeGenotypeCounts = (freq = {}) => {
  const homozygous = freq.alleleCountHomozygous ?? freq.genotypeHomozygous ?? 0;

  const heterozygous =
    freq.alleleCountHeterozygous ?? freq.genotypeHeterozygous ?? 0;

  const hemizygous = freq.alleleCountHemizygous ?? freq.genotypeHemizygous ?? 0;

  return { homozygous, heterozygous, hemizygous };
};
