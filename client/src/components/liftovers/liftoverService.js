import config from "../../config";

// Performs a liftover of a genomic interval between GRCh37 and GRCh38 and viceversa

function cleanLiftoverErrorMessage(errorMessage) {
  if (!errorMessage) return null;

  return errorMessage
    .replace(/^Error:\s*/, "")
    .replace(/\n/g, "")
    .trim();
}

export async function liftoverInterval({
  chrom,
  start,
  refBases,
  altBases,
  fromGenome,
}) {
  // Decide target assembly
  const finalAssembly = fromGenome === "GRCh37" ? "GRCh38" : "GRCh37";

  const params = new URLSearchParams({
    pos: start,
    refBases,
    altBases,
    chr: chrom,
    finalAssembly,
  });

  const url = `${config.LIFTOVER_URL}?${params.toString()}`;

  // https://beacon-network-backend-test.ega-archive.org/liftover?pos=5935162&refBases=A&altBases=T&chr=1&finalAssembly=GRCh38

  // Call liftover API
  const response = await fetch(url);
  const data = await response.json();

  console.log("📡 liftoverInterval response:", data);

  // 1. Backend explicit error (e.g. allele mismatch)
  if (data?.error) {
    throw new Error(cleanLiftoverErrorMessage(data.error));
  }

  // 2. No valid liftover result
  if (!data?.pos) {
    throw new Error(
      "Liftover could not be completed for this variant. The coordinates may not exist in the target assembly."
    );
  }

  // 3. Valid result
  return data;
}
