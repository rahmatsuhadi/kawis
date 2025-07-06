'use client';
import { useState } from "react";

export default function InlinePostContent({ content, maxLength = 200 }: { content: string; maxLength?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const plainTextContent = content.replace(/<[^>]*>/g, '');
  const shouldTruncate = plainTextContent.length > maxLength;
  const truncatedContent = shouldTruncate && !isExpanded
    ? plainTextContent.slice(0, maxLength) + '...'
    : content;
  const finalRenderedContent = { __html: truncatedContent };

  return (
    <div className="text-gray-800 mb-2 text-sm lg:text-base">
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={finalRenderedContent}
      ></div>
      {shouldTruncate && (
        <button
          className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan selengkapnya'}
        </button>
      )}
    </div>
  );
}