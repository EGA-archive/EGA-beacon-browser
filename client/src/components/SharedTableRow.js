import React from "react";

const SharedTableRow = ({
  type,
  alleleCount,
  alleleNumber,
  alleleCountHomozygous,
  alleleCountHeterozygous,
  alleleFrequency,
  nonBackgroundColor,
}) => {
  const backgroundColor = nonBackgroundColor ? "" : "sex-background";

  return (
    <tr>
      <td className={`type-wrap ${backgroundColor}`}>{type}</td>
      <td className={`centered-header ${backgroundColor}`}>{alleleCount}</td>
      <td className={`centered-header ${backgroundColor}`}>{alleleNumber}</td>
      <td className={`centered-header ${backgroundColor}`}>
        {alleleCountHomozygous || alleleCount - alleleCountHeterozygous}
      </td>
      <td className={`centered-header ${backgroundColor}`}>
        {alleleCountHeterozygous || alleleCount - alleleCountHomozygous}
      </td>
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
