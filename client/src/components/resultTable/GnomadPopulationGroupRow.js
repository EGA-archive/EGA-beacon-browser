import React, { useState, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SharedTableRow from "./SharedTableRow";
import { normalizeGenotypeCounts } from "./normalizeGenotypeCounts";
import {
  GNOMAD_GROUPS,
  POPULATION_NORMALIZATION,
  formatAF,
} from "../constants.js";

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
  onStateChange,
  toggle,
  total,
}) {
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    const allGroupKeys = Object.keys(GNOMAD_GROUPS);
    const states = allGroupKeys.map((key) => !!openGroups[key]);

    const allOpen = states.every(Boolean);
    const allClosed = states.every((v) => !v);

    onStateChange?.({ allOpen, allClosed });
  }, [openGroups]);

  useEffect(() => {
    if (!globalAction) {
      return;
    }

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
      acc[name].alleleCount += f.alleleCount || "-";
      acc[name].alleleNumber += f.alleleNumber || "-";
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

  const totalCounts = normalizeGenotypeCounts(total || {});

  return (
    <>
      {toggle.includes("ancestry") &&
        Object.entries(GNOMAD_GROUPS)
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

            const showSex = toggle.includes("sex");

            const subRows = [
              ...(showSex && !shouldHideAncestrySexRows ? sexRows : []),
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
                  subRows.map((sub) => {
                    const isSexRow = /\s(XX|XY)$/.test(sub.population);
                    return (
                      <SharedTableRow
                        key={sub.population}
                        type={sub.population}
                        {...sub}
                        isSubRow
                        isSexRow={isSexRow}
                      />
                    );
                  })}
              </React.Fragment>
            );
          })}

      {/* This renders the Total in bold */}
      {total &&
        (() => {
          const totalClass = "beaconized global-row-background";

          return (
            <tr data-id="total" data-category="total">
              <td className={`${totalClass} dataset-col`}>
                <b>Total</b>
              </td>

              <td className={`${totalClass} centered`}>
                <b>{total.alleleCount ?? "-"}</b>
              </td>

              <td className={`${totalClass} centered`}>
                <b>{total.alleleNumber ?? "-"}</b>
              </td>

              <td className={`${totalClass} centered`}>
                <b>{totalCounts.homozygous ?? "-"}</b>
              </td>

              <td className={`${totalClass} centered`}>
                <b>{totalCounts.heterozygous ?? "-"}</b>
              </td>

              <td className={`${totalClass} centered`}>
                <b>{totalCounts.hemizygous ?? "-"}</b>
              </td>

              <td className={`${totalClass} centered`}>
                <b>
                  {total.alleleFrequency != null
                    ? formatAF(total.alleleFrequency, {
                        threshold: 1e-5,
                        exponentDigits: 2,
                      })
                    : "-"}
                </b>
              </td>
            </tr>
          );
        })()}
      {/* Global sex */}
      {toggle.includes("sex") &&
        sexOnlyRows.map((row) => (
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
