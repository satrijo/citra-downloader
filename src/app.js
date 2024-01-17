import cron from "node-cron";
import express from "express";
import axios from "axios";
import fs from "fs";
import checkFolder from "./checkFolder.js";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  const date = new Date();
  res.send(`Status Ok! ${date.toLocaleString()} WAHL`);
});

const createBackupPath = () => {
  const paths = ["./backup", `./backup/${year}`, `./backup/${year}/${month}`, `./backup/${year}/${month}/RAOB`];
  paths.forEach((path) => checkFolder(path));
};

const saveRaobFile = (utc) => {
  axios.get('http://172.19.2.99/monitoring_rason/status_rason/WAHL')
    .then(function (response) {
      const img = response.data.gambar.split(';base64,').pop();
      const buffer = Buffer.from(img, 'base64');
      createBackupPath();
      const fileSuffix = utc === 0 ? "00" : "12";
      const fileName = `./backup/${year}/${month}/RAOB/${day}_${month}_${year}_raob_${fileSuffix}UTC.png`;
      fs.writeFileSync(fileName, buffer);
      console.log(`Status Ok! Save RAOB FILE ${fileSuffix} UTC => ${fileName}`);
    })
    .catch(function (error) {
      console.log(error);
    });
};

const scheduleRaobJobs = () => {
  cron.schedule("45 9 * * *", () => saveRaobFile(0)); // 00 UTC
  cron.schedule("45 21 * * *", () => saveRaobFile(12)); // 12 UTC
};

const initializeServer = () => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

const initializeApp = () => {
  const date = new Date();
  global.year = date.getFullYear();
  global.month = date.getMonth() + 1;
  global.day = date.getDate();
  global.hour = date.getHours();
  console.log(`Status Ok! ${date.toLocaleString()}`);

  scheduleRaobJobs();
  createBackupPath();
  initializeServer();
};

initializeApp();
