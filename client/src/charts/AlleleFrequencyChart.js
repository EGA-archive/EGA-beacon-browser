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
  createBarWithDots,
  CHART_COLORS,
  LEGEND_ITEMS,
  formatAF,
} from "../components/constants";

const CustomLegend = () => (
  <div style={{ marginLeft: 20 }}>
    {LEGEND_ITEMS.map(({ label, key }) => {
      const color = CHART_COLORS[key];

      return (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
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

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#000",
          marginLeft: 5,
        }}
      />
      <span style={{ fontSize: 14, color: "#000" }}>Datasets</span>
    </div>
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

export default function AlleleFrequencyChart({ data }) {
  //   console.log("CHART DATA:", data);

  const allValues = data.flatMap((d) => [
    d.female,
    d.male,
    d.total,
    ...(d.ancestryDots || []).flatMap((dot) => [
      dot.female,
      dot.male,
      dot.total,
    ]),
  ]);

  const minValue = Math.min(...allValues.filter((v) => v != null && v > 0));

  const maxValue = Math.max(...allValues.filter((v) => v != null));

  const ticks = [0, minValue, (minValue + maxValue) / 2, maxValue].filter(
    (v, i, arr) => v != null && !isNaN(v) && arr.indexOf(v) === i
  );

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
              tick={{ fontSize: 12, fill: "#000", fontWeight: 700 }}
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
              //       Need to check this
              //   domain={[0, 1]}
              //   ticks={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 1]}
              //   tickFormatter={(value) => {
              //     if (value === 0) return "0";
              //     if (value < 0.01) return value.toExponential(1);
              //     return value.toFixed(2);
              //   }}
              domain={[() => minValue * 0.9, () => maxValue * 1.1]}
              //   domain={[0, () => maxValue * 1.1]}
              //   tickFormatter={(value) => {
              //     if (value < 0.001) return value.toExponential(1);
              //     return value.toFixed(3);
              //   }}
              //   ticks={ticks}
              tickFormatter={(value) => {
                if (value === 0) return "0";

                const formatted = formatAF(value);

                if (formatted === "0.0e+0" || formatted === "0e+0") return "0";

                return formatted;
              }}
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
                shape={createBarWithDots({
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
            top: 20,
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
