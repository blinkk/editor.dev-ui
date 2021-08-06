import * as placeholderPlugin from './plugins/placeholder';

import {Document, NunjucksPlugin, Pod, StaticFile} from '@amagaki/amagaki';

export default (pod: Pod) => {
  pod.configure({
    meta: {
      name: 'Editor.dev',
    },
    localization: {
      defaultLocale: 'en',
      locales: ['en'],
    },
    environments: {
      default: {},
      prod: {},
    },
    staticRoutes: [
      {
        path: '/static/css/',
        staticDir: '/dist/css/',
      },
      {
        path: '/static/js/',
        staticDir: '/dist/js/',
      },
      {
        path: '/static/',
        staticDir: '/static/',
      },
    ],
  });

  placeholderPlugin.register(pod, {
    sizes: ['16x9', '1x1', '9x16', '7x3'],
  });

  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;
  type Urlable = StaticFile | Document | string;
  nunjucksPlugin.addFilter('url', (object: Urlable) => {
    if (object instanceof StaticFile) {
      return `${object.url.path}?fingerprint=${object.fingerprint}`;
    } else if (object instanceof Document) {
      return `${object.url.path}`;
    }
    return `${object}`;
  });
};
