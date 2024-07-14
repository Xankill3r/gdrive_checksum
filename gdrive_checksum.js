function getFileChecksums(folderName, folderId) {
  const query = '"' + folderId + '" in parents and trashed = false';
  console.log(query);
  let files;
  let pageToken = null;
  let output = [];
  let folders = [];
  do {
    try {
      files = Drive.Files.list({
        q: query,
        pageSize: 100,
        pageToken: pageToken,
        orderBy: 'name',
        fields:"nextPageToken,files(id, name, mimeType, md5Checksum, sha1Checksum, sha256Checksum, size)"
      });
      if (!files.files || files.files.length === 0) {
        console.log('All contents found.');
        return;
      }
      for (let i = 0; i < files.files.length; i++) {
        const file = files.files[i];
        if (file.mimeType == 'application/vnd.google-apps.folder') {
          folders.push({ id: file.id, name: file.name });
        }
        else {
          output.push({
            name: file.name,
            id: file.id,
            md5: file['md5Checksum'],
            sha1: file['sha1Checksum'],
            sha256: file['sha256Checksum'],
            size: file.size
          });
        }
      }
      pageToken = files.nextPageToken;
    } catch (err) {
      console.log('Failed with error %s', err.message);
    }
  } while (pageToken);
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    let folderData = getFileChecksums(folderName + '/' + folder.name, folder.id);
    output.push(folderData);
  }
  let obj = {path: folderName, files: output};
  return obj;
}
