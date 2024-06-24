import lighthouseLib from 'lighthouse';
import { getReport } from './get-report.js'

const compare = (thresholds, newValue) => {
  const errors = [];
  const results = [];

  Object.keys(thresholds).forEach((key) => {
    if (thresholds[key] > newValue[key]) {
      errors.push(
        `${key} record is ${newValue[key]} and is under the ${thresholds[key]} threshold`
      );
    } else {
      results.push(
        `${key} record is ${newValue[key]} and desired threshold was ${thresholds[key]}`
      );
    }
  });

  return { errors, results };
};

export const lighthouse = async ({
  page,
  url,
  thresholds,
  opts = {},
  config,
  reports,
  cdpPort,
}) => {
  opts.port = cdpPort;

  if (!opts.onlyCategories) {
    opts.onlyCategories = Object.keys(thresholds);
  }

  let results = {};

  // Execution on LambdaTest
  if (process.env.LIGHTHOUSE_LAMBDATEST === 'true') {
    const lambdatestExecutionError =
      'Failed to generate Lighthouse report on LambdaTest';
    console.log('Generating Lighthouse report on LambdaTest for url:: ', url);
    const LAMBDATEST_ARGUMENTS = {
      action: 'lighthouseReport',
      arguments: {
        url,
        lighthouseOptions: opts,
        lighthouseConfig: config,
        source: 'playwright-lighthouse',
      },
    };

    const lambdaAction = `lambdatest_action: ${JSON.stringify(
      LAMBDATEST_ARGUMENTS
    )}`;

    const ltResponse = await page.evaluate(() => {}, lambdaAction);

    try {
      const { error, data } = JSON.parse(ltResponse);
      results.lhr = JSON.parse(data);
      if (error) throw lambdatestExecutionError;
    } catch (error) {
      throw new Error(`${lambdatestExecutionError}: ${ltResponse}`);
    }
  } else {
    results = await lighthouseLib(
      url,
      { disableStorageReset: true, ...opts },
      config
    );
  }

  const newValues = Object.keys(results.lhr.categories).reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: results.lhr.categories[curr].score * 100,
    }),
    {}
  );

  for (var typeFromKey in reports['formats']) {
    var value = reports['formats'][typeFromKey];
    if (value) {
      await getReport(
        results.lhr,
        reports['directory'],
        reports['name'],
        typeFromKey
      );
    }
  }

  const output = { comparison: compare(thresholds, newValues), results };
  return output;
};
