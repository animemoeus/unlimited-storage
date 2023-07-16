"use client";
import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  let CHUNK_SIZE = 2; // MB
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedChunks, setUploadedChunks] = useState([]);
  const [mergedFileUrl, setMergedFileUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const saveChunkedFileData = async (fileName, fileUrls) => {
    setUploadStatus("Getting the file url...");
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://discord-storage.animemoe.us/chunked-file/",
        JSON.stringify({
          file_name: fileName,
          file_urls: fileUrls.join(","),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data.data.uuid);
      setUploadStatus(
        `File URL: http://localhost:3000/download?file_id=${response.data.data.uuid}`
      );
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
    setIsLoading(false);
  };

  const handleChunkFileUpload = async () => {
    setUploadStatus("Starting upload...");
    setIsLoading(true);
    const uploadedChunkFileUrls = [];

    if (selectedFile) {
      const chunkSize = CHUNK_SIZE * 1024 * 1024; // 2MB chunk size
      const totalChunks = Math.ceil(selectedFile.size / chunkSize);

      // Split the file into chunks
      const chunks = [];
      let offset = 0;
      for (let i = 0; i < totalChunks; i++) {
        const chunk = selectedFile.slice(offset, offset + chunkSize);
        const renamedChunk = new File([chunk], `discord-storage.bin`, {
          type: chunk.type,
        });
        chunks.push(renamedChunk);
        offset += chunkSize;
      }

      try {
        // Upload each chunk one by one
        for (let i = 0; i < totalChunks; i++) {
          const formData = new FormData();
          formData.append("file", chunks[i]);

          const response = await axios.post(
            "https://discord-storage.animemoe.us/api/upload-from-file/",
            formData
          );
          const data = response.data;
          const chunkDownloadUrl = data.url;
          setUploadedChunks((prevUploadedChunks) => [
            ...prevUploadedChunks,
            chunkDownloadUrl,
          ]);
          setUploadStatus(`Uploading ${i + 1}/${totalChunks}`);
          uploadedChunkFileUrls.push(chunkDownloadUrl);
        }
        setUploadStatus("File uploaded successfully.");
      } catch (error) {
        setUploadStatus("Error uploading file :(");
        console.error("Error uploading file: ", error);
      }
    }
    saveChunkedFileData(selectedFile.name, uploadedChunkFileUrls);
    setIsLoading(false);
    console.log("finish");
  };

  const handleMergeChunks = async () => {
    console.log("Merging chunks...");
    const mergedChunks = [];

    try {
      for (let i = 0; i < uploadedChunks.length; i++) {
        const response = await axios.get(
          `http://localhost:8000/bypass-discord-cors/?url=${uploadedChunks[i]}`,
          {
            responseType: "blob",
            crossDomain: true,
            withCredentials: false,
          }
        );
        const chunkBlob = response.data;
        mergedChunks.push(chunkBlob);
        console.log(`Merged chunk ${i + 1}/${uploadedChunks.length}`);
      }

      const mergedBlob = new Blob(mergedChunks);
      const mergedBlobUrl = URL.createObjectURL(mergedBlob);
      setMergedFileUrl(mergedBlobUrl);
      console.log("Chunks merged successfully.");
    } catch (error) {
      console.error("Error merging chunks: ", error);
    }
  };

  const handleDownloadMergedFile = () => {
    if (mergedFileUrl) {
      const link = document.createElement("a");
      link.href = mergedFileUrl;
      link.download = selectedFile.name;
      link.click();
    }
  };

  return (
    <div className="container-md border rounded shadow min-vh-100">
      <div className="container-fluid mt-5">
        <div className="card">
          <div className="card-header text-center">Unlimited File Storage</div>
          <div className="card-body">
            <div className="input-group">
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleChunkFileUpload}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? <span>Uploading...</span> : <span>Upload</span>}
              </button>
            </div>
            <br />
            <p className="card-text text-center">{uploadStatus}</p>
          </div>
        </div>
      </div>

      {/* <input type="file" onChange={handleFileChange} />
      <button onClick={handleChunkFileUpload}>Upload</button>
      <button
        onClick={handleMergeChunks}
        disabled={uploadedChunks.length === 0}
      >
        Merge Chunks
      </button>
      <button onClick={handleDownloadMergedFile} disabled={!mergedFileUrl}>
        Download Merged File
      </button>
      <button onClick={() => {}}>arter</button> */}
    </div>
  );
}
export default FileUpload;
