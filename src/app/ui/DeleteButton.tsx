
"use client";

import { deleteStock } from "../lib/actions";

export function DeleteButton({ ticker }: { ticker: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm(`Are you sure you want to delete stock ${ticker}?`)) {
          await deleteStock(ticker);
        }
      }}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
    >
      Delete
    </button>
  );
}
