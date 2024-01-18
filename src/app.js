import cron from "node-cron";
import express from "express";
import axios from "axios";
import fs from "fs";
import checkFolder from "./checkFolder.js";
import getImage from "./getImage.js";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  const date = new Date();
  res.send(`Status Ok! ${date.toLocaleString()} WAHL`);
});

const getDynamicTimeComponents = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  return { date, year, month, day, hour };
};

const createBackupPath = () => {
  const {date, year, month, day } = getDynamicTimeComponents();
  const paths = ["./backup", `./backup/${year}`, `./backup/${year}/${month}`, `./backup/${year}/${month}/RAOB`, `./backup/${year}/${month}/HIMA`, `./backup/${year}/${month}/HIMA/INA`, `./backup/${year}/${month}/HIMA/JATENG`];
  paths.forEach((path) => checkFolder(path));
};

const saveRaobFile = (utc) => {
  const { year, month, day } = getDynamicTimeComponents();
  
  axios.get('http://172.19.2.99/monitoring_rason/status_rason/WAHL')
    .then(function (response) {
      const img = response.data.gambar.split(';base64,').pop();
      const buffer = Buffer.from(img, 'base64');
      createBackupPath();
      const {year, month, day } = getDynamicTimeComponents();
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
  cron.schedule("30 2 * * *", () => saveRaobFile(0)); // 00 UTC
  cron.schedule("30 14 * * *", () => saveRaobFile(12)); // 12 UTC
  cron.schedule("*/10 * * * *", () => {
    let randomText = Math.random().toString(36).substring(7);
    const {date, year, month, day } = getDynamicTimeComponents();
    let minute = date.getMinutes();
    let hour = date.getHours();
    createBackupPath();
    const getHimaIna = getImage(
      `HIMA_INA_${year}_${month}_${day}_${hour}_${minute}.png`,
      `https://inderaja.bmkg.go.id/IMAGE/HIMA/H08_EH_Indonesia.png?time=${randomText}`, `./backup/${year}/${month}/HIMA/INA/`
    );
    const getHimaJateng = getImage(
      `HIMA_Jateng_${year}_${month}_${day}_${hour}_${minute}.png`,
      `https://inderaja.bmkg.go.id/IMAGE/HIMA/H08_EH_Jateng.png?time=${randomText}`, `./backup/${year}/${month}/HIMA/JATENG/`
    );
  })
};

const initializeServer = () => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

const initializeApp = () => {
  const { date } = getDynamicTimeComponents();
  console.log(`Status Ok! ${date}`);

  scheduleRaobJobs();
  createBackupPath();
  initializeServer();
};

initializeApp();
