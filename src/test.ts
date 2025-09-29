// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Explicitly import tests
import '../tests/api.integration.spec';
import '../tests/hello-world.spec';

// This part is commented out because it's not needed since we're directly importing
// const context = (require as any).context('../', true, /\.spec\.ts$/);
// context.keys().map(context);