import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

export const FileUpload = ({ onChange }: { onChange?: (file: File | null) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const newFile = newFiles[0] || null;
    setFile(newFile);
    onChange && onChange(newFile);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden bg-[#112240]"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          {!file && (
            <>
              <p className="relative z-20 font-sans font-bold text-white text-base">
                Upload file
              </p>
              <p className="relative z-20 font-sans font-normal text-gray-300 text-base mt-2">
                Drag or drop your file here or click to upload
              </p>
            </>
          )}

          {file && (
            <p className="relative z-20 font-sans font-normal text-gray-300 text-base">
              {file.name}
            </p>
          )}

          {!file && (
            <motion.div
              layoutId="file-upload"
              variants={mainVariant}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={cn(
                "relative group-hover/file:shadow-2xl z-40 bg-[#1A2C4E] flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                "shadow-[0px_10px_50px_rgba(0,0,0,0.3)]"
              )}
            >
              {isDragActive ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-300 flex flex-col items-center"
                >
                  Drop it
                  <IconUpload className="h-4 w-4 text-gray-300" />
                </motion.p>
              ) : (
                <IconUpload className="h-4 w-4 text-gray-300" />
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-[#0A192F] flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-[#112240]"
                  : "bg-[#112240] shadow-[0px_0px_1px_3px_rgba(26,44,78,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

