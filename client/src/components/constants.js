export const TOOLTIP_TEXTS = {
  alleleCount: "Number of copies of a specific allele in a population.",
  alleleNumber: "The total number of called alleles.",
  homozygous: "Number of individuals homozygous for the allele.",
  heterozygous: "Number of individuals heterozygous for the allele.",
  frequency: "Incidence of the allele in a population.",
  population:
    "This term is referring to biological sex and ancestry or ethnicity as reported by individual studies.",
};

export const getPopulationFrequency = (results, population) => {
  if (!results || results.length === 0) return null;

  for (const result of results) {
    const pops = result?.frequencyInPopulations?.[0]?.frequencies;
    const match = pops?.find((p) => p.population === population);
    if (match) return match;
  }

  return null;
};
