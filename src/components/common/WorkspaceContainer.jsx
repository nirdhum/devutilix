"use client";

import { useState, useEffect } from "react";
import WorkspaceHeader from "./WorkspaceHeader";
import RelatedUtilities from "./RelatedUtilities";
import UtilityLoader from "../utilities/UtilityLoader";
import { useFavorites } from "../../context/FavoritesContext";

export default function WorkspaceContainer({ utility }) {
  const [isWide, setIsWide] = useState(false);
  const { addRecent } = useFavorites();

  // Track as recently visited tool
  useEffect(() => {
    if (utility?.id) {
      addRecent(utility.id);
    }
  }, [utility?.id, addRecent]);

  return (
    <div
      className={`mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 transition-all duration-200 ${
        isWide ? "max-w-full lg:px-12" : "max-w-7xl"
      }`}
    >
      <WorkspaceHeader
        utility={utility}
        isWide={isWide}
        onToggleWide={() => setIsWide((prev) => !prev)}
      />

      <div className="min-h-[450px]">
        <UtilityLoader componentName={utility.component} />
      </div>

      <RelatedUtilities
        currentUtilityId={utility.id}
        category={utility.category}
      />
    </div>
  );
}
