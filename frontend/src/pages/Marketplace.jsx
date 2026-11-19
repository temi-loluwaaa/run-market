import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import runLogo from '../assets/run-logo.jpg';

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [newItem, setNewItem] = useState({ title: '', description: '', price: '', category: 'Books', image_url: '' });
  const [imagePreview, setImagePreview] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const defaultImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60';

 const API_URL = import.meta.env.VITE_API_URL || 'https://run-market-api.onrender.com';
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Compress and convert selected/captured image to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resize large phone photos for fast database storage
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImagePreview(compressedBase64);
        setNewItem({ ...newItem, image_url: compressedBase64 });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePostItem = async (e) => {
    e.preventDefault();
    if (!token) return alert('Please log in first.');

    const res = await fetch(`${API_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    });

    if (res.ok) {
      setNewItem({ title: '', description: '', price: '', category: 'Books', image_url: '' });
      setImagePreview('');
      fetchItems();
    } else {
      alert('Failed to post item. Image might be too large.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'low-to-high') return a.price - b.price;
      if (sortOrder === 'high-to-low') return b.price - a.price;
      return 0;
    });

  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '234' + cleaned.slice(1);
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <img src={runLogo} alt="RUN Logo" className="h-16 w-auto object-contain" />
          <h1 className="text-3xl font-extrabold text-blue-600">RUN Market</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search items..."
            className="w-full rounded-lg border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="rounded-lg border p-2 text-sm bg-white outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Hostel Gear">Hostel Gear</option>
            <option value="Fashion">Fashion</option>
            <option value="Others">Others</option>
          </select>
          <select
            className="rounded-lg border p-2 text-sm bg-white outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Sort By</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>

        <div>
          {token ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, <strong>{user.name}</strong></span>
              <button onClick={handleLogout} className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 font-medium">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Login
            </button>
          )}
        </div>
      </header>

      {token && (
        <form onSubmit={handlePostItem} className="mb-8 rounded-lg bg-white p-5 shadow border space-y-3 max-w-lg">
          <h3 className="font-semibold text-gray-800 text-lg">List an Item for Sale</h3>
          <input
            type="text"
            placeholder="Item Title"
            className="w-full rounded border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full rounded border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Price (₦)"
              className="w-1/2 rounded border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              required
            />
            <select
              className="w-1/2 rounded border p-2 text-sm outline-none bg-white"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Hostel Gear">Hostel Gear</option>
              <option value="Fashion">Fashion</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Camera & Gallery Upload Controls */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-medium text-gray-600">Item Photo (Optional)</label>
            <div className="flex gap-2">
              {/* Camera Capture Button */}
              <label className="flex-1 cursor-pointer rounded border border-blue-600 bg-blue-50 py-2 text-center text-xs font-semibold text-blue-700 hover:bg-blue-100 transition">
                📷 Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Gallery Upload Button */}
              <label className="flex-1 cursor-pointer rounded border border-gray-300 bg-gray-100 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-200 transition">
                🖼️ Choose from Gallery
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Live Image Preview */}
            {imagePreview && (
              <div className="relative mt-2 inline-block">
                <img src={imagePreview} alt="Preview" className="h-28 w-28 rounded object-cover border" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setNewItem({ ...newItem, image_url: '' });
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white font-bold shadow"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="w-full rounded bg-green-600 py-2 text-sm font-bold text-white hover:bg-green-700 transition">
            Post Item
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="rounded-lg bg-white shadow border overflow-hidden flex flex-col justify-between">
              <div>
                <img
                  src={item.image_url || defaultImage}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = defaultImage; }}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                    {item.category && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 my-1 line-clamp-2">{item.description}</p>
                  <p className="text-xl font-extrabold text-green-600 mt-2">₦{item.price}</p>
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-between text-xs text-gray-500 bg-gray-50">
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(item.seller_phone)}?text=Hi%20${encodeURIComponent(item.seller_name)},%20I'm%20interested%20in%20buying%20your%20${encodeURIComponent(item.title)}%20on%20RUN%20Market.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-green-500 px-3 py-1.5 font-bold text-white hover:bg-green-600 flex items-center gap-1"
                >
                  💬 Chat Seller
                </a>
                {user && user.id === item.user_id && (
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to delete this item?')) return;
                      const res = await fetch(`${API_URL}/api/items/${item.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) fetchItems();
                    }}
                    className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700 font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No items found.
          </div>
        )}
      </div>
    </div>
  );
}