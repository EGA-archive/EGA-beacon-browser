import React from "react";
import TooltipHeader from "../styling/TooltipHeader.js";
import { TOOLTIP_TEXTS } from "../constants.js";

// This component defines the layout for the population frequency table
export default function TableLayout({ children, disclaimer, tableRef }) {
  return (
    <div className="table-container" ref={tableRef}>
      <table className="data-table">
        <thead>
          <tr>
            {/* Each <th> is wrapped in TooltipHeader to show a description on hover */}
            <TooltipHeader title={TOOLTIP_TEXTS.population}>
              <th className="underlined population-column">Population</th>
            </TooltipHeader>

            <TooltipHeader title={TOOLTIP_TEXTS.alleleCount}>
              <th className="centered-header underlined">
                Alternate Allele Count
              </th>
            </TooltipHeader>

            <TooltipHeader title={TOOLTIP_TEXTS.alleleNumber}>
              <th className="centered-header underlined">Allele Number</th>
            </TooltipHeader>

            <TooltipHeader title={TOOLTIP_TEXTS.homozygous}>
              <th className="centered-header underlined">Homozygous Count</th>
            </TooltipHeader>

            <TooltipHeader title={TOOLTIP_TEXTS.heterozygous}>
              <th className="centered-header underlined">Heterozygous Count</th>
            </TooltipHeader>

            <TooltipHeader title={TOOLTIP_TEXTS.hemizygous}>
              <th className="centered-header underlined">Hemizygous Count</th>
            </TooltipHeader>

            <TooltipHeader title={TOOLTIP_TEXTS.frequency}>
              <th className="centered-header underlined">Allele Frequency</th>
            </TooltipHeader>
          </tr>
        </thead>

        {/* Render the table rows that are passed as children */}
        <tbody>{children}</tbody>
      </table>

      {/* Optional disclaimer */}
      {disclaimer && <div className="disclaimer">{disclaimer}</div>}
    </div>
  );
}
