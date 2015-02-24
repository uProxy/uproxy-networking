/// <reference path='../../build/third_party/freedom-typings/freedom-common.d.ts' />
/// <reference path='../../build/third_party/freedom-typings/freedom-module-env.d.ts' />

import ChurnPipe = require('./churn-pipe');

if (typeof freedom !== 'undefined') {
  freedom['churnPipe'].providePromises(ChurnPipe);
}
