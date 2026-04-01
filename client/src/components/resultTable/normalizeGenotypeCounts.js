// Normalizes genotype count keys from different datasets/versions into one stable shape.

export const normalizeGenotypeCounts = (freq = {}) => {
  const pick = (...values) =>
    values.find((v) => v !== undefined && v !== null) ?? null;

  return {
    homozygous: pick(freq.alleleCountHomozygous, freq.genotypeHomozygous),
    heterozygous: pick(freq.alleleCountHeterozygous, freq.genotypeHeterozygous),
    hemizygous: pick(freq.alleleCountHemizygous, freq.genotypeHemizygous),
  };
};
