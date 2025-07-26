import type { NextPage } from 'next';
import { useEffect, useState, FormEvent } from 'react';

// スタイル定義
const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' as 'collapse' },
  th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' as 'left' },
  td: { border: '1px solid #ddd', padding: '8px' },
  form: { marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
  button: { padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteButton: { backgroundColor: '#f44336', color: 'white' },
  createButton: { backgroundColor: '#4CAF50', color: 'white' },
  toggleButton: { backgroundColor: '#008CBA', color: 'white' },
};

// 銘柄の型定義
interface Stock {
  ticker: string;
  upper_threshold: number;
  lower_threshold: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

const Home: NextPage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [newStock, setNewStock] = useState({ ticker: '', upper_threshold: '', lower_threshold: '' });

  // 初期データ取得
  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Stock[] = await res.json();
      setStocks(data.sort((a, b) => a.ticker.localeCompare(b.ticker)));
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // 新規追加
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStock),
      });
      if (!res.ok) throw new Error('Failed to create');
      await fetchStocks(); // 再取得してリストを更新
      setNewStock({ ticker: '', upper_threshold: '', lower_threshold: '' }); // フォームをリセット
    } catch (error) {
      console.error('Error creating stock:', error);
    }
  };

  // 削除
  const handleDelete = async (ticker: string) => {
    if (!confirm(`Are you sure you want to delete ${ticker}?`)) return;
    try {
      const res = await fetch(`/api/stocks/${ticker}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchStocks();
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  // 有効/無効 切り替え
  const handleToggleEnabled = async (stock: Stock) => {
    try {
      const res = await fetch(`/api/stocks/${stock.ticker}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: !stock.enabled }),
        }
      );
      if (!res.ok) throw new Error('Failed to toggle');
      await fetchStocks();
    } catch (error) {
      console.error('Error toggling stock:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Stock Track Alert</h1>

      <form onSubmit={handleCreate} style={styles.form}>
        <input required style={styles.input} type="text" placeholder="Ticker (e.g., AAPL)" value={newStock.ticker} onChange={(e) => setNewStock({ ...newStock, ticker: e.target.value.toUpperCase() })} />
        <input required style={styles.input} type="number" placeholder="Upper Threshold" value={newStock.upper_threshold} onChange={(e) => setNewStock({ ...newStock, upper_threshold: e.target.value })} />
        <input required style={styles.input} type="number" placeholder="Lower Threshold" value={newStock.lower_threshold} onChange={(e) => setNewStock({ ...newStock, lower_threshold: e.target.value })} />
        <button type="submit" style={{...styles.button, ...styles.createButton}}>Add New Stock</button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Ticker</th>
            <th style={styles.th}>Upper Threshold</th>
            <th style={styles.th}>Lower Threshold</th>
            <th style={styles.th}>Enabled</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.ticker}>
              <td style={styles.td}>{stock.ticker}</td>
              <td style={styles.td}>{stock.upper_threshold}</td>
              <td style={styles.td}>{stock.lower_threshold}</td>
              <td style={styles.td}>{stock.enabled ? '✅' : '❌'}</td>
              <td style={{...styles.td, display: 'flex', gap: '5px'}}>
                <button onClick={() => handleToggleEnabled(stock)} style={{...styles.button, ...styles.toggleButton}}>
                  {stock.enabled ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => handleDelete(stock.ticker)} style={{...styles.button, ...styles.deleteButton}}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;