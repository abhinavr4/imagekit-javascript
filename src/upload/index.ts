import errorMessages from "../constants/errorMessages";
import respond from "../utils/respond";
import { request } from "../utils/request";
import { ImageKitOptions, UploadOptions, UploadResponse, JwtRequestOptions } from "../interfaces";

export const upload = (
  xhr: XMLHttpRequest,
  uploadOptions: UploadOptions,
  options: ImageKitOptions,
  callback?: (err: Error | null, response: UploadResponse | null) => void,
) => {

  if (!uploadOptions) {
    respond(true, errorMessages.INVALID_UPLOAD_OPTIONS, callback);
    return;
  }

  if (!uploadOptions.file) {
    respond(true, errorMessages.MISSING_UPLOAD_FILE_PARAMETER, callback);
    return;
  }

  if (!uploadOptions.fileName) {
    respond(true, errorMessages.MISSING_UPLOAD_FILENAME_PARAMETER, callback);
    return;
  }

  if (!options.authenticationEndpoint) {
    respond(true, errorMessages.MISSING_AUTHENTICATION_ENDPOINT, callback);
    return;
  }

  if (!options.publicKey) {
    respond(true, errorMessages.MISSING_PUBLIC_KEY, callback);
    return;
  }

  const reqPayload: JwtRequestOptions = {
    publicKey: options.publicKey,
    expire: 3600,
    uploadPayload: {},
  }

  var formData = new FormData();
  let key: keyof typeof uploadOptions;
  for (key in uploadOptions) {
    if (key) {
      if (key === "file" && typeof uploadOptions.file != "string") {
        formData.append('file', uploadOptions.file, String(uploadOptions.fileName));
      } else if (key === "tags" && Array.isArray(uploadOptions.tags)) {
        formData.append('tags', uploadOptions.tags.join(","));
        reqPayload.uploadPayload[key] = uploadOptions.tags.join(",");
      } else if (key === "responseFields" && Array.isArray(uploadOptions.responseFields)) {
        formData.append('responseFields', uploadOptions.responseFields.join(","));
        reqPayload.uploadPayload[key] = uploadOptions.responseFields.join(",");
      } else if (key === "extensions" && Array.isArray(uploadOptions.extensions)) {
        formData.append('extensions', JSON.stringify(uploadOptions.extensions));
        reqPayload.uploadPayload[key] = JSON.stringify(uploadOptions.extensions);
      } else if (key === "customMetadata" && typeof uploadOptions.customMetadata === "object" &&
        !Array.isArray(uploadOptions.customMetadata) && uploadOptions.customMetadata !== null) {
        formData.append('customMetadata', JSON.stringify(uploadOptions.customMetadata));
        reqPayload.uploadPayload[key] = JSON.stringify(uploadOptions.customMetadata);
      } else if (uploadOptions[key] !== undefined) {
        formData.append(key, String(uploadOptions[key]));
        if (key !== 'file')
          reqPayload.uploadPayload[key] = String(uploadOptions[key]);
      }
    }
  }

  request(xhr, formData, reqPayload, { ...options, authenticationEndpoint: options.authenticationEndpoint }, callback);
};
