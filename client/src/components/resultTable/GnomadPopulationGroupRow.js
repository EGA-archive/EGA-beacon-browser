import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SharedTableRow from "./SharedTableRow";
import { normalizeGenotypeCounts } from "./normalizeGenotypeCounts";

/**
 * Renders grouped, collapsible population rows for gnomAD.
 * - Known populations are grouped and expandable
 * - Subpopulations are shown when expanded
 * - Aliases are normalized and merged
 * - Unknown populations are rendered flat and alphabetically
 */

const POPULATION_NORMALIZATION = {
  // Remaining / Other
  Other: "Remaining individuals",
  "Remaining individuals": "Remaining individuals",

  // Bulgarian
  Bulgarian: "Bulgarian",
  "Bulgarian (Eastern European)": "Bulgarian",

  // African
  "African-American/African": "African-American/African",
  "African/African-American": "African-American/African",
  African: "African-American/African",

  // Other non-Finnish European
  "Other Non-Finnish European": "Other Non-Finnish European",
  "Other non-Finnish European": "Other Non-Finnish European",

  // North-western variants
  "North-Western European": "North-Western European",
  "North-western European": "North-Western European",
};

const normalizePopulation = (name) => POPULATION_NORMALIZATION[name] || name;

const GNOMAD_GROUPS = {
  "Admixed American": [],
  "African-American/African": [],
  "Ashkenazi Jewish": [],
  "East Asian": ["Japanese", "Korean", "Other East Asian"],
  "European (Finnish)": [],
  "European (non-Finnish)": [
    "Bulgarian",
    "Estonian",
    "North-Western European",
    "Other Non-Finnish European",
    "Southern European",
    "Swedish",
  ],
  "South Asian": [],
  "Remaining individuals": [],
};

export default function GnomadPopulationGroupRows({ frequencies }) {
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const frequencyByPopulation = frequencies.reduce((acc, f) => {
    const normalizedName = normalizePopulation(f.population);
    const { homozygous, heterozygous, hemizygous } = normalizeGenotypeCounts(f);

    if (!acc[normalizedName]) {
      acc[normalizedName] = {
        ...f,
        population: normalizedName,
        alleleCountHomozygous: homozygous,
        alleleCountHeterozygous: heterozygous,
        alleleCountHemizygous: hemizygous,
      };
    } else {
      acc[normalizedName].alleleCount += f.alleleCount || 0;
      acc[normalizedName].alleleNumber += f.alleleNumber || 0;
      acc[normalizedName].alleleCountHomozygous += homozygous;
      acc[normalizedName].alleleCountHeterozygous += heterozygous;
      acc[normalizedName].alleleCountHemizygous += hemizygous;
    }

    return acc;
  }, {});

  const knownPopulations = new Set(
    Object.keys(GNOMAD_GROUPS).flatMap((group) => [
      group,
      ...GNOMAD_GROUPS[group],
    ])
  );

  const unknownPopulations = Object.values(frequencyByPopulation)
    .filter((f) => !knownPopulations.has(f.population))
    .sort((a, b) => a.population.localeCompare(b.population));

  return (
    <>
      {Object.entries(GNOMAD_GROUPS)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, subPopulations]) => {
          const mainRow = frequencyByPopulation[groupName];
          if (!mainRow) return null;

          const subRows = subPopulations
            .slice()
            .sort((a, b) => a.localeCompare(b))
            .map((name) => frequencyByPopulation[name])
            .filter(Boolean);

          const isExpandable = subRows.length > 0;
          const isOpen = openGroups[groupName];

          return (
            <React.Fragment key={groupName}>
              <SharedTableRow
                type={
                  isExpandable ? (
                    <span
                      onClick={() => toggleGroup(groupName)}
                      style={{
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          width: "40px",
                          marginLeft: "-40px",
                          display: "inline-flex",
                          justifyContent: "center",
                        }}
                      >
                        {isOpen ? (
                          <KeyboardArrowDownIcon fontSize="small" />
                        ) : (
                          <KeyboardArrowRightIcon fontSize="small" />
                        )}
                      </span>
                      {groupName}
                    </span>
                  ) : (
                    groupName
                  )
                }
                alleleCount={mainRow.alleleCount}
                alleleNumber={mainRow.alleleNumber}
                alleleCountHomozygous={mainRow.alleleCountHomozygous}
                alleleCountHeterozygous={mainRow.alleleCountHeterozygous}
                alleleCountHemizygous={mainRow.alleleCountHemizygous || "0"}
                alleleFrequency={mainRow.alleleFrequency}
                nonBackgroundColor={true}
              />

              {isOpen &&
                subRows.map((sub) => (
                  <SharedTableRow
                    key={sub.population}
                    type={sub.population}
                    alleleCount={sub.alleleCount}
                    alleleNumber={sub.alleleNumber}
                    alleleCountHomozygous={sub.alleleCountHomozygous}
                    alleleCountHeterozygous={sub.alleleCountHeterozygous}
                    alleleCountHemizygous={sub.alleleCountHemizygous || "0"}
                    alleleFrequency={sub.alleleFrequency}
                    nonBackgroundColor={false}
                    isSubRow={true}
                  />
                ))}
            </React.Fragment>
          );
        })}

      {unknownPopulations.map((pop) => (
        <SharedTableRow
          key={pop.population}
          type={pop.population}
          alleleCount={pop.alleleCount}
          alleleNumber={pop.alleleNumber}
          alleleCountHomozygous={pop.alleleCountHomozygous}
          alleleCountHeterozygous={pop.alleleCountHeterozygous}
          alleleCountHemizygous={pop.alleleCountHemizygous || "0"}
          alleleFrequency={pop.alleleFrequency}
          nonBackgroundColor={true}
        />
      ))}
    </>
  );
}
