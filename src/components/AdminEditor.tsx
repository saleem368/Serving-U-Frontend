/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { SkeletonBox } from './Skeletons';

type Item = {
  _id: string;
  name: string;
  category?: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  sizes?: string[]; // Add sizes to type
};

type EditableItem = Item & { _replaceFiles?: (File | undefined)[] };

const API_BASE = import.meta.env.VITE_API_BASE

// Helper to get full image URL
const getImageUrl = (image: string) => {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  // Use your backend base URL here
  return `${API_BASE}/api${image}`;
};

// Predefined laundry categories
const LAUNDRY_CATEGORIES = [
  'Normal',
  'Cloths',
  'Dry Clean',
  'Easy Wash',
  'Blanket Wash',
];

const AdminEditor = () => {
  const [section, setSection] = useState<'laundry' | 'unstitched'>('laundry');
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<{ name: string; category: string; price: string; image: string; description?: string; sizes?: string[] }>({
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
    sizes: [],
  });
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [showEditBar, setShowEditBar] = useState<'add' | 'edit' | false>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // For unstitched multi-image upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const endpoint = `${API_BASE}/api/${section}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setItems(data);
    } catch (err: unknown) {
      console.error(`Error fetching ${section} data:`, err);
      setError(`Failed to load ${section} data. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [section]);

  useEffect(() => {
    fetchData();
  }, [section, fetchData]);

  const handleAdd = async () => {
    if (!newItem.name || !newItem.price) {
      setError('Name and price are required');
      return;
    }
    if (section === 'unstitched' && imageFiles.length === 0) {
      setError('Please upload at least one image for unstitched items.');
      return;
    }
    if (section === 'laundry' && !imageFile) {
      setError('Please upload an image for laundry items.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const endpoint = `${API_BASE}/api/${section}`;
      const formData = new FormData();
      formData.append('name', newItem.name);
      if (section === 'laundry') formData.append('category', newItem.category);
      formData.append('price', newItem.price);
      if (section === 'unstitched') {
        formData.append('description', newItem.description || '');
        // Always send sizes, even if empty or not
        formData.append('sizes', (newItem.sizes && newItem.sizes.length > 0)
          ? JSON.stringify(newItem.sizes)
          : JSON.stringify([]));
        imageFiles.forEach((file) => formData.append('images', file));
      } else if (imageFile) {
        formData.append('image', imageFile);
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item');
      }
      await fetchData();
      setNewItem({ name: '', category: '', price: '', image: '', description: '', sizes: [] });
      setImageFile(null);
      setImageFiles([]);
      setImagePreviews([]);
      setShowEditBar(false);
    } catch (err: unknown) {
      console.error('Error adding item:', err);
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message?: string }).message || 'Failed to add item'
          : 'Failed to add item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = `${API_BASE}/api/admin/${section}/${id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }

      await fetchData();
    } catch (err: unknown) {
      console.error('Error deleting item:', err);
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message?: string }).message || 'Failed to delete item'
          : 'Failed to delete item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    setIsLoading(true);
    setError('');

    try {
      const endpoint = `${API_BASE}/api/admin/${section}/${editingItem._id}`;
      let response;
      if (section === 'laundry' && imageFile) {
        // If updating image, use FormData
        const formData = new FormData();
        formData.append('name', editingItem.name);
        formData.append('category', editingItem.category || '');
        formData.append('price', editingItem.price.toString());
        formData.append('image', imageFile);
        response = await fetch(endpoint, {
          method: 'PUT',
          body: formData,
        });
      } else if (section === 'unstitched' && editingItem && editingItem._replaceFiles && editingItem._replaceFiles.some((f: File | undefined) => f)) {
        const formData = new FormData();
        formData.append('name', editingItem.name);
        formData.append('price', editingItem.price.toString());
        formData.append('description', editingItem.description || '');
        if (editingItem.sizes && editingItem.sizes.length > 0) {
          formData.append('sizes', JSON.stringify(editingItem.sizes));
        }
        // Always send the current images array as JSON string
        if (editingItem.images) {
          formData.append('images', JSON.stringify(editingItem.images));
        }
        (editingItem._replaceFiles).forEach((file, idx) => {
          if (file) {
            formData.append('replaceImages', file);
            formData.append('replaceIndexes', idx.toString());
          }
        });
        response = await fetch(endpoint, {
          method: 'PUT',
          body: formData,
        });
      } else if (section === 'unstitched' && imageFiles.length > 0) {
        const formData = new FormData();
        formData.append('name', editingItem.name);
        formData.append('price', editingItem.price.toString());
        formData.append('description', editingItem.description || '');
        if (editingItem.sizes && editingItem.sizes.length > 0) {
          formData.append('sizes', JSON.stringify(editingItem.sizes));
        }
        // Always send the current images array as JSON string
        if (editingItem.images) {
          formData.append('images', JSON.stringify(editingItem.images));
        }
        imageFiles.forEach(file => formData.append('replaceImages', file));
        response = await fetch(endpoint, {
          method: 'PUT',
          body: formData,
        });
      } else {
        // No image update, send JSON
        // For unstitched: if images have been deleted, send the updated images array
        const body = { ...editingItem };
        if (section === 'unstitched' && editingItem.images) {
          body.images = editingItem.images;
        }
        if (section === 'unstitched' && editingItem.sizes) {
          body.sizes = editingItem.sizes;
        }
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item');
      }

      await fetchData();
      setEditingItem(null);
      setShowEditBar(false);
      setImageFile(null);
      setImageFiles([]); // Clear unstitched image selection
      setImagePreviews([]); // Clear unstitched image previews
    } catch (err: unknown) {
      console.error('Error updating item:', err);
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message?: string }).message || 'Failed to update item'
          : 'Failed to update item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 text-center text-blood-red-600 tracking-tight drop-shadow-lg">Admin Panel</h1>

      <div className="mb-6 md:mb-8 flex flex-wrap justify-center gap-2 md:gap-4 relative items-center">
        {['laundry', 'unstitched'].map((type) => (
          <button
            key={type}
            onClick={() => setSection(type as typeof section)}
            className={`px-4 md:px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-blood-red-600/50 text-xs md:text-base flex items-center gap-1
              ${section === type ? 'bg-blood-red-600 text-white border-blood-red-600 scale-105' : 'bg-white text-blood-red-600 border-blood-red-200 hover:bg-blood-red-50 hover:border-blood-red-400'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        <button
          onClick={() => { setShowEditBar('add'); setEditingItem(null); }}
          className={`ml-2 flex items-center justify-center px-3 md:px-4 py-2 rounded-full font-semibold shadow transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-blood-red-600/50 text-xs md:text-base
            ${section === 'laundry' ? 'bg-blood-red-600 text-white border-blood-red-600 scale-105' : 'bg-white text-blood-red-600 border-blood-red-200 hover:bg-blood-red-50 hover:border-blood-red-400'}`}
          style={{ height: '2.25rem', minWidth: '1.25rem', position: 'relative', top: '0', right: '0' }}
          aria-label="Add New Item"
        >
          <span className="text-2xl md:text-3xl font-bold leading-none">+</span>
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow text-center animate-pulse">{error}</div>}
      {isLoading && (
        <div className="mb-4">
          <SkeletonBox className="h-8 w-1/2 mb-4" />
          <SkeletonBox className="h-10 w-full mb-4" />
          <SkeletonBox className="h-10 w-full mb-4" />
          <SkeletonBox className="h-10 w-full" />
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-blood-red-600">{section === 'laundry' ? 'Laundry Items' : 'Unstitched Items'}</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center">No items found.</p>
          ) : (
            <ul className="space-y-3 md:space-y-4">
              {items.map((item) => (
                <li key={item._id} className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-4 md:p-6 rounded-xl shadow border border-blood-red-100 hover:shadow-blood-red-200 transition-shadow">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-0">
                    {/* Show all images for unstitched, or single image for laundry */}
                    {section === 'unstitched' && item.images && item.images.length > 0 ? (
                      <div className="flex space-x-2 overflow-x-auto max-w-xs scrollbar-none">
                        {item.images.map((img, idx) => (
                          <img key={idx} src={getImageUrl(img)} alt={item.name + ' ' + (idx + 1)} className="w-16 h-16 object-cover rounded-xl border border-gray-300" />
                        ))}
                      </div>
                    ) : item.image ? (
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-blood-red-200" />
                    ) : null}
                    <div>
                      <h3 className="font-bold text-base md:text-lg text-blood-red-700">{item.name}</h3>
                      {section === 'laundry' && (
                        <p className="text-gray-600 text-xs md:text-sm">Category: <span className="font-semibold text-blood-red-600">{item.category}</span></p>
                      )}
                      <p className="text-gray-600 text-xs md:text-sm">Price: <span className="font-semibold text-blood-red-600">₹{item.price.toFixed(2)}</span></p>
                      {/* Show sizes for unstitched */}
                      {section === 'unstitched' && item.sizes && item.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.sizes.map((size, idx) => (
                            <span key={idx} className="inline-flex items-center bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold border border-gray-300">{size}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowEditBar('edit');
                      }}
                      className="px-3 md:px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition text-xs md:text-base"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 md:px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition text-xs md:text-base"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add/Edit Item Modal */}
        {(showEditBar === 'add' || (showEditBar === 'edit' && editingItem)) && (section === 'laundry' || section === 'unstitched') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-blood-red-100 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowEditBar(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-blood-red-600">{showEditBar === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {['name', 'price'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      type={field === 'price' ? 'number' : 'text'}
                      value={showEditBar === 'add' ? newItem[field as keyof typeof newItem] : (editingItem as Item)[field as keyof Item]}
                      onChange={(e) => {
                        if (showEditBar === 'add') {
                          setNewItem({ ...newItem, [field]: e.target.value });
                        } else if (editingItem) {
                          setEditingItem({ ...editingItem, [field]: field === 'price' ? parseFloat(e.target.value) : e.target.value });
                        }
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blood-red-200 focus:outline-none"
                    />
                  </div>
                ))}
                {/* Only show category for laundry */}
                {section === 'laundry' && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Category</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={showEditBar === 'add' ? newItem.category : editingItem?.category || ''}
                      onChange={e => {
                        if (showEditBar === 'add') {
                          setNewItem({ ...newItem, category: e.target.value });
                        } else if (editingItem) {
                          setEditingItem({ ...editingItem, category: e.target.value });
                        }
                      }}
                      required
                    >
                      <option value="">Select Category</option>
                      {LAUNDRY_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Description for unstitched only */}
                {section === 'unstitched' && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Description</label>
                    <textarea
                      className="w-full border rounded px-3 py-2 min-h-[60px]"
                      value={showEditBar === 'add' ? newItem.description : editingItem?.description || ''}
                      onChange={e => {
                        if (showEditBar === 'add') {
                          setNewItem({ ...newItem, description: e.target.value });
                        } else if (editingItem) {
                          setEditingItem({ ...editingItem, description: e.target.value });
                        }
                      }}
                      placeholder="Enter a description for this suit (optional)"
                    />
                  </div>
                )}
                {/* Sizes for unstitched only */}
                {section === 'unstitched' && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Sizes (select from below)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['XS','S','M','L','XL','XXL','38','40','42','44','46','48'].map((size) => {
                        const selectedSizes = showEditBar === 'add' ? (newItem.sizes || []) : (editingItem?.sizes || []);
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            className={`px-2 py-1 rounded text-xs font-semibold border transition-all duration-150 ${isSelected ? 'bg-blood-red-600 text-white border-blood-red-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blood-red-50'}`}
                            onClick={() => {
                              if (showEditBar === 'add') {
                                setNewItem({
                                  ...newItem,
                                  sizes: isSelected
                                    ? (newItem.sizes || []).filter((s) => s !== size)
                                    : [...(newItem.sizes || []), size],
                                });
                              } else if (editingItem) {
                                setEditingItem({
                                  ...editingItem,
                                  sizes: isSelected
                                    ? (editingItem.sizes || []).filter((s) => s !== size)
                                    : [...(editingItem.sizes || []), size],
                                });
                              }
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Image upload for laundry and unstitched */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">{section === 'laundry' ? 'Image' : 'Images'}</label>
                  <div className="flex gap-2">
                    {/* Single image upload for laundry */}
                    {section === 'laundry' && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full border rounded px-3 py-2 file:border-0 file:bg-blood-red-600 file:text-white file:rounded-l-md hover:file:bg-blood-red-700 transition-all duration-150"
                        aria-label="Upload image for laundry item"
                      />
                    )}
                    {/* Multi-image upload for unstitched */}
                    {section === 'unstitched' && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              let files = Array.from(e.target.files);
                              if (files.length + imageFiles.length > 5) {
                                alert('You can upload a maximum of 5 images.');
                                files = files.slice(0, 5 - imageFiles.length);
                              }
                              setImageFiles((prev) => {
                                // Prevent exceeding 5 images in total
                                const newFiles = [...prev, ...files].slice(0, 5);
                                return newFiles;
                              });
                            }
                          }}
                          className="w-full border rounded px-3 py-2 file:border-0 file:bg-blood-red-600 file:text-white file:rounded-l-md hover:file:bg-blood-red-700 transition-all duration-150"
                          aria-label="Upload images for unstitched item"
                          disabled={imageFiles.length >= 5}
                        />
                        {/* Preview selected images */}
                        {imageFiles.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto scrollbar-none py-2">
                            {imageFiles.map((file, idx) => (
                              <div key={idx} className="relative w-16 h-16 md:w-20 md:h-20">
                                <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-md border border-blood-red-200" />
                                <button
                                  onClick={() => {
                                    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs font-semibold shadow-md hover:bg-red-700 transition-all duration-150"
                                  aria-label="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {imageFiles.length >= 5 && (
                          <p className="text-xs text-blood-red-600 font-semibold mt-1">Maximum 5 images allowed.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowEditBar(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400 focus:outline-none transition-all duration-150 text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditBar === 'add' ? handleAdd : handleUpdate}
                  className="px-4 py-2 bg-blood-red-600 text-white rounded shadow hover:bg-blood-red-700 focus:outline-none transition-all duration-150 text-xs md:text-sm"
                  disabled={isLoading}
                >
                  {showEditBar === 'add' ? 'Add Item' : 'Update Item'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEditor;
