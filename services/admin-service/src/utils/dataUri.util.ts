//Converts an uploaded file’s buffer into a Data URI string (base64 format) for easy uploading or processing.

import DataUriParser from "datauri/parser.js";
import path from "path";

const getBuffer = (file: any) => {
    const parser = new DataUriParser();

    const extName = path.extname(file.originalname).toString();

    return parser.format(extName, file.buffer);
};

export default getBuffer;
