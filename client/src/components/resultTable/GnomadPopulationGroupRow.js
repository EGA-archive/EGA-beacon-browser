import React, { useState, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SharedTableRow from "./SharedTableRow";
import { normalizeGenotypeCounts } from "./normalizeGenotypeCounts";
import { GNOMAD_GROUPS, POPULATION_NORMALIZATION } from "../constants.js";

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

export default function GnomadPopulationGroupRows({
  frequencies,
  globalAction,
  clearGlobalAction,
}) {
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    if (!globalAction) return;

    if (globalAction === "openAll") {
      const allOpen = Object.keys(GNOMAD_GROUPS).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setOpenGroups(allOpen);
    }

    if (globalAction === "closeAll") {
      setOpenGroups({});
    }

    clearGlobalAction();
  }, [globalAction]);

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

  const mainGroupsWithData = Object.keys(GNOMAD_GROUPS).filter(
    (groupName) => !!frequencyByPopulation[groupName]
  );

  const hasSingleMainPopulation = mainGroupsWithData.length === 1;

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

          const realSubPopulationRows = subPopulations
            .slice()
            .sort((a, b) => a.localeCompare(b))
            .map((n) => frequencyByPopulation[n])
            .filter(Boolean);

          const shouldHideAncestrySexRows = hasSingleMainPopulation;

          const subRows = [
            ...(shouldHideAncestrySexRows ? [] : sexRows),
            ...realSubPopulationRows,
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
