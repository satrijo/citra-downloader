import fs from "fs";

const checkFolder = (folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    return folder;
}

export default checkFolder;