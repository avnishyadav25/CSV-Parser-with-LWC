const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

// The component folder sits at the repo root (no force-app/), so tell Jest where to look.
module.exports = { ...jestConfig, roots: ['<rootDir>/createCSVTotable'] };
