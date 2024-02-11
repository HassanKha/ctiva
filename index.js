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
  origin: ['https://task-vg2v.vercel.app','http://localhost:5173','https://backend-8fks.onrender.com','http://localhost:3001'],
  credentials: true,
  optionSuccessStatus: 200,
}));
dotenv.config();
const __dirname = path.resolve();
app.use(express.json());
app.use(express.static(path.join(__dirname,'/client/dist')));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const results = [];
    const stream = fs.createReadStream(req.file.path)
      .pipe(csvParser());

    for await (const data of stream) {
      // Perform data wrangling (cleaning, transformation)
      results.push({ ...data, Age: parseInt(data.Age) });
    }

    fs.unlinkSync(req.file.path); // Remove the temporary file

    // Perform EDA
    const ages = results.map((entry) => entry.Age);
    const meanAge = statistics.mean(ages);
    const medianAge = statistics.median(ages);
    const maxAge = statistics.max(ages);
    const minAge = statistics.min(ages);
    const ageRange = maxAge - minAge;
    const Stats = { meanAge, medianAge, ageRange , ages };

    

     res.json({ success: true,
     //  image: base64ImageData ,
        Stats:Stats });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.post("/graph", async (req, res) => {
  try {
    if (!req.body.ages) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

  
    console.log(req.body.ages);
     const configuration = req.body.ages;
     console.log(configuration);
     const canvasRenderService = new ChartJSNodeCanvas({
      width: 800,
      height: 600,
    });
    const image = await canvasRenderService.renderToBuffer(configuration);
    const base64ImageData = Buffer.from(image).toString("base64");

     res.json({ success: true , image: base64ImageData});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
