import config from "../../config";

// Performs a liftover of a genomic interval between GRCh37 and GRCh38

function cleanLiftoverErrorMessage(errorMessage) {
  if (!errorMessage) return null;

  return errorMessage
    .replace(/^Error:\s*/, "")
    .replace(/\n/g, "")
    .trim();
}

export async function liftoverInterval({ chrom, start, fromGenome }) {
  // Convert assemblies to UCSC liftover format
  const hg = fromGenome === "GRCh37" ? "hg19-to-hg38" : "hg38-to-hg19";

  // UI is 1-based
  // UCSC interval API expects 0-based half-open interval
  const zeroBasedStart = Number(start) - 1;
  const zeroBasedEnd = Number(start);

  const params = new URLSearchParams({
    hg,
    format: "interval",
    chrom: `chr${chrom}`,
    start: zeroBasedStart,
    end: zeroBasedEnd,
  });

  const url = `${config.LIFTOVER_URL}?${params.toString()}`;

  const response = await fetch(url);

  const data = await response.json();

  // Backend explicit error
  if (data?.error) {
    throw new Error(cleanLiftoverErrorMessage(data.error));
  }

  // No valid result
  if (!data?.output_pos) {
    throw new Error("Liftover could not be completed for this variant.");
  }

  return data;
}
