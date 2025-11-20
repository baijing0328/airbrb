import { Column } from "@ant-design/charts";
import { theme } from "../utils/utils";
import dayjs from "dayjs";

const ProfitChart = ({ data }) => {
  const config = {
    data,
    xField: "date",
    yField: "profit",
    height: 300,
    meta: {
      // Meta is still useful for tooltip aliases
      date: {
        alias: "Date",
      },
      profit: {
        alias: "Profit ($)",
        formatter: (val) => `$${val.toFixed(2)}`,
      },
    },
    axis: {
      x: {
        labelFormatter: (datum) => dayjs(datum).format("MM-DD"),
      },
    },
    tooltip: {
      title: (titleValue) => {
        return titleValue.date;
      },
      formatter: (datum) => {
        return { name: "Profit", value: `$${datum.profit.toFixed(2)}` };
      },
    },
    style: {
      fill: theme.tiffanyBlue,
    },
    interactions: [{ type: "element-active" }], // Enable active state on hover
    state: {
      active: {
        style: {
          fill: theme.tiffanyBlue, // Change color on hover
        },
      },
    },
  };

  return <Column {...config} />;
};

export default ProfitChart;
