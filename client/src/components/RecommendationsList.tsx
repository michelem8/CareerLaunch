import React, { useState } from 'react';

interface RecommendationsListProps {
  recommendations: string[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialDisplayCount = 3;
  const hasMoreItems = recommendations.length > initialDisplayCount;
  
  const displayedRecommendations = isExpanded 
    ? recommendations 
    : recommendations.slice(0, initialDisplayCount);

  return (
    <div className="space-y-4">
      <ul className="list-disc pl-6 space-y-4 text-lg">
        {displayedRecommendations.map((recommendation, index) => (
          <li key={index} className="text-gray-700">
            {recommendation}
          </li>
        ))}
      </ul>
      
      {hasMoreItems && (
        <div className="mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                <span>See {recommendations.length - initialDisplayCount} more recommendations</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}; 