import TooltipHeader from "./TooltipHeader";
import { TOOLTIP_TEXTS } from "../components/constants.js";

export default function TableLayout({ header, children, disclaimer }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
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
        <tbody>{children}</tbody>
      </table>
      {disclaimer && <div className="disclaimer">{disclaimer}</div>}
    </div>
  );
}
