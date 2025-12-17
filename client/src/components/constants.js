// Tooltip text shown when hovering over table headers to explain what each column means
export const TOOLTIP_TEXTS = {
  alleleCount: "Number of copies of a specific allele in a population.",
  alleleNumber: "The total number of called alleles.",
  homozygous: "Number of individuals homozygous for the alternate allele.",
  heterozygous: "Number of individuals heterozygous for the alternate allele.",
  hemizygous: "Number of individuals hemizygous for the alternate allele.",
  frequency: "Allele frequency of the alternate allele in a population.",
  population:
    "A group of individuals characterized by biological sex and by ancestry or ethnicity, as reported within individual studies.",
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

// Purpose of this function: returning a string for an allele frequency
// That follows the rules of:
// Shows a normal decimal when the value is >= 1e-5
// Use scientific notation only when the value is > 0 and < 1e-5
// Returns - if value is missing

export function formatAF(
  value,
  {
    threshold = 1e-5, // threshold for switching to scientific notetion
    decimalDigits = 6, // max decimals for the decimal format
    exponentDigits = 2, // digits after the decimal in scientific
  } = {}
) {
  // This handles the missing input
  if (value === null || value === undefined) return "-";
  // This normalizes to a number, it accepts numbers and rejects NaN or Infinite
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "-";
  // This reads the absolute value to decide which format to use
  const absoluteValue = Math.abs(n);

  if (absoluteValue !== 0 && absoluteValue < threshold) {
    // Scientific notation below threshold (non-zero only)
    return n.toExponential(exponentDigits).replace("+", "");
  }

  // Decimal notation at/above threshold
  // zero stays as "0", not scientific
  const formatted = n.toFixed(decimalDigits); // fixed then trim
  // This trims trailing zeros and a trailing decimal point
  return formatted.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
}
