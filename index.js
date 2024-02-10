import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import csvParser from "csv-parser";
import * as statistics from "simple-statistics";
import lo from "lodash";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import path from 'path';

const app = express();
const port =  3001;
app.use(cors({
        origin: 'https://task-vg2v.vercel.app/',
      credentials: true, //access-control-allow-credentials:true
      optionSuccessStatus: 200,
    }));
dotenv.config();
app.use(express.json());
const _dirname = path.resolve();
app.use(express.static(path.join(_dirname,'/client/my-project/dist')));
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("csvFile"), (req, res) => {
  try {
    if (!req.file) {
      res.json({ success: false });
    }
    console.log(req.file);

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data) => {

        // Perform data wrangling (cleaning, transformation)

        results.push({ ...data, Age: parseInt(data.Age) });
      })
      .on("end", () => {

        // Perform EDA

        const ages = results.map((entry) => entry.Age);
        const meanAge = statistics.mean(ages);
        const medianAge = statistics.median(ages);
        const maxAge = statistics.max(ages);
        const minAge = statistics.min(ages);
        const ageRange = maxAge - minAge;

        console.log("Mean Age:", meanAge);
        console.log("Median Age:", medianAge);
        console.log("Age Range:", ageRange);
        console.log(results);
const Stats = {meanAge, medianAge,ageRange}
        // Perform analytics

        const ageGroups = lo.groupBy(ages, (age) => {
          if (age < 18) {
            return "Under 18";
          } else if (age >= 18 && age < 30) {
            return "18-29";
          } else if (age >= 30 && age < 40) {
            return "30-39";
          } else {
            return "40+";
          }
        });

        console.log("ageGroups:", ageGroups);

        const ageGroupCounts = lo.mapValues(ageGroups, (group) => group.length);

        console.log("Age Group Counts:", ageGroupCounts);

        // Visualization

        const canvasRenderService = new ChartJSNodeCanvas({
          width: 800,
          height: 600,
        });
        (async () => {
          const configuration = {
            type: "bar",
            data: {
              labels: Object.keys(ageGroupCounts),
              datasets: [
                {
                  label: "Age Distribution",
                  data: Object.values(ageGroupCounts),
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                  ],
                  borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          };

          const image = await canvasRenderService.renderToBuffer(configuration);
          const base64ImageData = Buffer.from(image).toString("base64");
          res.json({ success: true, image: base64ImageData , Stats:Stats });

        })();
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});