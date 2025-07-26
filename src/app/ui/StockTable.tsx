
"use client";

import { useState } from "react";
import { EditForm } from "./EditForm";
import { DeleteButton } from "./DeleteButton";

export function StockTable({ stocks }: { stocks: any[] }) {
  const [editingStock, setEditingStock] = useState<any>(null);

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Stock Watchlist</h2>
      <button
        onClick={() => setEditingStock({})} // Empty object for new stock
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add New Stock
      </button>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Ticker</th>
            <th className="py-2 px-4 border-b">Upper Threshold</th>
            <th className="py-2 px-4 border-b">Lower Threshold</th>
            <th className="py-2 px-4 border-b">Enabled</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.ticker}>
              <td className="py-2 px-4 border-b">{stock.ticker}</td>
              <td className="py-2 px-4 border-b">{stock.upper_threshold}</td>
              <td className="py-2 px-4 border-b">{stock.lower_threshold}</td>
              <td className="py-2 px-4 border-b">{stock.enabled ? "Yes" : "No"}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => setEditingStock(stock)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <DeleteButton ticker={stock.ticker} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingStock && (
        <EditForm
          stock={editingStock}
          onClose={() => setEditingStock(null)}
        />
      )}
    </div>
  );
}
