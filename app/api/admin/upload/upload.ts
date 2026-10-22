import api from "@/lib/axios";

export interface FileUploadResult {
  url: string;
}
export const fileUpload = async (
  file: File | File[],
): Promise<FileUploadResult> => {
  const filesArray = Array.isArray(file) ? file : [file];
  const formData = new FormData();

  filesArray.forEach((file) => {
    formData.append("file", file);
  });

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

