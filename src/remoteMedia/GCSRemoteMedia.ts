import {BaseRemoteMediaProvider, RemoteMediaComponent} from '.';
import {
  GoogleMediaOptions,
  MediaFileData,
  MediaOptions,
  RemoteMediaProviders,
} from '../editor/api';
import bent from 'bent';

const postJSON = bent('json', 'POST');

export class GCSRemoteMedia
  extends BaseRemoteMediaProvider
  implements RemoteMediaComponent
{
  options: GoogleMediaOptions;

  constructor(options: GoogleMediaOptions) {
    super();
    this.options = options;
  }

  static canApply(file: File, options?: MediaOptions): boolean {
    return options?.provider === RemoteMediaProviders.GCS;
  }

  async upload(file: File): Promise<MediaFileData> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', this.options.bucket || '');
    const response = await postJSON(this.options.url, formData);
    return {
      path: response.url,
      url: response.url,
    };
  }
}
