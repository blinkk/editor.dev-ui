import {BaseRemoteMediaProvider, RemoteMediaComponent} from '.';
import {
  GoogleMediaOptions,
  MediaFileData,
  MediaOptions,
  RemoteMediaProviders,
} from '../editor/api';

export class GCSRemoteMedia
  extends BaseRemoteMediaProvider
  implements RemoteMediaComponent
{
  static canApply(file: File, options?: MediaOptions): boolean {
    return options?.provider === RemoteMediaProviders.GCS;
  }
  options: GoogleMediaOptions;

  constructor(options: GoogleMediaOptions) {
    super();
    this.options = options;
  }

  async upload(file: File): Promise<MediaFileData> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', this.options.bucket || '');

    // Bug in bent with sending FormData
    // https://github.com/mikeal/bent/pull/135
    // const response = await postJSON(this.options.url, formData);
    // return {
    //   path: response.url,
    //   url: response.url,
    // };

    // TODO: Remove the following when the bent issue is fixed.
    const codes = new Set();
    codes.add(200);

    const response = await fetch(this.options.url, {
      method: 'POST',
      body: formData,
    });

    if (!codes.has(response.status)) {
      throw new Error(await response.text());
    }

    const parsed = await response.json();
    return {
      path: parsed.url,
      url: parsed.url,
    };
  }
}
