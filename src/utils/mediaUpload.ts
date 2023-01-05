import RNFetchBlob from 'rn-fetch-blob';
import server from '../api';
import {isAndroid} from '../constants';
import {getFileNameFromPath} from './text';

export const getSignedUrl = async body => {
  try {
    const response = await server.post('/v1/upload/getSignedUrl', body);
    if (response?.data) {
      return response.data;
    }
  } catch (error) {
    console.log('getSignedUrl error', error);
    throw error;
  }
};

export const uploadFileToS3 = async (url, file) => {
  try {
    await RNFetchBlob.fetch(
      'PUT',
      url,
      {
        'Content-Type': file.mime,
      },
      RNFetchBlob.wrap(file?.path?.replace('file://', '')),
    );
  } catch (error) {
    console.log('uploadFileToS3 error', error);
    throw error;
  }
};

export const mediaUploadHandler = async (file, uploadType = '') => {
  try {
    const body = {
      fileName: isAndroid ? getFileNameFromPath(file.path) : file.filename,
      uploadType,
      contentType: file.mime,
    };
    const signedUrlData = await getSignedUrl(body);
    if (signedUrlData?.url) {
      await uploadFileToS3(signedUrlData.url, file);
      return signedUrlData.fileKey;
    }
  } catch (error) {
    console.log('mediaUploadHandler error', error);
    throw error;
  }
};
