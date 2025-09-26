import { isJson } from "@/lib/utils";
import React, { useMemo } from "react";

interface RichTextViewerProps {
  text: string;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <p className="text-gray-200">
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </p>
  );
};

interface JsonFormattedOutputProps {
  str: string;
  onClick?: () => void;
}


const CODE_BLOCK_STYLE = `whitespace-pre-wrap
  block
  bg-gray-900
  text-white
  text-sm
  font-mono
  rounded-md
  p-4
  min-h-[20px]
  overflow-x-auto
  shadow-sm
  cursor-pointer
  transition
  duration-200
  ease-in-out
  focus:outline-none
  focus:ring-2
  focus:ring-white
  focus:ring-offset-2
  select-textt`;

export const JsonFormattedOutput: React.FC<JsonFormattedOutputProps> = ({
  str,
  onClick,
  ...props
}) => {
  const isJSON: boolean = useMemo(() => {
    return isJson(str);
  }, [str]);

  return (
    <>
      {isJSON ? (
        <code
          onClick={onClick}
          className={CODE_BLOCK_STYLE}
          {...props}
        >
          {str}
        </code>
      ) : (
        <p
          onClick={onClick}
          className={"whitespace-pre-wrap text-sm text-gray-400 min-h-[20px]"}
          {...props}
        >
          {str}
        </p>
      )}
    </>
  );
};
