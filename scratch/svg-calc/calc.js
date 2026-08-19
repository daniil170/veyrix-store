const { svgPathBbox } = require('svg-path-bbox');
const fs = require('fs');

const svg = fs.readFileSync('../../public/favicon.svg', 'utf8');
const match = svg.match(/d="([^"]+)"/);
if (match) {
  const bbox = svgPathBbox(match[1]);
  console.log(`Bounding Box: ${bbox}`);
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  console.log(`ViewBox should be: ${bbox[0]} ${bbox[1]} ${width} ${height}`);
}
