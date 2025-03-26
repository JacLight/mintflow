import React, { useState, useEffect, useRef } from 'react';
import { emojiData } from './emoji-data';

const EmojiPicker = ({ value = '', onSelect = undefined }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [emojis, setEmojis] = useState([]);
    const [selectedEmoji, setSelectedEmoji] = useState<any>(value || null);
    const [recentlyUsed, setRecentlyUsed] = useState([]);

    // Filter emojis based on search term and selected category
    useEffect(() => {
        let filteredEmojis = [];

        if (selectedCategory === 'recent') {
            // Show recently used emojis
            filteredEmojis = recentlyUsed;
        } else if (selectedCategory === 'all') {
            // Get all emojis from all categories
            Object.values(emojiData).forEach(categoryEmojis => {
                filteredEmojis = [...filteredEmojis, ...categoryEmojis];
            });
        } else {
            // Get emojis from selected category
            filteredEmojis = emojiData[selectedCategory] || [];
        }

        // Filter by search term
        if (searchTerm) {
            filteredEmojis = filteredEmojis.filter(emoji =>
                emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setEmojis(filteredEmojis);
    }, [searchTerm, selectedCategory, recentlyUsed]);

    // Add recently used emojis
    useEffect(() => {
        if (selectedCategory === 'recent' && recentlyUsed.length === 0) {
            setSelectedCategory('all');
        }
    }, [selectedCategory, recentlyUsed]);

    const handleEmojiClick = (e, emoji) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedEmoji(emoji);

        if (onSelect) {
            // Pass only the emoji character, not the entire object
            onSelect(emoji.type === 'emoji' ? emoji.emoji : emoji);
        }

        // Add to recently used
        if (!recentlyUsed.some(item => item.emoji === emoji.emoji)) {
            setRecentlyUsed(prev => [emoji, ...prev].slice(0, 16));
        } else {
            // Move to top if already exists
            setRecentlyUsed(prev => [
                emoji,
                ...prev.filter(item => item.emoji !== emoji.emoji)
            ].slice(0, 16));
        }

        // In a real app, you might copy to clipboard or trigger a callback
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header and search */}
            <div className="p-4 bg-gray-100 border-b">
                <h2 className="text-lg font-bold mb-2">Emoji Picker</h2>
                <input
                    type="text"
                    placeholder="Search emojis..."
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Category tabs */}
            <div className="flex overflow-x-auto p-2 bg-gray-50 border-b">
                <button
                    className={`px-3 py-1 mx-1 text-sm rounded-md whitespace-nowrap ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                    onClick={() => setSelectedCategory('all')}
                >
                    All
                </button>
                {Object.keys(emojiData).map((category) => (
                    <button
                        key={category}
                        className={`px-3 py-1 mx-1 text-sm rounded-md capitalize whitespace-nowrap ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'
                            }`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Emoji grid */}
            <div className="p-4 h-64 overflow-y-auto grid grid-cols-8 gap-2">
                {emojis.length > 0 ? (
                    emojis.map((emoji, index) => (
                        <button
                            key={index}
                            className={`text-2xl hover:bg-gray-100 rounded p-1 ${selectedEmoji?.emoji === emoji.emoji ? 'bg-blue-100' : ''
                                }`}
                            onClick={(e) => handleEmojiClick(e, emoji)}
                            title={emoji.name}
                        >
                            {emoji.type === 'emoji' ? (
                                emoji.emoji
                            ) : (
                                <img
                                    src={emoji.emoji}
                                    alt={emoji.name}
                                    className="w-6 h-6 object-contain inline-block"
                                />
                            )}
                        </button>
                    ))
                ) : (
                    <div className="col-span-8 text-center text-gray-500 py-8">
                        No emojis found
                    </div>
                )}
            </div>

            {/* Selected emoji */}
            {selectedEmoji && (
                <div className="p-4 bg-gray-100 border-t flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="text-3xl mr-3">
                            {selectedEmoji.type === 'emoji' ? (
                                selectedEmoji.emoji
                            ) : (
                                <img
                                    src={selectedEmoji.emoji}
                                    alt={selectedEmoji.name}
                                    className="w-8 h-8 object-contain"
                                />
                            )}
                        </div>
                        <div>
                            <p className="font-medium">{selectedEmoji.name}</p>
                            <p className="text-sm text-gray-500">Click to copy (simulated)</p>
                        </div>
                    </div>
                    <button
                        className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
                        onClick={() => setSelectedEmoji(null)}
                        title="Remove selection"
                    >
                        <img
                            src="https://appmint-public.sfo3.cdn.digitaloceanspaces.com/icons/fa6/solid/trash.svg"
                            alt="Remove"
                            className="w-4 h-4"
                        />
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmojiPicker;
