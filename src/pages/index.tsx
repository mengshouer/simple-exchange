/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/dialog";

type dropEvent = {
  event: string;
  windowLabel: string;
  payload: string[];
  id: number;
};

const isImage = (path: string) => {
  return (
    path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg")
  );
};

const getFileSize = async (path: string) => {
  const result: { size: number } = await invoke("get_file_metadata", { path });
  return result.size;
};

const covertSize = (size: number) => {
  if (size < 1024) {
    return `${size} bytes`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const Home = () => {
  const [file1Path, setFile1Path] = useState("");
  const [file2Path, setFile2Path] = useState("");
  const [file1PreviewSrc, setFile1PreviewSrc] = useState("");
  const [file2PreviewSrc, setFile2PreviewSrc] = useState("");
  const [file1Size, setFile1Size] = useState(0);
  const [file2Size, setFile2Size] = useState(0);
  const inLeft = useRef(true);
  const [isExchangeNames, setIsExchangeNames] = useState(true);
  const [isExchangeSuffixes, setIsExchangeSuffixes] = useState(true);
  const [isExchangeFlag, setIsExchangeFlag] = useState(false);

  useEffect(() => {
    // 添加文件拖放监听
    listen("tauri://file-drop", async (event: dropEvent) => {
      inLeft.current = await invoke("get_cursor_in_left");

      if (event.payload.length) {
        if (inLeft.current) {
          setFile1Path(event.payload[0]);
        } else {
          setFile2Path(event.payload[0]);
        }
      }
    });
  }, []);

  useEffect(() => {
    const isImg = isImage(file1Path);
    if (isImg) {
      readBinaryFile(file1Path).then((res) => {
        const blob = new Blob([new Uint8Array(res)], { type: "image/png" });
        setFile1PreviewSrc(URL.createObjectURL(blob));
      });
    }

    getFileSize(file1Path).then((res) => {
      setFile1Size(res);
    });
  }, [file1Path, isExchangeFlag]);

  useEffect(() => {
    const isImg = isImage(file2Path);
    if (isImg) {
      readBinaryFile(file2Path).then((res) => {
        const blob = new Blob([new Uint8Array(res)], { type: "image/png" });
        setFile2PreviewSrc(URL.createObjectURL(blob));
      });
    }

    getFileSize(file2Path).then((res) => {
      setFile2Size(res);
    });
  }, [file2Path, isExchangeFlag]);

  const swapFiles = async () => {
    if (file1Path && file2Path) {
      const fileNames: string[] = await invoke("swap_files", {
        file1Path,
        file2Path,
        isExchangeNames,
        isExchangeSuffixes,
      });
      setFile1Path(fileNames[0]);
      setFile2Path(fileNames[1]);
      setIsExchangeFlag(!isExchangeFlag);
    } else {
      alert("Please select two files");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-1">
        <div className="flex">
          <span className="flex items-center rounded border border-gray-400 p-1">
            <input
              type="checkbox"
              checked={isExchangeNames}
              onChange={() => setIsExchangeNames(!isExchangeNames)}
            />
            <label className="ml-1">Exchange names</label>
          </span>
          <span className="flex items-center rounded border border-gray-400 p-1 ml-1">
            <input
              type="checkbox"
              checked={isExchangeSuffixes}
              onChange={() => setIsExchangeSuffixes(!isExchangeSuffixes)}
            />
            <label className="ml-1">Exchange suffixes</label>
          </span>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={swapFiles}
        >
          Swap
        </button>
      </div>
      <div className="flex">
        <div className="flex flex-col w-[50vw]">
          <div className="border-2 border-blue-500">
            <div className="break-all">{file1Path}</div>
            <div className="text-center text-purple-300">
              {file1Size ? covertSize(file1Size) : ""}
            </div>
          </div>
          <div
            className={`${
              file1Path ? "" : "h-[90vh] border-b-2"
            } border-dashed border-r-2 border-blue-500 text-center content-center`}
            onClick={async () => {
              const result = await open({ multiple: false });
              if (result) {
                setFile1Path(result as string);
              }
            }}
          >
            {isImage(file1Path) ? (
              <img src={file1PreviewSrc} alt="Preview" />
            ) : (
              file1Path
            )}
            {!file1Path && "select / drag file"}
          </div>
        </div>
        <div className="flex flex-col w-[50vw]">
          <div className="border-2 border-red-500">
            <div className="break-all">{file2Path}</div>
            <div className="text-center text-purple-300">
              {file2Size ? covertSize(file2Size) : ""}
            </div>
          </div>
          <div
            className={`${
              file2Path ? "" : "h-[90vh] border-b-2"
            } border-dashed border-l-2 border-red-500 text-center content-center`}
            onClick={async () => {
              const result = await open({ multiple: false });
              if (result) {
                setFile2Path(result as string);
              }
            }}
          >
            {isImage(file2Path) ? (
              <img src={file2PreviewSrc} alt="Preview" />
            ) : (
              file2Path
            )}
            {!file2Path && "select / drag file"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
