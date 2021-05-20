import {GoogleMediaOptions, MediaFileData} from '../editor/api';
import {RemoteMediaComponent} from '.';
import bent from 'bent';

const postJSON = bent('json', 'POST');

export class GCSRemoteMedia implements RemoteMediaComponent {
  options: GoogleMediaOptions;

  constructor(options: GoogleMediaOptions) {
    this.options = options;
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
