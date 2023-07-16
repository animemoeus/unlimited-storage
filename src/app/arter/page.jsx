"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

function FileUpload() {
  let CHUNK_SIZE = 2; // MB
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedChunks, setUploadedChunks] = useState([]);
  const [mergedFileUrl, setMergedFileUrl] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const saveChunkedFileData = async (fileName, fileUrls) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/chunked-file/",
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

      console.log("File uploaded successfully.");
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  const handleChunkFileUpload = async () => {
    console.log("start");
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
          console.log(`Uploading ${i + 1}/${totalChunks}`);
          uploadedChunkFileUrls.push(chunkDownloadUrl);
        }
        console.log("File uploaded successfully.");
      } catch (error) {
        console.error("Error uploading file: ", error);
        // Handle the error
      }
    }
    saveChunkedFileData(selectedFile.name, uploadedChunkFileUrls);
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
    <div>
      <input type="file" onChange={handleFileChange} />
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
      <button onClick={() => {}}>arter</button>
    </div>
  );
}
export default FileUpload;
