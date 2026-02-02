import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Search, Calendar, Filter, FileText, ChevronRight, Printer, X } from 'lucide-react';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import { API_URL } from '../utils/config';

const SalesHistory = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Invoice State
    const [selectedSale, setSelectedSale] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [printFormat, setPrintFormat] = useState('a4'); // 'a4' or 'thermal'

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get(`${API_URL}/sales`, config);
                setSales(data);
            } catch (error) {
                console.error("Error fetching sales:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSales();
    }, [user]);

    const handleViewInvoice = (sale) => {
        setSelectedSale(sale);
        setShowInvoice(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredSales = sales.filter(sale => {
        const matchesSearch =
            sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale._id.includes(searchTerm);

        const matchesDate = filterDate ? new Date(sale.createdAt).toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true;

        return matchesSearch && matchesDate;
    });

    return (
        <Layout title="Sales History">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: ${printFormat === 'thermal' ? '80mm auto' : 'A4'};
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #invoice-modal, #invoice-modal * {
                        visibility: visible;
                    }
                    #invoice-modal {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100vw !important;
                        max-width: none !important;
                        min-height: 100vh;
                        background: white;
                        color: black;
                        z-index: 9999;
                        padding: ${printFormat === 'thermal' ? '5px' : '40px'};
                        font-size: ${printFormat === 'thermal' ? '12px' : '14px'};
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Thermal Specifics */
                    ${printFormat === 'thermal' ? `
                        .invoice-container { padding: 0 !important; width: 100% !important; }
                        h1 { font-size: 18px !important; margin-bottom: 5px !important; }
                        h3 { font-size: 14px !important; }
                        .text-sm { font-size: 10px !important; }
                        .text-xs { font-size: 9px !important; }
                        td, th { padding: 2px 0 !important; }
                    ` : `
                        /* A4 Specifics */
                        .invoice-container { padding: 0 !important; width: 100% !important; max-width: none !important; }
                        h1 { font-size: 32px !important; }
                        td, th { padding: 12px 0 !important; }
                    `}
                    .text-slate-400 {
                        color: #666 !important;
                    }
                    .text-white {
                        color: #000 !important;
                    }
                    .bg-slate-800, .bg-slate-900 {
                        background: none !important;
                        border: 1px solid #ddd !important;
                    }
                }
            `}</style>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search customer or ID..."
                        className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl w-full"
                    />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="date"
                            className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl focus:outline-none focus:border-indigo-500"
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors font-medium">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Date</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Invoice ID</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Customer</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Items</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Total</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Status</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading history...</td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">No sales found matching your criteria.</td></tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-6 py-4 text-slate-300 text-sm">
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                            <span className="text-slate-500 text-xs block">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{sale._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4 font-medium text-white">{sale.customerName}</td>
                                        <td className="px-6 py-4 text-slate-300">{sale.items.length} items</td>
                                        <td className="px-6 py-4 text-emerald-400 font-bold">${sale.grandTotal.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Completed</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewInvoice(sale)}
                                                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium ml-auto cursor-pointer"
                                            >
                                                View <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INVOICE MODAL */}
            {showInvoice && selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div id="invoice-modal" className={`bg-white text-black w-full ${printFormat === 'thermal' ? 'max-w-sm' : 'max-w-2xl'} rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300`}>

                        {/* Modal Header (No Print) */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 no-print">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-gray-800">Invoice Details</h3>
                                <div className="flex bg-gray-200 rounded-lg p-1 text-xs font-medium">
                                    <button
                                        className={`px-3 py-1 rounded-md transition-all ${printFormat === 'a4' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        onClick={() => setPrintFormat('a4')}
                                    >
                                        A4
                                    </button>
                                    <button
                                        className={`px-3 py-1 rounded-md transition-all ${printFormat === 'thermal' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                                        onClick={() => setPrintFormat('thermal')}
                                    >
                                        Thermal
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                                >
                                    <Printer size={18} /> <span className="hidden sm:inline">Print</span>
                                </button>
                                <button
                                    onClick={() => setShowInvoice(false)}
                                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Invoice Content */}
                        <div className={`overflow-y-auto flex-1 bg-white invoice-container ${printFormat === 'thermal' ? 'p-4' : 'p-10'}`}>
                            <div className="text-center mb-6">
                                <h1 className={`font-bold tracking-tight text-gray-900 mb-1 ${printFormat === 'thermal' ? 'text-xl' : 'text-3xl'}`}>T V M Auto Spare</h1>
                                <p className="text-gray-500 text-sm">Automotive Parts & Accessories</p>
                                <p className="text-gray-500 text-sm">123 Motor Way, Speed City</p>
                                <p className="text-gray-500 text-sm">Phone: +1 234 567 890</p>
                            </div>

                            <div className={`flex justify-between mb-6 pb-6 border-b border-gray-100 ${printFormat === 'thermal' ? 'flex-col gap-4 text-center' : ''}`}>
                                <div>
                                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Bill To</p>
                                    <h3 className="font-bold text-gray-800">{selectedSale.customerName}</h3>
                                    <p className="text-sm text-gray-500">Guest Customer</p>
                                </div>
                                <div className={printFormat === 'thermal' ? 'text-center' : 'text-right'}>
                                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Invoice Details</p>
                                    <p className="font-mono text-sm text-gray-700">#INV-{selectedSale._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">{new Date(selectedSale.createdAt).toLocaleDateString()} {new Date(selectedSale.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>

                            <table className="w-full mb-6">
                                <thead>
                                    <tr className="text-left text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
                                        <th className="pb-2 text-black">Item</th>
                                        <th className="pb-2 text-right text-black">Qty</th>
                                        {printFormat !== 'thermal' && <th className="pb-2 text-right text-black">Price</th>}
                                        <th className="pb-2 text-right text-black">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {selectedSale.items.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-50">
                                            <td className="py-2 font-medium text-black">
                                                {item.name}
                                                {printFormat === 'thermal' && <div className="text-[10px] text-gray-400 font-mono">@{item.price}</div>}
                                                {printFormat !== 'thermal' && <div className="text-xs text-gray-400 font-mono">{item.sku}</div>}
                                            </td>
                                            <td className="py-2 text-right">{item.quantity}</td>
                                            {printFormat !== 'thermal' && <td className="py-2 text-right">${item.price.toFixed(2)}</td>}
                                            <td className="py-2 text-right font-bold text-black">${item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end">
                                <div className={`${printFormat === 'thermal' ? 'w-full' : 'w-64'} space-y-2`}>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${selectedSale.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>GST ({selectedSale.gstRate}%)</span>
                                        <span>${selectedSale.gstAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                                        <span className="font-bold text-lg text-black">Total</span>
                                        <span className="font-bold text-lg text-black">${selectedSale.grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                                <p className="font-bold text-black mb-1">Thank you for your business!</p>
                                <p className="text-xs text-gray-400">Returns accepted within 7 days.</p>
                            </div>
                        </div>

                    </div>
                </div>)}
        </Layout>
    );
};

export default SalesHistory;
