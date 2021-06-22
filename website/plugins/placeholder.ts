import {Pod, Route, RouteProvider, Router} from '@amagaki/amagaki';

interface PlaceholderRouteProviderOptions {
  sizes: Array<string>;
}

interface PlaceholderRouteOptions {
  bgColor?: string;
  icon?: boolean;
  size: string;
}

class PlaceholderRouteProvider extends RouteProvider {
  options: PlaceholderRouteProviderOptions;

  constructor(router: Router, options: PlaceholderRouteProviderOptions) {
    super(router);
    this.type = 'placeholder';
    this.options = options;
  }

  async routes() {
    const routes = [];
    this.options.sizes.forEach(size => {
      const options = {
        size: size,
      };
      routes.push(new PlaceholderRoute(this, options));
    });
    return routes;
  }
}

class PlaceholderRoute extends Route {
  options: PlaceholderRouteOptions;

  constructor(provider: RouteProvider, options: PlaceholderRouteOptions) {
    super(provider);
    this.provider = provider;
    this.options = options;
  }
  get contentType() {
    return 'image/svg+xml';
  }
  get path() {
    return this.urlPath;
  }
  get urlPath() {
    return `/static/placeholder/${this.options.size}.svg`;
  }
  async build() {
    const parts = this.options.size.split('x');
    const bgColor = this.options.bgColor || '#efefef';
    const icon = this.options.icon;

    const originalWidth = parseInt(parts[0]);
    const originalHeight = parseInt(parts[1]);
    let width = originalWidth * 200;
    let height = originalHeight * 200;
    const isAbsoluteSize =
      originalWidth > 10 && originalWidth === originalHeight;
    const fontFamily = 'Google Sans, Roboto, sans-serif';
    let fontSize;
    let fontWeight = 'normal';
    let fontStyle = '';
    let textColor;
    if (icon) {
      fontSize =
        width > height ? Math.floor(height / 4) : Math.floor(width / 4);
      textColor = '#000000';
    } else if (isAbsoluteSize) {
      fontSize = 12;
      height = originalHeight;
      textColor = '#000000';
      width = originalWidth;
    } else {
      fontSize =
        width > height ? Math.floor(height / 11) : Math.floor(width / 11);
      fontStyle = 'letter-spacing: 1px; font-weight: 500';
      fontWeight = 'medium';
      textColor = '#999999';
    }
    const text = `${parts[0]}x${parts[1]}`;
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%">
            <rect style="fill:${bgColor};" width="${width}" height="${height}"/>
            <text fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" style="${fontStyle}">${text}</text>
        </svg>
    `;
  }
}

export const register = (pod: Pod, options) => {
  pod.router.addProvider(new PlaceholderRouteProvider(pod.router, options));
};
