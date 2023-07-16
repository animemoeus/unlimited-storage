"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const searchParams = useSearchParams();

  const file_id = searchParams.get("file_id");

  const [mergedFileUrl, setMergedFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [fileData, setFileData] = useState({});
  const [downloadStatus, setDownloadStatus] = useState("");

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
        `https://discord-storage.animemoe.us/chunked-file/?file_id=${file_id}`
      );

      const data = await response.data;
      setFileData(data);
      setDownloadStatus(`File name: ${data.file_name}`);
    } catch (error) {
      console.error("Error merging chunks: ", error);
    }
  };

  const handleMergeChunks = async () => {
    setDownloadStatus("Getting file...");
    const mergedChunks = [];

    try {
      for (let i = 0; i < fileData.file_urls.length; i++) {
        const response = await axios.get(
          `https://discord-storage.animemoe.us/bypass-discord-cors/?url=${fileData.file_urls[i]}`,
          {
            responseType: "blob",
            crossDomain: true,
            withCredentials: false,
          }
        );
        const chunkBlob = response.data;
        mergedChunks.push(chunkBlob);
        setDownloadStatus(
          `Getting file part ${i + 1} of ${fileData.file_urls.length}.`
        );
      }

      const mergedBlob = new Blob(mergedChunks);
      const mergedBlobUrl = URL.createObjectURL(mergedBlob);
      setMergedFileUrl(mergedBlobUrl);
      setDownloadStatus(`Click "Download File" button to save the file.`);
      setAllowDownload(true);
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
      <div className="container-fluid mt-5">
        <div className="card">
          <div className="card-header text-center">Unlimited File Storage</div>
          <div className="card-body text-center">
            <button
              type="button"
              className="m-1 btn btn-primary btn-md"
              onClick={handleMergeChunks}
            >
              Get File
            </button>
            <button
              type="button"
              className="m-1 btn btn-success btn-md"
              onClick={handleDownloadMergedFile}
              disabled={!allowDownload}
            >
              Download File
            </button>
            <br />
            <br />
            <p className="card-text text-center">{downloadStatus}</p>
          </div>
        </div>
      </div>

      {/* <button onClick={() => handleMergeChunks()}>Get File</button>
      <button onClick={handleDownloadMergedFile}>Save File</button> */}
    </div>
  );
}
