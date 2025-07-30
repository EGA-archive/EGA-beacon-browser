// Tooltip text shown when hovering over table headers to explain what each column means
export const TOOLTIP_TEXTS = {
  alleleCount: "Number of copies of a specific allele in a population.",
  alleleNumber: "The total number of called alleles.",
  homozygous: "Number of individuals homozygous for the allele.",
  heterozygous: "Number of individuals heterozygous for the allele.",
  frequency: "Incidence of the allele in a population.",
  population:
    "This term is referring to biological sex and ancestry or ethnicity as reported by individual studies.",
};

// This function gets the frequency info for a specific population from the results
export const getPopulationFrequency = (results, population) => {
  // First condition: if the results are missing, nothing is found
  if (!results || results.length === 0) return null;

  // For of loop to check each result
  for (const result of results) {
    // Get the list of frequencies for different populations
    const pops = result?.frequencyInPopulations?.[0]?.frequencies;
    // Look for the population that matches the one we're interested in
    const match = pops?.find((p) => p.population === population);
    // If a matching population is found, return its frequency data
    if (match) return match;
  }
  // If the match is not found, return null
  return null;
};
