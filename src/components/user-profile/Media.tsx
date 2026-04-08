"use client";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { MediaDto } from "@/interface/media";
import { URL_MEDIA } from "../../../api";

export default function MediaCard({ data }: { data: MediaDto }) {
  const [index, setIndex] = useState(-1);
  const listMedia = data?.data || [];

  const slides = listMedia.map((item) => ({
    src: `${URL_MEDIA}${item.storage_key}`,
    title: item.original_name,
    description: `Size: ${(item.size / 1024).toFixed(2)} KB - Type: ${item.mime_type}`,
  }));

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Media Assets</h3>

      <div className="flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {listMedia.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setIndex(idx)}
            className="group relative min-w-[150px] h-[150px] cursor-pointer overflow-hidden rounded-lg border border-gray-200"
          >
            <img
              src={`${URL_MEDIA}${item.storage_key}`}
              alt={item.original_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />

            <div className="absolute inset-0 flex items-end bg-black/40 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="w-full truncate text-xs text-white">
                {item.original_name}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom, Captions]}
        zoom={{
          maxZoomPixelRatio: 10,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
        }}
        animation={{ zoom: 200 }}
        styles={{
          root: {
            zIndex: 999999999,
            "--yarl__color_backdrop": "rgba(0, 0, 0, 0.85)",
          },
        }}
      />
    </div>
  );
}
