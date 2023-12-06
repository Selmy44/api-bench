import {
  Task,
} from './task.js';
import {
  Logger,
} from './logger/logger.js';
import {
  NullLogger,
} from './logger/null-logger.js';
import Reporter from './reporter/reporter.js';
import defaultReporter from './helper/default-reporter.js';
import executor from './executor.js';
import {
  Worker,
} from 'worker_threads';
import Job from './job.js';
import jobCreator from './helper/job-creator.js';
import reqlib from 'app-root-path';
import ReportModifier from './report-modifier/report-modifier.js';
import Storage from './storage/storage.js';
import NoopStorage from './storage/noop-storage.js';

const DEFAULT_THREADS = 10;
const DEFAULT_REPETITIONS = 1000;

/* eslint max-params:0, complexity:0 */
export const run = async(
  configuration: {
    reportModifiers?: Array<ReportModifier>|undefined,
    logger?: Logger|undefined,
    resultHandler?: Reporter|undefined,
    resultStorage?: Storage|undefined,
    resultOutputDir?: string
  },
  threads = DEFAULT_THREADS,
  repetitions = DEFAULT_REPETITIONS,
  job?: Job|Array<Task>|undefined,
): Promise<void> => {
  if (typeof configuration.logger === 'undefined') {
    configuration.logger = new NullLogger();
  }
  if (typeof configuration.resultStorage === 'undefined') {
    configuration.resultStorage = new NoopStorage();
  }
  if (typeof configuration.resultHandler === 'undefined') {
    configuration.resultHandler = defaultReporter;
  }
  if (typeof configuration.reportModifiers === 'undefined') {
    configuration.reportModifiers = [];
  }
  if (typeof job === 'undefined') {
    job = await jobCreator(`${ reqlib }`,);
  } else if (typeof job === 'object' && Array.isArray(job,)) {
    job = {
      before: [],
      beforeTask: [],
      beforeEach: [],
      main: job,
      afterEach: [],
      afterTask: [],
      after: [],
    };
  }
  executor(
    threads,
    repetitions,
    job,
    configuration.resultHandler,
    configuration.logger,
    Worker,
    configuration.reportModifiers,
    configuration.resultStorage,
    configuration.resultOutputDir || process.cwd(),
  );
};
