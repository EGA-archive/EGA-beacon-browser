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

import { createBarWithDots } from "../components/constants";

const CustomLegend = () => {
  const Item = ({ label, color }) => (
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

  return (
    <div style={{ marginLeft: 20 }}>
      <Item label="Female" color="#0A1B95" />
      <Item label="Male" color="#277F8E" />
      <Item label="Total" color="#C96324" />
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const female = payload.find((p) => p.dataKey === "female");
  const male = payload.find((p) => p.dataKey === "male");
  const total = payload.find((p) => p.dataKey === "total");

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
        Ancestries: <b>blank</b>
      </div>
      <div
        style={{
          borderTop: "1px solid #e0e0e0",
          margin: "10px 0",
        }}
      />
      <div style={{ marginBottom: 4 }}>Allele Frequencies:</div>
      {total && <Row label="Total" value={total.value} color="#C96324" />}
      {female && <Row label="Female" value={female.value} color="#0A1B95" />}
      {male && <Row label="Male" value={male.value} color="#277F8E" />}
    </div>
  );
};

export default function AlleleFrequencyChart({ data }) {
  console.log("CHART DATA:", data);

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
              domain={[0, 1]}
              // Need to check this
              ticks={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 1]}
              tickFormatter={(value) => {
                if (value === 0) return "0";
                if (value < 0.01) return value.toExponential(1);
                return value.toFixed(2);
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
            />

            <Bar
              dataKey="female"
              name="Female"
              fill="#0A1B9533"
              stroke="#0A1B95"
              strokeWidth={3}
              barSize={30}
              shape={createBarWithDots({ dataKey: "female", color: "#0A1B95" })}
            />

            <Bar
              dataKey="male"
              name="Male"
              fill="#277F8E33"
              stroke="#277F8E"
              strokeWidth={3}
              barSize={30}
              shape={createBarWithDots({ dataKey: "male", color: "#277F8E" })}
            />

            <Bar
              dataKey="total"
              name="Total"
              fill="#C9632433"
              stroke="#C96324"
              strokeWidth={3}
              barSize={30}
              shape={createBarWithDots({ dataKey: "total", color: "#C96324" })}
            />
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
