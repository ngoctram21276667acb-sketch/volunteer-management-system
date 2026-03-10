const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const readFile = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error parsing JSON file: ${filename}`, err);
    return [];
  }
};

const writeFile = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);

  if (typeof data !== "object") {
    throw new Error("writeFile expects object or array");
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};


const genId = () => Date.now().toString();

module.exports = {
  readFile,
  writeFile,
  genId
};
