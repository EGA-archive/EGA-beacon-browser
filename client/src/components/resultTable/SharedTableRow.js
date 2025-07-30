import React from "react";

// This component represents a single <tr> row inside a table.
// It displays allele information for a given population type.
const SharedTableRow = ({
  type,
  alleleCount,
  alleleNumber,
  alleleCountHomozygous,
  alleleCountHeterozygous,
  alleleFrequency,
  nonBackgroundColor,
}) => {
  // If nonBackgroundColor is true, don't add the background class.
  // Otherwise, apply a default "sex-background" class.
  const backgroundColor = nonBackgroundColor ? "" : "sex-background";

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
        {alleleCountHomozygous || alleleCount - alleleCountHeterozygous}
      </td>
      {/* Column 5: Heterozygous Count - If not provided, it tries to calculate it as: alleleCount - homozygous */}
      <td className={`centered-header ${backgroundColor}`}>
        {alleleCountHeterozygous || alleleCount - alleleCountHomozygous}
      </td>
      {/* Column 6: Allele Frequency
          - If already given, format as exponential 
          - If not given but count & number are available, calculate it: count / number
          - Otherwise, show a dash "-" */}
      <td className={`centered-header ${backgroundColor}`}>
        {alleleFrequency
          ? parseFloat(alleleFrequency).toExponential(4)
          : alleleCount && alleleNumber
          ? (alleleCount / alleleNumber).toExponential(4)
          : "-"}
      </td>
    </tr>
  );
};

export default SharedTableRow;
