
import { useState } from 'react';
import { fetchSheetData } from '../utils/sheetService';
import type { RawSheetRow } from '../types';
import { Loader2 } from 'lucide-react';

interface ConnectionFormProps {
    onDataLoaded: (data: RawSheetRow[]) => void;
}

export default function ConnectionForm({ onDataLoaded }: ConnectionFormProps) {
    const [sheetId, setSheetId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        if (!sheetId.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchSheetData(sheetId);
            onDataLoaded(data);
        } catch (err) {
            setError('Failed to load data. Please check the Sheet ID and ensure it is public.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Connect Google Sheet</h2>
            <p className="text-sm text-gray-500">
                Enter the ID of your public Google Sheet to load data.
            </p>

            <div className="space-y-2">
                <label htmlFor="sheetId" className="block text-sm font-medium text-gray-700">
                    Spreadsheet ID
                </label>
                <input
                    id="sheetId"
                    type="text"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                />
            </div>

            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            <button
                onClick={handleConnect}
                disabled={loading || !sheetId.trim()}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Connecting...
                    </>
                ) : (
                    'Connect & Load Data'
                )}
            </button>
        </div>
    );
}
