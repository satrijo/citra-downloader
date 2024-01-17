import axios from "axios"
import fs from "fs"

const getImage = (type, url, folder = null) => {
  axios
    .get(`${url}`, {
      responseType: "arraybuffer",
    })
    .then((res) => {
      const imgBuffer = Buffer.from(res.data, "binary");
      if (folder) {
        fs.writeFile(
          `${folder}/${type}`,
          imgBuffer,
          (err) => {
            if (err) {
              console.error(err);
            }
          }
        );
      } 
    })
    .catch((error) => {
      console.error(error);
    });
};

export default getImage;