import React, { useEffect } from "react";
import { getAllHaltedCrap } from "client/apis/haltsApi";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Stats = () => {
  useEffect(() => {
    getAllHaltedCrap().then(({ results }) => {
      const categorizedResults = {};

      results.forEach((res) => {
        const year = new Date(res.haltDate).getFullYear();
        const month = new Date(res.haltDate).getMonth();

        if (!categorizedResults[year]) {
          categorizedResults[year] = {};
        }

        if (!categorizedResults[year][month]) {
          categorizedResults[year][month] = {};
        }

        categorizedResults[year][month] = res;
      });

      console.log(categorizedResults);
    });
  }, []);
  return <div>Statistics page</div>;
};

export default Stats;
