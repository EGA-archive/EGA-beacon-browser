import { GNOMAD_GROUPS, POPULATION_NORMALIZATION } from "../constants";
import { normalizeGenotypeCounts } from "./normalizeGenotypeCounts";

const normalizePopulation = (name) => {
  if (!name) return name;

  const trimmed = name.trim();
  const match = trimmed.match(/(.+)\s+(XX|XY)$/);

  if (match) {
    const base = match[1];
    const sex = match[2];
    const normalizedBase = POPULATION_NORMALIZATION[base] || base;
    return `${normalizedBase} ${sex}`;
  }

  return POPULATION_NORMALIZATION[trimmed] || trimmed;
};

const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const safeValue = (v) => v ?? "-";

const indentPopulation = (label, level = 0) => {
  return `${"         ".repeat(level)}${label}`;
};

export const buildPopulationRowsForCsv = ({
  frequencies = [],
  toggle = [],
}) => {
  const frequencyByPopulation = frequencies.reduce((acc, f) => {
    const name = normalizePopulation(f.population);
    const { homozygous, heterozygous, hemizygous } = normalizeGenotypeCounts(f);

    if (!acc[name]) {
      acc[name] = {
        ...f,
        population: name,
        alleleCountHomozygous: homozygous,
        alleleCountHeterozygous: heterozygous,
        alleleCountHemizygous: hemizygous,
      };
    } else {
      acc[name].alleleCount =
        (acc[name].alleleCount || 0) + (f.alleleCount || 0);
      acc[name].alleleNumber =
        (acc[name].alleleNumber || 0) + (f.alleleNumber || 0);
      acc[name].alleleCountHomozygous += homozygous;
      acc[name].alleleCountHeterozygous += heterozygous;
      acc[name].alleleCountHemizygous += hemizygous;
    }

    return acc;
  }, {});

  const rows = [];

  const showAncestry = toggle.includes("ancestry");
  const showSex = toggle.includes("sex");

  const knownPopulations = new Set(
    Object.keys(GNOMAD_GROUPS).flatMap((g) => [g, ...GNOMAD_GROUPS[g]])
  );

  const isSexOnly = (p) => p === "XX" || p === "XY";

  const isSexChild = (p) =>
    Object.keys(GNOMAD_GROUPS).some((g) => p.startsWith(`${g} `));

  const unknownPopulations = Object.values(frequencyByPopulation).filter(
    (f) =>
      !isSexOnly(f.population) &&
      !knownPopulations.has(f.population) &&
      !isSexChild(f.population)
  );

  const sexOnlyRows = ["XX", "XY"]
    .map((sex) => frequencyByPopulation[sex])
    .filter(Boolean);

  const mainGroupsWithData = Object.keys(GNOMAD_GROUPS).filter(
    (groupName) => !!frequencyByPopulation[groupName]
  );

  const hasSingleMainPopulation = mainGroupsWithData.length === 1;

  // toggle = []  -> only Total should appear, so no population rows here
  if (!showAncestry && !showSex) {
    return rows;
  }

  // Case: ancestry or ancestry+sex
  if (showAncestry) {
    Object.entries(GNOMAD_GROUPS)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([groupName, subPopulations]) => {
        const main = frequencyByPopulation[groupName];
        if (!main) return;

        rows.push({
          ...main,
          rowType: "ancestry_main",
          indentLevel: 0,
        });

        const sexRows = ["XX", "XY"]
          .map((sex) => frequencyByPopulation[`${groupName} ${sex}`])
          .filter(Boolean);

        const realSubPopulationRows = subPopulations
          .slice()
          .sort((a, b) => a.localeCompare(b))
          .map((name) => frequencyByPopulation[name])
          .filter(Boolean);

        const shouldHideAncestrySexRows = hasSingleMainPopulation;

        const subRows = [
          ...(showSex && !shouldHideAncestrySexRows ? sexRows : []),
          ...realSubPopulationRows,
        ];

        subRows.forEach((sub) => {
          const isAncestrySexRow = /\s(XX|XY)$/.test(sub.population);

          rows.push({
            ...sub,
            rowType: isAncestrySexRow ? "ancestry_sex" : "ancestry_sub",
            indentLevel: 0,
          });
        });
      });
  }

  // Case: sex-only or ancestry+sex -> global XX / XY
  if (showSex) {
    sexOnlyRows.forEach((row) => {
      rows.push({
        ...row,
        rowType: "global_sex",
        indentLevel: 0,
      });
    });
  }

  // Unknown rows only when ancestry is active
  if (showAncestry) {
    unknownPopulations.forEach((pop) => {
      rows.push({
        ...pop,
        rowType: "unknown",
        indentLevel: 0,
      });
    });
  }

  return rows;
};

export const downloadCSV = (
  tableContainer,
  filename = "beacon-results.csv",
  toggle = [],
  datasets = []
) => {
  if (!datasets || datasets.length === 0) return;

  const csvRows = [];

  csvRows.push([
    "Dataset",
    "Population",
    "Allele Count",
    "Allele Number",
    "Homozygous",
    "Heterozygous",
    "Hemizygous",
    "Allele Frequency",
  ]);

  datasets.forEach((dataset) => {
    const datasetLabel =
      dataset.__source === "lifted"
        ? `${dataset.id} - Lifted-over`
        : dataset.id;

    const rawFrequencies =
      dataset?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies || [];

    if (!rawFrequencies.length) return;

    const normalized = rawFrequencies.map((f) => ({
      ...f,
      population: normalizePopulation(f.population),
    }));

    const total = normalized.find((f) => f.population === "Total");
    const nonTotal = normalized.filter((f) => f.population !== "Total");

    const rows = buildPopulationRowsForCsv({
      frequencies: nonTotal,
      toggle,
    });

    csvRows.push([datasetLabel, "", "", "", "", "", "", ""]);

    rows.forEach((row) => {
      csvRows.push([
        "",
        indentPopulation(row.population, row.indentLevel),
        safeValue(row.alleleCount),
        safeValue(row.alleleNumber),
        safeValue(row.alleleCountHomozygous),
        safeValue(row.alleleCountHeterozygous),
        safeValue(row.alleleCountHemizygous),
        safeValue(row.alleleFrequency),
      ]);
    });

    if (total) {
      const totalCounts = normalizeGenotypeCounts(total);

      csvRows.push([
        "",
        "Total",
        safeValue(total.alleleCount),
        safeValue(total.alleleNumber),
        safeValue(totalCounts.homozygous),
        safeValue(totalCounts.heterozygous),
        safeValue(totalCounts.hemizygous),
        safeValue(total.alleleFrequency),
      ]);
    }

    csvRows.push(["", "", "", "", "", "", "", ""]);
  });

  const csv = csvRows.map((row) => row.map(escapeCSV).join(",")).join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
