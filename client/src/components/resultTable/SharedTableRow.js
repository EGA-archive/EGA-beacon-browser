import React from "react";
import { formatAF } from "../constants";

// This component renders a single table row (<tr>) representing allele data for a given population (ancestry or sex).
// It is purely a PRESENTATIONAL component (no data fetching / no grouping logic).
const SharedTableRow = ({
  id,
  category,
  type,
  alleleCount,
  alleleNumber,
  alleleCountHomozygous,
  alleleCountHeterozygous,
  alleleCountHemizygous,
  genotypeHomozygous,
  genotypeHeterozygous,
  genotypeHemizygous,
  alleleFrequency,
  nonBackgroundColor,
  isSubRow = false,
}) => {
  // Row styling logic:
  // 1. subRow → nested population (lighter background)
  // 2. group → main ancestry row
  // 3. default → sex/global rows
  const backgroundColor = isSubRow
    ? "subrow-background"
    : nonBackgroundColor
    ? "group-background"
    : "sex-background";

  // Display helper:
  // Converts null/undefined → "-"
  // Keeps valid 0 values untouched
  const display = (v) => (v === null || v === undefined ? "-" : v);

  // Supports both naming conventions:
  // - alleleCount*
  // - genotype*
  const homozygous = alleleCountHomozygous ?? genotypeHomozygous ?? null;
  const heterozygous = alleleCountHeterozygous ?? genotypeHeterozygous ?? null;
  const hemizygous = alleleCountHemizygous ?? genotypeHemizygous ?? null;

  // Fallback logic:
  // If one genotype count is missing but the other + AC are available, compute the missing value safely.
  // Avoids NaN by checking for nulls.
  const computedHomozygous =
    homozygous ??
    (alleleCount != null && heterozygous != null
      ? alleleCount - heterozygous
      : null);

  const computedHeterozygous =
    heterozygous ??
    (alleleCount != null && homozygous != null
      ? alleleCount - homozygous
      : null);

  // Check if AC/AN are valid to compute frequency if needed
  const hasCounts =
    alleleCount != null && alleleNumber != null && Number(alleleNumber) !== 0;

  // Prefer provided alleleFrequency, otherwise compute it from AC / AN
  const alleleFrequencyRaw =
    alleleFrequency != null
      ? Number(alleleFrequency)
      : hasCounts
      ? Number(alleleCount) / Number(alleleNumber)
      : null;

  return (
    <tr data-id={id} data-category={category}>
      {/* Column 1: Population */}
      <td className={`type-wrap ${backgroundColor}`}>{type}</td>

      {/* Column 2: Allele Count */}
      <td className={`centered-header ${backgroundColor}`}>
        {display(alleleCount)}
      </td>

      {/* Column 3: Allele Number */}
      <td className={`centered-header ${backgroundColor}`}>
        {display(alleleNumber)}
      </td>

      {/* Column 4: Homozygous Count - If not provided: - */}
      <td className={`centered-header ${backgroundColor}`}>
        {display(computedHomozygous)}
      </td>

      {/* Column 5: Heterozygous Count - If not provided: - */}
      <td className={`centered-header ${backgroundColor}`}>
        {display(computedHeterozygous)}
      </td>

      {/* Column 6: Hemizygous Count - If not provided: - */}
      <td className={`centered-header ${backgroundColor}`}>
        {display(hemizygous)}
      </td>

      {/* Column 7: Allele Frequency
// - Use a normal decimal number when the value is >= 1e-5 (e.g., 0.00002 → "0.00002", 0.00001 → "0.00001")
// - Use scientific notation only when the value is > 0 and < 1e-5 (e.g., 0.000001 → "1e-6", -0.0000003 → "-3e-7")
// - Zero stays 0
// - If neither is available, show "-". */}
      <td className={`centered-header ${backgroundColor}`}>
        {alleleFrequencyRaw == null
          ? "-"
          : formatAF(alleleFrequencyRaw, {
              threshold: 1e-5,
              exponentDigits: 2,
            })}
      </td>
    </tr>
  );
};

export default SharedTableRow;
