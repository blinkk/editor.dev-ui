export function base64toBlob(
  base64Data: string,
  contentType?: string,
  sliceSize?: number
) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, {type: contentType});
}

export function base64toFile(base64Data: string, filename: string) {
  const arr = base64Data.split(',') as Array<string>;
  if (!arr.length) {
    throw new Error('Empty base64 data.');
  }

  const findMime = arr[0].match(/:(.*?);/);
  if (!findMime?.length || findMime?.length < 2) {
    throw new Error('Unable to find mime.');
  }
  const mime = findMime[1];

  const bstr = atob(arr[1]);

  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, {type: mime});
}
