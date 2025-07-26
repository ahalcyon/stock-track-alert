
"use client";

import { createStock, updateStock } from "../lib/actions";
import { useEffect, useRef } from "react";

export function EditForm({ stock, onClose }: { stock: any; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const isNew = !stock.ticker;

  useEffect(() => {
    if (formRef.current && !isNew) {
      (formRef.current.elements.namedItem("ticker") as HTMLInputElement).value = stock.ticker;
      (formRef.current.elements.namedItem("upper_threshold") as HTMLInputElement).value = stock.upper_threshold;
      (formRef.current.elements.namedItem("lower_threshold") as HTMLInputElement).value = stock.lower_threshold;
      (formRef.current.elements.namedItem("enabled") as HTMLInputElement).checked = stock.enabled;
    }
  }, [stock, isNew]);

  const handleSubmit = async (formData: FormData) => {
    if (isNew) {
      await createStock(formData);
    } else {
      await updateStock(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">
          {isNew ? "Add New Stock" : `Edit Stock: ${stock.ticker}`}
        </h2>
        <form ref={formRef} action={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="ticker" className="block text-gray-700 text-sm font-bold mb-2">
              Ticker:
            </label>
            <input
              type="text"
              id="ticker"
              name="ticker"
              defaultValue={stock.ticker}
              readOnly={!isNew}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="upper_threshold" className="block text-gray-700 text-sm font-bold mb-2">
              Upper Threshold:
            </label>
            <input
              type="number"
              step="0.01"
              id="upper_threshold"
              name="upper_threshold"
              defaultValue={stock.upper_threshold}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lower_threshold" className="block text-gray-700 text-sm font-bold mb-2">
              Lower Threshold:
            </label>
            <input
              type="number"
              step="0.01"
              id="lower_threshold"
              name="lower_threshold"
              defaultValue={stock.lower_threshold}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              defaultChecked={stock.enabled}
              className="mr-2 leading-tight"
            />
            <label htmlFor="enabled" className="text-sm">
              Enabled
            </label>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isNew ? "Add Stock" : "Update Stock"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
