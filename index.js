import * as core from '@actions/core';
import { context } from '@actions/github';

import * as toolkit from '@github/dependency-submission-toolkit';
import * as lib from './lib/index.js';

const VERSION = "0.4.0-pango.1";

async function run() {
  const files = lib.searchFiles();
  let manifests = lib.getManifestsFromSpdxFiles(files, core.getInput('manifestPath'));
  const submissionContext = lib.getSubmissionContext(context, core.getInput('repoPath') || process.cwd());

  const correlator = core.getInput('correlator');
  let snapshot = new toolkit.Snapshot({
    name: "spdx-to-dependency-graph-action",
    version: VERSION,
    // This fork, not upstream: the detector URL is where someone lands when a submitted
    // graph looks wrong, and the classification differences that would send them there
    // are ours.
    url: "https://github.com/Pango-Inc/spdx-dependency-submission-action",
  },
    submissionContext,
    {
      correlator: correlator,
      id: context.runId.toString()
    });

  manifests?.forEach(manifest => {
    snapshot.addManifest(manifest);
  });

  await lib.submitSnapshot(snapshot, submissionContext);
}

run();