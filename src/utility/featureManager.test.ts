import {FeatureManager} from './featureManager';
import test from 'ava';

test('default status with no features defined', t => {
  const featuresOff = new FeatureManager({
    defaultStatus: false,
  });

  t.is(featuresOff.isOn('random'), false);
  t.is(featuresOff.isOff('random'), true);

  const featuresOn = new FeatureManager({
    defaultStatus: true,
  });

  t.is(featuresOn.isOn('random'), true);
  t.is(featuresOn.isOff('random'), false);
});

test('turn features on, default off', t => {
  const features = new FeatureManager({
    defaultStatus: false,
  });

  t.is(features.isOn('random'), false);
  t.is(features.isOff('random'), true);

  t.is(features.on('random'), true);

  t.is(features.isOn('random'), true);
  t.is(features.isOff('random'), false);
});

test('turn features on, default on', t => {
  const features = new FeatureManager({
    defaultStatus: true,
  });

  t.is(features.isOn('random'), true);
  t.is(features.isOff('random'), false);

  t.is(features.on('random'), true);

  t.is(features.isOn('random'), true);
  t.is(features.isOff('random'), false);
});

test('turn features off, default off', t => {
  const features = new FeatureManager({
    defaultStatus: false,
  });

  t.is(features.isOn('random'), false);
  t.is(features.isOff('random'), true);

  t.is(features.off('random'), false);

  t.is(features.isOn('random'), false);
  t.is(features.isOff('random'), true);
});

test('turn features off, default on', t => {
  const features = new FeatureManager({
    defaultStatus: true,
  });

  t.is(features.isOn('random'), true);
  t.is(features.isOff('random'), false);

  t.is(features.off('random'), false);

  t.is(features.isOn('random'), false);
  t.is(features.isOff('random'), true);
});

test('feature settings on', t => {
  const features = new FeatureManager({
    defaultStatus: false,
  });
  const settings = {
    foo: 'bar',
  };

  t.is(features.isOn('random'), false);

  // Set settings when setting feature.
  t.is(features.on('random', settings), settings);

  t.is(features.isOn('random'), true);

  // Can retrieve settings.
  t.is(features.settings('random'), settings);
});

test('feature settings off', t => {
  const features = new FeatureManager({
    defaultStatus: false,
  });
  const settings = {
    foo: 'bar',
  };

  t.is(features.isOn('random'), false);

  // Set settings when setting feature.
  t.is(features.off('random', settings), settings);

  t.is(features.isOn('random'), false);

  // Can retrieve settings.
  t.is(features.settings('random'), settings);
});

test('feature set values with settings', t => {
  const features = new FeatureManager({
    defaultStatus: false,
  });
  const settings = {
    foo: 'bar',
  };

  t.is(features.isOn('random'), false);

  // Set settings when setting feature.
  t.is(features.set('random', settings), settings);

  t.is(features.isOn('random'), true);

  // Can retrieve settings.
  t.is(features.settings('random'), settings);
});

test('feature set values with boolean, default off', t => {
  const features = new FeatureManager({
    defaultStatus: false,
  });

  t.is(features.isOn('foo'), false);
  t.is(features.set('foo', false), false);
  t.is(features.isOn('foo'), false);

  t.is(features.isOn('bar'), false);
  t.is(features.set('bar', true), true);
  t.is(features.isOn('bar'), true);
});

test('feature set values with boolean, default on', t => {
  const features = new FeatureManager({
    defaultStatus: true,
  });

  t.is(features.isOn('foo'), true);
  t.is(features.set('foo', false), false);
  t.is(features.isOn('foo'), false);

  t.is(features.isOn('bar'), true);
  t.is(features.set('bar', true), true);
  t.is(features.isOn('bar'), true);
});
