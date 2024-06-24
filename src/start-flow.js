import { startFlow as sf } from 'lighthouse';

export const startFlow = ({ config }) => {
  // See https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md
  // for the flow API.
  //
  // To finish, call await flow.generateReport()
  return sf(page, { config });
}
