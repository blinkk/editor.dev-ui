import {MediaFileData} from '../editor/api';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RemoteMediaComponent {
  upload(file: File): Promise<MediaFileData>;
}
