type Item = {
  title: string;
  subtitle?: string;
  rightText?: string;
};

type Props = {
  title: string;
  items: Item[];
  emptyText?: string;
};

import { useState } from "react";

export const ListCard = ({ title, items, emptyText }: Props) => {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-4 flex-1">
      <h3 className="font-medium mb-2">{title}</h3>

      {items.length ? (
        <>
          <div className="flex flex-col gap-2">
            {visibleItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.title}</span>
                  {item.rightText && (
                    <span className="text-sm text-gray-500">
                      {item.rightText}
                    </span>
                  )}
                </div>

                {item.subtitle && (
                  <p className="text-sm text-gray-600">
                    {item.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>

          {items.length > 5 && (
            <button className="text-blue-600 text-sm mt-2 hover:underline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : "View All"}
            </button> )}
        </> ) : ( <p className="text-gray-500 text-sm"> {emptyText || "No data"} </p> )}
    </div>
  );
};
