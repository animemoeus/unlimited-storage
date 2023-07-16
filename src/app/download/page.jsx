"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const searchParams = useSearchParams();

  const file_id = searchParams.get("file_id");

  const [mergedFileUrl, setMergedFileUrl] = useState(null);
  const [fileData, setFileData] = useState({});

  useEffect(() => {
    if (!file_id) {
      console.log("No file_id");
    } else {
      const file = getFileData(file_id);
    }
  }, []);

  const getFileData = async (file_id) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/chunked-file/?file_id=${file_id}`
      );

      const data = await response.data;
      setFileData(data);
      console.log(data);
    } catch (error) {
      console.error("Error merging chunks: ", error);
    }
  };

  const handleMergeChunks = async () => {
    console.log("Merging chunks...");
    const mergedChunks = [];

    try {
      for (let i = 0; i < fileData.file_urls.length; i++) {
        const response = await axios.get(
          `http://localhost:8000/bypass-discord-cors/?url=${fileData.file_urls[i]}`,
          {
            responseType: "blob",
            crossDomain: true,
            withCredentials: false,
          }
        );
        const chunkBlob = response.data;
        mergedChunks.push(chunkBlob);
        console.log(`Merged chunk ${i + 1}/${fileData.file_urls.length}`);
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
      link.download = fileData.file_name;
      link.click();
    }
  };

  return (
    <div>
      <button onClick={() => handleMergeChunks()}>Get File</button>
      <button onClick={handleDownloadMergedFile}>Save File</button>
    </div>
  );
}
