import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";

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
        }}
      >
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 80, left: 20, bottom: 40 }}
          >
            <CartesianGrid stroke="#000" strokeDasharray="0 1" />
            <XAxis
              dataKey="dataset"
              tick={{ fontSize: 12, fill: "#000" }}
              axisLine={{ stroke: "#000" }}
              tickLine={{ stroke: "#000" }}
            >
              <Label
                value="Datasets Distribution by sex"
                position="bottom"
                offset={15}
                style={{ fontSize: 14, fill: "#000" }}
              />
            </XAxis>
            <YAxis
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

            <Tooltip />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="square"
              wrapperStyle={{
                fontSize: 14,
                color: "#000",
                lineHeight: "20px",
              }}
            />

            {/* <Legend align="bottom" verticalAlign="bottom" iconType="square" /> */}

            <Bar dataKey="female" fill="#489FC8" name="Female" />
            <Bar dataKey="male" fill="#CE5910" name="Male" />
            <Bar dataKey="total" fill="#05245E" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
