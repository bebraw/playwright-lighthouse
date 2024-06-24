import lighthouseLib from 'lighthouse';

export const startFlow = ({ config }) => {
  // See https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md
  // for the flow API.
  //
  // To finish, call await flow.generateReport()
  return lighthouseLib.startFlow(page, { config });
}
