const BASE_URL = "https://beacon-apis-test.ega-archive.org/liftover";

export async function liftoverInterval({ chrom, start, end, fromGenome }) {
  const hgParam = fromGenome === "GRCh37" ? "hg19-to-hg38" : "hg38-to-hg19";

  const url = `${BASE_URL}/?hg=${hgParam}&format=interval&chrom=${chrom}&start=${start}&end=${end}`;

  console.log("[LIFTOVER SERVICE]", {
    fromGenome,
    hgParam,
    chrom,
    start,
    end,
    url,
  });

  const response = await fetch(url);
  const data = await response.json();

  console.log("[LIFTOVER SERVICE] response", data);

  return data;
}
