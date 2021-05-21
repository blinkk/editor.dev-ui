import {MediaFileData, MediaOptions} from '../editor/api';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RemoteMediaComponent {
  upload(file: File): Promise<MediaFileData>;
}

export interface RemoteMediaConstructor extends BaseRemoteMediaProvider {
  new (options?: MediaOptions): RemoteMediaComponent;
}

export class BaseRemoteMediaProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static canApply(file: File, options?: MediaOptions): boolean {
    return false;
  }
}
