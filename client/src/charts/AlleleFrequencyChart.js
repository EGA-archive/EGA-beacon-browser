import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";

import {
  createBarWithRoundTop,
  CHART_COLORS,
  LEGEND_ITEMS,
  formatAF,
} from "../components/constants";

const CustomLegend = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 20,
      flexWrap: "wrap",
      marginLeft: 20,
    }}
  >
    {LEGEND_ITEMS.map(({ label, key }) => {
      const color = CHART_COLORS[key];

      return (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              border: `3px solid ${color}`,
              backgroundColor: `${color}33`,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          />
          <span style={{ fontSize: 14, color: "#000" }}>{label}</span>
        </div>
      );
    })}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const values = Object.fromEntries(payload.map((p) => [p.dataKey, p]));

  const female = values.female;
  const male = values.male;
  const total = values.total;

  const ancestryDots =
    payload && payload[0] && payload[0].payload
      ? payload[0].payload.ancestryDots || []
      : [];

  const Row = ({ label, value, color }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            border: `2px solid ${color}`,
            backgroundColor: `${color}33`,
          }}
        />
        <span style={{ color: "#000" }}>{label}</span>
      </div>
      <span
        style={{
          fontWeight: 700,
          minWidth: 80,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: 12,
        lineHeight: "18px",
        maxWidth: "220px",
      }}
    >
      <div style={{ marginBottom: 6 }}>
        Dataset: <b>{label}</b>
        <br />
        Ancestries: <b>{ancestryDots.length || "-"}</b>
      </div>
      <div
        style={{
          borderTop: "1px solid #e0e0e0",
          margin: "10px 0",
        }}
      />
      <div style={{ marginBottom: 4 }}>Allele Frequencies:</div>
      {total && (
        <Row
          label="Total"
          value={formatAF(total.value)}
          color={CHART_COLORS.total}
        />
      )}
      {female && (
        <Row
          label="Female"
          value={formatAF(female.value)}
          color={CHART_COLORS.female}
        />
      )}
      {male && (
        <Row
          label="Male"
          value={formatAF(male.value)}
          color={CHART_COLORS.male}
        />
      )}
    </div>
  );
};

const formatDatasetLabel = (label = "") => {
  const cleaned = label.replace(/\(EGAD.*?\)/g, "").trim();

  const MAX_LINE_LENGTH = 18;
  const MAX_TOTAL_LENGTH = 36;

  if (cleaned.length <= MAX_LINE_LENGTH) {
    return [cleaned];
  }

  if (cleaned.length <= MAX_TOTAL_LENGTH) {
    const firstLine = cleaned.slice(0, MAX_LINE_LENGTH);
    const secondLine = cleaned.slice(MAX_LINE_LENGTH);

    return [firstLine.trim(), secondLine.trim()];
  }

  const truncated = cleaned.slice(0, MAX_TOTAL_LENGTH - 3) + "...";

  return [
    truncated.slice(0, MAX_LINE_LENGTH).trim(),
    truncated.slice(MAX_LINE_LENGTH).trim(),
  ];
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const lines = formatDatasetLabel(payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 14}
          dy={16}
          textAnchor="middle"
          fill="#000"
          fontSize={12}
          fontWeight={700}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

// const getYAxisMax = (maxValue) => {
//   if (maxValue == null || Number.isNaN(maxValue)) return 1;

//   // round up to the next tenth
//   const roundedUp = Math.ceil(maxValue * 10) / 10;

//   // never go above 1
//   return Math.min(roundedUp, 1);
// };

// const getYAxisTicks = (maxY) => {
//   // nice fixed steps based on the final max
//   if (maxY <= 0.2) {
//     return [0, 0.05, 0.1, 0.15, 0.2].filter((v) => v <= maxY);
//   }

//   if (maxY <= 0.5) {
//     return [0, 0.1, 0.2, 0.3, 0.4, 0.5].filter((v) => v <= maxY);
//   }

//   return Array.from({ length: Math.round(maxY / 0.1) + 1 }, (_, i) =>
//     Number((i * 0.1).toFixed(2))
//   );
// };

// const formatYAxisTick = (value) => {
//   if (value === 0) return "0";

//   return formatAF(value, {
//     threshold: 1e-5,
//     decimalDigits: 2,
//     exponentDigits: 2,
//   });
// };

// export default function AlleleFrequencyChart({ data }) {
//   const allValues = data.flatMap((d) => [
//     d.female,
//     d.male,
//     d.total,
//     ...(d.ancestryDots || []).flatMap((dot) => [
//       dot.female,
//       dot.male,
//       dot.total,
//     ]),
//   ]);

//   const validValues = allValues.filter((v) => v != null && !Number.isNaN(v));

//   const maxValue = validValues.length ? Math.max(...validValues) : 1;

//   const yAxisMax = getYAxisMax(maxValue);
//   const yAxisTicks = getYAxisTicks(yAxisMax);

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//       }}
//     >
//       <div
//         style={{
//           width: "100%",
//           height: 350,
//           marginBottom: "40px",
//           position: "relative",
//         }}
//       >
//         <ResponsiveContainer>
//           <BarChart
//             data={data}
//             barGap={8}
//             margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
//           >
//             <CartesianGrid strokeDasharray="1 1" vertical={false} />
//             <XAxis
//               dataKey="dataset"
//               tick={<CustomXAxisTick />}
//               axisLine={{ stroke: "#000" }}
//               tickLine={{ stroke: "#000" }}
//             >
//               <Label
//                 value="Datasets Distribution by sex"
//                 position="bottom"
//                 offset={15}
//                 style={{ fontSize: 14, fill: "#000", fontWeight: 700 }}
//               />
//             </XAxis>
//             <YAxis
//               domain={[0, yAxisMax]}
//               ticks={yAxisTicks}
//               tickFormatter={formatYAxisTick}
//               tick={{ fontSize: 12, fill: "#000" }}
//               axisLine={{ stroke: "#000" }}
//               tickLine={{ stroke: "#000" }}
//               width={60}
//             >
//               <Label
//                 value="Allele Frequency"
//                 angle={-90}
//                 position="insideLeft"
//                 offset={-10}
//                 style={{ textAnchor: "middle", fill: "#000" }}
//               />
//             </YAxis>

//             <Tooltip
//               content={<CustomTooltip />}
//               cursor={{ fill: "rgba(0,0,0,0.05)" }}
//               wrapperStyle={{ zIndex: "999" }}
//             />

//             {["female", "male", "total"].map((key) => (
//               <Bar
//                 key={key}
//                 dataKey={key}
//                 name={key.charAt(0).toUpperCase() + key.slice(1)}
//                 fill={`${CHART_COLORS[key]}33`}
//                 stroke={CHART_COLORS[key]}
//                 strokeWidth={3}
//                 barSize={30}
//                 shape={createBarWithRoundTop({
//                   dataKey: key,
//                   color: CHART_COLORS[key],
//                 })}
//               />
//             ))}
//           </BarChart>
//         </ResponsiveContainer>

//         <div
//           style={{
//             position: "absolute",
//             top: -20,
//             right: 20,
//             padding: "12px 16px",
//             borderRadius: 10,
//           }}
//         >
//           <CustomLegend />
//         </div>
//       </div>
//     </div>
//   );
// }

const getYAxisConfig = (maxValue) => {
  if (!maxValue || Number.isNaN(maxValue)) {
    return {
      max: 1,
      ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
    };
  }
  if (maxValue >= 0.01) {
    const roundedMax = Math.min(Math.ceil(maxValue * 10) / 10, 1);

    const ticks = Array.from(
      { length: Math.round(roundedMax / 0.1) + 1 },
      (_, i) => Number((i * 0.1).toFixed(2))
    );

    return { max: roundedMax, ticks };
  }

  const exponent = Math.floor(Math.log10(maxValue));
  const base = Math.pow(10, exponent);

  const normalized = maxValue / base;

  let niceNormalized;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;

  const niceMax = niceNormalized * base;

  const step = niceMax / 5;

  const ticks = Array.from({ length: 6 }, (_, i) => i * step);

  return {
    max: niceMax,
    ticks,
  };
};

const formatYAxisTick = (value) => {
  if (value === 0) return "0";
  return formatAF(value);
};

export default function AlleleFrequencyChart({ data }) {
  const allValues = data.flatMap((d) => [d.female, d.male, d.total]);

  const validValues = allValues.filter((v) => v != null && !Number.isNaN(v));

  const rawMax = validValues.length ? Math.max(...validValues) : 1;
  const maxValue = rawMax * 1.1;

  const { max: yAxisMax, ticks: yAxisTicks } = getYAxisConfig(maxValue);

  console.log("ALL VALUES:", validValues);
  console.log("rawMax", rawMax);
  console.log("MAX VALUE USED:", maxValue);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 350,
          marginBottom: "40px",
          position: "relative",
        }}
      >
        <ResponsiveContainer>
          <BarChart
            data={data}
            barGap={8}
            margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="1 1" vertical={false} />

            <XAxis
              dataKey="dataset"
              tick={<CustomXAxisTick />}
              axisLine={{ stroke: "#000" }}
              tickLine={{ stroke: "#000" }}
            >
              <Label
                value="Datasets Distribution by sex"
                position="bottom"
                offset={15}
                style={{ fontSize: 14, fill: "#000", fontWeight: 700 }}
              />
            </XAxis>

            <YAxis
              domain={[0, yAxisMax]}
              ticks={yAxisTicks}
              tickFormatter={formatYAxisTick}
              tick={{ fontSize: 12, fill: "#000" }}
              axisLine={{ stroke: "#000" }}
              tickLine={{ stroke: "#000" }}
              width={60}
            >
              <Label
                value="Allele Frequency"
                angle={-90}
                position="insideLeft"
                offset={-10}
                style={{ textAnchor: "middle", fill: "#000" }}
              />
            </YAxis>

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              wrapperStyle={{ zIndex: "999" }}
            />

            {["female", "male", "total"].map((key) => (
              <Bar
                key={key}
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                fill={`${CHART_COLORS[key]}33`}
                stroke={CHART_COLORS[key]}
                strokeWidth={3}
                barSize={30}
                shape={createBarWithRoundTop({
                  dataKey: key,
                  color: CHART_COLORS[key],
                })}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <div
          style={{
            position: "absolute",
            top: -20,
            right: 20,
            padding: "12px 16px",
            borderRadius: 10,
          }}
        >
          <CustomLegend />
        </div>
      </div>
    </div>
  );
}
