import TooltipHeader from "../styling/TooltipHeader.js";
import { TOOLTIP_TEXTS } from "../constants.js";

// This component defines the layout for the population frequency table
export default function TableLayout({ children, disclaimer }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {/* Each <th> is wrapped in TooltipHeader to show a description on hover */}
            <TooltipHeader title={TOOLTIP_TEXTS.population}>
              <th className="underlined population-column">Population</th>
            </TooltipHeader>
            <TooltipHeader title={TOOLTIP_TEXTS.alleleCount}>
              <th className="centered-header underlined">Allele Count</th>
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
            <TooltipHeader title={TOOLTIP_TEXTS.frequency}>
              <th className="centered-header underlined">Allele Frequency</th>
            </TooltipHeader>
          </tr>
        </thead>
        {/* Render the table rows that are passed as children to this component */}
        <tbody>{children}</tbody>
      </table>
      {/* If a disclaimer is provided, show it below the table */}
      {disclaimer && <div className="disclaimer">{disclaimer}</div>}
    </div>
  );
}
