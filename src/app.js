import cron from "node-cron";
import express from "express";
import axios from "axios";
import fs from "fs";
import checkFolder from "./checkFolder.js";

const app = express();

app.get("/", (req, res) => {
  let date = new Date();
  res.send("Status Ok! " + date.toLocaleString() + " WAHL");
});

let date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
let day = date.getDate();
let hour = date.getHours();
console.log("Status Ok! " + date.toLocaleString());

const autocheck = () => {
  checkFolder("./backup");
  checkFolder("./backup/" + year);
  checkFolder("./backup/" + year + "/" + month);
  checkFolder("./backup/" + year + "/" + month + "/RAOB");
}

cron.schedule("44 9 * * *", () => {
  let img;
  axios
    .get('http://172.19.2.99/monitoring_rason/status_rason/WAHL')
    .then(function (response) {
      img = response.data.gambar.split(';base64,').pop();
      const buffer = Buffer.from(img, 'base64');
      autocheck();
      fs.writeFileSync(`./backup/${year}/${month}/RAOB/${day}_${month}_${year}_raob_00UTC.png`, buffer);
    })
    .catch(function (error) {
      console.log(error);
    });

    console.log("Status Ok! Save RAOB FILE 00 UTC => " + date.toLocaleString());
});

autocheck();

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
