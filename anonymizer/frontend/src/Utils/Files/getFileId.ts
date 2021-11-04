import { RcFile } from "antd/lib/upload";

export const getFileID = (file: File | RcFile) => {
    return btoa(`${file.size}${file.type}${file.lastModified}`);
};