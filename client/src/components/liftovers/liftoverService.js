import config from "../../config";

// Performs a liftover of a genomic interval between GRCh37 and GRCh38 and viceversa

export async function liftoverInterval({ chrom, start, end, fromGenome }) {
  // Decide liftover direction based on the source genome
  const hgParam = fromGenome === "GRCh37" ? "hg19-to-hg38" : "hg38-to-hg19";

  // Build the liftover request URL
  const url = `${config.LIFTOVER_URL}/?hg=${hgParam}&format=interval&chrom=${chrom}&start=${start}&end=${end}`;

  // Call liftover API
  const response = await fetch(url);
  const data = await response.json();

  return data;
}
