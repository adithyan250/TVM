import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { Plus, Search, Filter, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';
import useAuth from '../utils/useAuth';
import { API_URL } from '../utils/config';

const Inventory = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        quantity: 0,
        price: 0,
        minStockLevel: 5,
        location: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Fetch parts
    const fetchParts = async (keyword = '') => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                params: {
                    keyword
                }
            };
            const { data } = await axios.get(`${API_URL}/parts`, config);
            setParts(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchParts(searchTerm);
        }
    }, [user, searchTerm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (part) => {
        setFormData({
            name: part.name,
            sku: part.sku,
            category: part.category,
            quantity: part.quantity,
            price: part.price,
            minStockLevel: part.minStockLevel,
            location: part.location || ''
        });
        setEditingId(part._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.delete(`${API_URL}/parts/${id}`, config);
                fetchParts(searchTerm);
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Error deleting part');
            }
        }
    };

    const openModal = () => {
        setEditingId(null);
        // Persist category if available, clear others
        setFormData(prev => ({
            name: '',
            sku: '',
            category: prev.category,
            quantity: 0,
            price: 0,
            minStockLevel: 5,
            location: ''
        }));
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
            };

            if (editingId) {
                await axios.put(`${API_URL}/parts/${editingId}`, formData, config);
            } else {
                await axios.post(`${API_URL}/parts`, formData, config);
            }

            setIsModalOpen(false);
            // Clear form but keep category
            setFormData(prev => ({
                name: '',
                sku: '',
                category: prev.category,
                quantity: 0,
                price: 0,
                minStockLevel: 5,
                location: ''
            }));
            fetchParts(searchTerm);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    return (
        <Layout title="Inventory Management">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Part' : 'Add New Part'}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Part Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">SKU</label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            list="category-options"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                                            required
                                        />
                                        <datalist id="category-options">
                                            {[...new Set(parts.map(part => part.category))].map((cat, index) => (
                                                <option key={index} value={cat} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Location (e.g. A1)</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                                            placeholder="A1, B2..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Min. Level</label>
                                        <input
                                            type="number"
                                            name="minStockLevel"
                                            value={formData.minStockLevel}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer mt-4">
                                    {editingId ? 'Update Part' : 'Save Part'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search parts by name or SKU..."
                        className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl w-full"
                    />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors font-medium">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button
                        onClick={openModal}
                        className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer font-medium"
                    >
                        <Plus size={18} />
                        Add New Part
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Name</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">SKU</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Category</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Location</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Quantity</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Price</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">Status</th>
                                <th className="px-6 py-4 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500">Loading inventory...</td></tr>
                            ) : parts.length === 0 ? (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500">No parts found. Add one to get started.</td></tr>
                            ) : (
                                parts.filter(part => {
                                    const params = new URLSearchParams(location.search);
                                    if (params.get('filter') === 'low_stock') {
                                        return part.quantity <= (part.minStockLevel || 5);
                                    }
                                    return true;
                                }).map((part) => (
                                    <tr key={part._id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{part.name}</td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{part.sku}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-slate-700/50 border border-slate-600/50 text-xs font-medium text-slate-300">{part.category}</span></td>
                                        <td className="px-6 py-4 text-slate-300 font-mono text-xs">{part.location || '-'}</td>
                                        <td className="px-6 py-4 font-medium text-slate-200">{part.quantity}</td>
                                        <td className="px-6 py-4 text-emerald-400 font-medium">₹{part.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {part.quantity <= part.minStockLevel ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/10">Low Stock</span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">In Stock</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(part)}
                                                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(part._id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Inventory;
