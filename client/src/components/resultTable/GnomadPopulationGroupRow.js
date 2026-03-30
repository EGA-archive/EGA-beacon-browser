import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SharedTableRow from "./SharedTableRow";
import { normalizeGenotypeCounts } from "./normalizeGenotypeCounts";

const POPULATION_NORMALIZATION = {
  Other: "Remaining Individuals",
  "Remaining individuals": "Remaining Individuals",
  "Reaming individuals": "Remaining Individuals",
  Remaining: "Remaining Individuals",

  Bulgarian: "Bulgarian",
  "Bulgarian (Eastern European)": "Bulgarian",

  "African-American/African": "African-American/African",
  "African/African-American": "African-American/African",
  "African/African american": "African-American/African",
  African: "African-American/African",
  "African/African American": "African-American/African",

  "Other Non-Finnish European": "Other Non-Finnish European",
  "Other non-Finnish European": "Other Non-Finnish European",

  "North-Western European": "North-Western European",
  "North-western European": "North-Western European",

  "Non-Finnish European": "European (non-Finnish)",
  "European (non-Finnish)": "European (non-Finnish)",
};

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

const GNOMAD_GROUPS = {
  European: [],
  "Admixed American": [],
  "African-American/African": [],
  Amish: [],
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
  "Remaining Individuals": [],
  Finnish: [],
  "Middle Eastern": [],
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
      acc[name].alleleCount += f.alleleCount || 0;
      acc[name].alleleNumber += f.alleleNumber || 0;
      acc[name].alleleCountHomozygous += homozygous;
      acc[name].alleleCountHeterozygous += heterozygous;
      acc[name].alleleCountHemizygous += hemizygous;
    }

    return acc;
  }, {});

  const knownPopulations = new Set(
    Object.keys(GNOMAD_GROUPS).flatMap((g) => [g, ...GNOMAD_GROUPS[g]])
  );

  const isSexOnly = (p) => p === "XX" || p === "XY";

  const isSexChild = (p) =>
    Object.keys(GNOMAD_GROUPS).some((g) => p.startsWith(g + " "));

  const unknownPopulations = Object.values(frequencyByPopulation).filter(
    (f) =>
      !isSexOnly(f.population) &&
      !knownPopulations.has(f.population) &&
      !isSexChild(f.population)
  );

  const sexOnlyRows = ["XX", "XY"]
    .map((sex) => frequencyByPopulation[sex])
    .filter(Boolean);

  return (
    <>
      {Object.entries(GNOMAD_GROUPS)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, subPopulations]) => {
          const main = frequencyByPopulation[groupName];
          if (!main) return null;

          const sexRows = ["XX", "XY"]
            .map((sex) => frequencyByPopulation[`${groupName} ${sex}`])
            .filter(Boolean);

          const subRows = [
            ...sexRows,
            ...subPopulations
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((n) => frequencyByPopulation[n])
              .filter(Boolean),
          ];

          const isOpen = openGroups[groupName];
          const isExpandable = subRows.length > 0;

          return (
            <React.Fragment key={groupName}>
              <SharedTableRow
                id={groupName}
                category="ancestry_main"
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
                          width: 40,
                          marginLeft: -40,
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
                {...main}
                nonBackgroundColor
              />

              {isOpen &&
                subRows.map((sub) => (
                  <SharedTableRow
                    key={sub.population}
                    type={sub.population}
                    {...sub}
                    isSubRow
                  />
                ))}
            </React.Fragment>
          );
        })}

      {/* Global sex */}
      {sexOnlyRows.map((row) => (
        <SharedTableRow
          key={row.population}
          id={row.population}
          category="global_sex"
          type={row.population}
          {...row}
          nonBackgroundColor
        />
      ))}

      {/* Unknown */}
      {unknownPopulations.map((pop) => (
        <SharedTableRow
          key={pop.population}
          id={pop.population}
          category="ancestry_unknown"
          type={pop.population}
          {...pop}
          nonBackgroundColor
        />
      ))}
    </>
  );
}
