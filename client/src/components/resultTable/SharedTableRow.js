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
  isSexRow,
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

  const isGlobalSexRow = category === "global_sex";
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
  const alleleFrequencyRaw =
    alleleFrequency !== null && alleleFrequency !== undefined
      ? Number(alleleFrequency)
      : null;

  return (
    <tr data-id={id} data-category={category}>
      {/* Column 1: Population */}
      <td
        className={
          isGlobalSexRow
            ? "beaconized global-row-background dataset-col"
            : `type-wrap ${backgroundColor} ${
                isSubRow && isSexRow ? "sex-subrow" : ""
              }`
        }
      >
        {type}
      </td>

      {/* Column 2: Allele Count */}
      <td
        className={
          isGlobalSexRow
            ? "beaconized global-row-background centered"
            : `centered-header ${backgroundColor}`
        }
      >
        {display(alleleCount)}
      </td>

      {/* Column 3: Allele Number */}
      <td
        className={
          isGlobalSexRow
            ? "beaconized global-row-background centered"
            : `centered-header ${backgroundColor}`
        }
      >
        {display(alleleNumber)}
      </td>

      {/* Column 4: Homozygous Count */}
      <td
        className={
          isGlobalSexRow
            ? "beaconized global-row-background centered"
            : `centered-header ${backgroundColor}`
        }
      >
        {display(homozygous)}
      </td>

      {/* Column 5: Heterozygous Count */}
      <td
        className={
          isGlobalSexRow
            ? "beaconized global-row-background centered"
            : `centered-header ${backgroundColor}`
        }
      >
        {display(heterozygous)}
      </td>

      {/* Column 6: Hemizygous Count */}
      <td
        className={
          isGlobalSexRow
            ? "beaconized global-row-background centered"
            : `centered-header ${backgroundColor}`
        }
      >
        {display(hemizygous)}
      </td>

      {/* Column 7: Allele Frequency
        - Use normal decimal for values >= 1e-5
        - Use scientific notation for values > 0 and < 1e-5
        - Zero stays 0
        - If missing, show "-"
      */}
      <td
        className={
          isGlobalSexRow
            ? "beaconized global-row-background centered"
            : `centered-header ${backgroundColor}`
        }
      >
        {alleleFrequencyRaw === null
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
