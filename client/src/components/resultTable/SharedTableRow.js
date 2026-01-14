import React from "react";
import { formatAF } from "../constants";

// This component represents a single <tr> row inside a table.
// It displays allele information for a given population type.
const SharedTableRow = ({
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
  // If nonBackgroundColor is true, don't add the background class.
  // Otherwise, apply a default "sex-background" class.
  const backgroundColor = isSubRow
    ? "subrow-background"
    : nonBackgroundColor
    ? "group-background"
    : "sex-background";

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

  // Resolve genotype counts, supporting both allele* and genotype* props
  const homozygous = alleleCountHomozygous ?? genotypeHomozygous;
  const heterozygous = alleleCountHeterozygous ?? genotypeHeterozygous;
  const hemizygous = alleleCountHemizygous ?? genotypeHemizygous;

  return (
    <tr>
      {/* Column 1: Population */}
      <td className={`type-wrap ${backgroundColor}`}>{type}</td>

      {/* Column 2: Allele Count */}
      <td className={`centered-header ${backgroundColor}`}>{alleleCount}</td>

      {/* Column 3: Allele Number */}
      <td className={`centered-header ${backgroundColor}`}>{alleleNumber}</td>

      {/* Column 4: Homozygous Count - If not provided, it tries to calculate it as: alleleCount - heterozygous */}
      <td className={`centered-header ${backgroundColor}`}>
        {homozygous || alleleCount - heterozygous}
      </td>

      {/* Column 5: Heterozygous Count - If not provided, it tries to calculate it as: alleleCount - homozygous */}
      <td className={`centered-header ${backgroundColor}`}>
        {heterozygous || alleleCount - homozygous}
      </td>

      {/* Column 6: Hemizygous Count - If not provided, it hardcodes 0. NOTE: need to review this */}
      <td className={`centered-header ${backgroundColor}`}>
        {hemizygous || "0"}
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
