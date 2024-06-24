import fs from 'fs/promises';
import { ReportGenerator } from 'lighthouse/report/generator/report-generator.js';


export const getReport = async (lhr, dir, name, type) => {
  const validTypes = ['csv', 'html', 'json'];
  name = name.substr(0, name.lastIndexOf('.')) || name;

  if (validTypes.includes(type)) {
    const reportBody = ReportGenerator.generateReport(lhr, type);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${name}.${type}`, reportBody);
  } else {
    console.log(`Invalid report type specified: ${type} Skipping Reports...)`);
  }
};
