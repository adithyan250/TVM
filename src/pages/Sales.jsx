import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { Search, Plus, ShoppingCart, Trash2, Printer, User, X, MapPin } from 'lucide-react';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import { API_URL } from '../utils/config';

const Sales = () => {
    const { user } = useAuth();
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Cart State
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [gstRate, setGstRate] = useState(18);

    // Bill Modal State
    const [showBill, setShowBill] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [printFormat, setPrintFormat] = useState('a4'); // 'a4' or 'thermal'

    // Fetch parts for search
    useEffect(() => {
        const fetchParts = async () => {
            setLoading(true);
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                    params: { keyword: searchTerm }
                };
                const { data } = await axios.get(`${API_URL}/parts`, config);
                setParts(data);
            } catch (error) {
                console.error("Error fetching parts:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            if (user) fetchParts();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, user]);

    // Cart Operations
    const addToCart = (part) => {
        const existingItem = cart.find(item => item.part === part._id);

        if (existingItem) {
            if (existingItem.quantity >= part.quantity) {
                alert(`Insufficient stock! Only ${part.quantity} available.`);
                return;
            }
            setCart(cart.map(item =>
                item.part === part._id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            if (part.quantity < 1) {
                alert("Out of stock!");
                return;
            }
            setCart([...cart, {
                part: part._id,
                name: part.name,
                sku: part.sku,
                price: part.price,
                quantity: 1,
                maxStock: part.quantity,
                total: part.price,
                location: part.location // Track location for cart display if needed? No, user asked "while creating sales show the location" - done in search results.
            }]);
        }
    };

    const removeFromCart = (partId) => {
        setCart(cart.filter(item => item.part !== partId));
    };

    const updateQuantity = (partId, newQty) => {
        const item = cart.find(i => i.part === partId);
        if (!item) return;

        if (newQty < 1) {
            removeFromCart(partId);
            return;
        }

        if (newQty > item.maxStock) {
            alert(`Max stock available is ${item.maxStock}`);
            return;
        }

        setCart(cart.map(i =>
            i.part === partId
                ? { ...i, quantity: newQty, total: newQty * i.price }
                : i
        ));
    };

    // Calculations
    const calculateTotals = () => {
        const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
        const gstAmount = (subtotal * gstRate) / 100;
        const grandTotal = subtotal + gstAmount;
        return { subtotal, gstAmount, grandTotal };
    };

    // Checkout
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!customerName.trim()) {
            alert("Please enter a customer name");
            return;
        }

        if (!window.confirm("Confirm checkout? This will deduct stock.")) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const payload = {
                items: cart.map(item => ({
                    part: item.part,
                    quantity: item.quantity
                })),
                customerName,
                gstRate
            };

            const { data } = await axios.post(`${API_URL}/sales`, payload, config);

            // Success
            setLastSale({ ...data, items: cart }); // Use local cart items for easier display names immediately
            setShowBill(true);
            setCart([]);
            setCustomerName('');
            setSearchTerm('');
            setParts([]);

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Checkout failed');
        }
    };

    // Print
    const handlePrint = () => {
        window.print();
    };

    const { subtotal, gstAmount, grandTotal } = calculateTotals();

    return (
        <Layout title="New Sale">
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
                        padding: ${printFormat === 'thermal' ? '5px' : '40px'}; /* More padding for A4 */
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
                    .text-slate-400 { color: #666 !important; }
                    .text-white { color: #000 !important; }
                    .bg-slate-800, .bg-slate-900 { background: none !important; border: 1px solid #ddd !important; }
                }
            `}</style>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
                {/* LEFT: Product Search */}
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Inventory (Name or SKU)..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg shadow-lg"
                        />
                    </div>

                    <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-y-auto p-4 custom-scrollbar">
                        <h3 className="text-slate-400 font-medium mb-4 text-sm uppercase tracking-wider">Available Products</h3>

                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Searching...</div>
                        ) : parts.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                {searchTerm ? 'No products found' : 'Start typing to search products'}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {parts.map(part => (
                                    <div key={part._id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-indigo-500/50 transition-colors group">
                                        <div>
                                            <h4 className="font-medium text-white text-lg">{part.name}</h4>
                                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                                                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">SKU: {part.sku}</span>
                                                <span className="flex items-center gap-1 text-slate-300">
                                                    <MapPin size={14} className="text-indigo-400" />
                                                    Loc: {part.location || 'N/A'}
                                                </span>
                                            </div>
                                            <div className={`mt-1 text-xs ${part.quantity < 5 ? "text-amber-400" : "text-emerald-400"}`}>
                                                Stock: {part.quantity} available
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold text-white">₹{part.price}</span>
                                            <button
                                                onClick={() => addToCart(part)}
                                                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Cart / Checkout */}
                <div className="flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingCart className="text-indigo-400" />
                                Current Sale
                            </h2>
                            <span className="text-slate-400 text-sm">{cart.length} items</span>
                        </div>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Customer Name"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                                <ShoppingCart size={48} className="mb-4" />
                                <p>Cart is empty</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.part} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                                    <div className="flex-1">
                                        <div className="font-medium text-white">{item.name}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-700 p-1">
                                            <button
                                                onClick={() => updateQuantity(item.part, item.quantity - 1)}
                                                className="p-1 hover:text-white text-slate-400 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-white w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.part, item.quantity + 1)}
                                                className="p-1 hover:text-white text-slate-400 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <div className="text-white font-medium">₹{item.total.toFixed(2)}</div>
                                            <div className="text-xs text-slate-500">₹{item.price}/ea</div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.part)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Calculations */}
                    <div className="p-6 bg-slate-900 border-t border-slate-700">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>GST ({gstRate}%)</span>
                                <span>₹{gstAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-white text-xl font-bold pt-4 border-t border-slate-800">
                                <span>Total</span>
                                <span className="text-emerald-400">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
                                ${cart.length === 0
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                }
                            `}
                        >
                            Complete Sale
                        </button>
                    </div>
                </div>
            </div>

            {/* INVOICE MODAL */}
            {showBill && lastSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div id="invoice-modal" className={`bg-white text-black w-full ${printFormat === 'thermal' ? 'max-w-sm' : 'max-w-2xl'} rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300`}>

                        {/* Modal Header (No Print) */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 no-print">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-gray-800">Sale Confirmed</h3>
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
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Printer size={18} /> <span className="hidden sm:inline">Print</span>
                                </button>
                                <button
                                    onClick={() => setShowBill(false)}
                                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
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
                                    <h3 className="font-bold text-gray-800">{lastSale.customerName}</h3>
                                    <p className="text-sm text-gray-500">Guest Customer</p>
                                </div>
                                <div className={printFormat === 'thermal' ? 'text-center' : 'text-right'}>
                                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Invoice Details</p>
                                    <p className="font-mono text-sm text-gray-700">#INV-{lastSale._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">{new Date(lastSale.createdAt).toLocaleDateString()} {new Date(lastSale.createdAt).toLocaleTimeString()}</p>
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
                                    {lastSale.items.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-50">
                                            <td className="py-2 font-medium text-black">
                                                {item.name}
                                                {printFormat === 'thermal' && <div className="text-[10px] text-gray-400 font-mono">@ ₹{item.price}</div>}
                                                {printFormat !== 'thermal' && <div className="text-xs text-gray-400 font-mono">{item.sku}</div>}
                                            </td>
                                            <td className="py-2 text-right">{item.quantity}</td>
                                            {printFormat !== 'thermal' && <td className="py-2 text-right">₹{item.price.toFixed(2)}</td>}
                                            <td className="py-2 text-right font-bold text-black">₹{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end">
                                <div className={`${printFormat === 'thermal' ? 'w-full' : 'w-64'} space-y-2`}>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{lastSale.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>GST ({lastSale.gstRate}%)</span>
                                        <span>₹{lastSale.gstAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                                        <span className="font-bold text-lg text-black">Total</span>
                                        <span className="font-bold text-lg text-black">₹{lastSale.grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                                <p className="font-bold text-black mb-1">Thank you for your business!</p>
                                <p className="text-xs text-gray-400">Returns accepted within 7 days.</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Sales;
