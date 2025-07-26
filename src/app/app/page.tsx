
import { getAllStocks } from "./lib/actions";
import { StockTable } from "./ui/StockTable";

export default async function Home() {
  const stocks = await getAllStocks();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <StockTable stocks={stocks} />
      </div>
    </main>
  );
}
