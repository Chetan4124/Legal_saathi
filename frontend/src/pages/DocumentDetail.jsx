import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/documents/${id}/`);
        setDoc(data);
      } catch {
        toast.error('Document not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleRetryOCR = async () => {
    setRetrying(true);
    try {
      const { data } = await api.post(`/ocr/retry/${id}/`);
      setDoc((prev) => ({ ...prev, status: data.status, extracted_text: data.extracted_text }));
      toast.success('OCR retry initiated');
    } catch {
      toast.error('OCR retry failed');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">← Back</Link>
          <h1 className="text-lg font-semibold">{doc.title}</h1>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold capitalize">{doc.status}</p>
          </div>
          {doc.status === 'failed' && (
            <button onClick={handleRetryOCR} disabled={retrying}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50">
              {retrying ? 'Retrying...' : 'Retry OCR'}
            </button>
          )}
          {doc.status === 'completed' && (
            <Link to={`/chat/${doc.id}`}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700">
              💬 Chat with AI
            </Link>
          )}
        </div>

        {/* Extracted Text */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-700">📄 Extracted Text</h2>
          {doc.extracted_text ? (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{doc.extracted_text}</pre>
          ) : (
            <p className="text-sm italic text-gray-400">
              {doc.status === 'processing' ? 'OCR is still processing...' : 'No text extracted yet.'}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}