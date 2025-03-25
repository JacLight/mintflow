import React from 'react';
import { Icon } from './icons';
import { getRandomNumber } from '@/src/lib/utils';

const MusicPlayer = () => {
    const favorites = [
        {
            title: "Blond",
            artist: "Frank Ocean",
            cover: 'https://picsum.photos/200/200?random=' + getRandomNumber(1, 100)
        },
        {
            title: "Konoyo",
            artist: "Tim Hecker",
            cover: 'https://picsum.photos/200/200?random=' + getRandomNumber(1, 100)
        },
        {
            title: "Los Angeles",
            artist: "Flying Lotus",
            cover: 'https://picsum.photos/200/200?random=' + getRandomNumber(1, 100)
        },
        {
            title: "The Fragile",
            artist: "Nine Inch Nails",
            cover: 'https://picsum.photos/200/200?random=' + getRandomNumber(1, 100)
        },
        {
            title: "Sketches of Spain",
            artist: "Miles Davis",
            cover: 'https://picsum.photos/200/200?random=' + getRandomNumber(1, 100)
        }
    ];

    const playlists = [
        {
            title: "Rebellious '90s and '00s",
            description: "Throwback to the teenage years",
            covers: ['https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100)]
        },
        {
            title: "Soft Rock",
            description: "Songs you can't go wrong with",
            covers: ['https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100)]
        },
        {
            title: "Trip-Hop Essentials",
            description: "Dark and moody grooves",
            covers: ['https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100)]
        },
        {
            title: "Vintage Jazz",
            description: "Travel through the times",
            covers: ['https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100)]
        },
        {
            title: "Funk Up",
            description: "Irresistible beats",
            covers: ['https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100), 'https://picsum.photos/100/100?random=' + getRandomNumber(1, 100)]
        }
    ];

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            {/* Search Bar */}
            <div className="mb-8 flex items-center">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full max-w-md px-4 py-2 rounded-full bg-white shadow-sm"
                />
            </div>

            {/* Your Favorites Section */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Your favorites</h2>
                    <button className="text-red-500">Show all</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {favorites.map((item, index) => (
                        <div key={index} className="bg-gray-200 rounded-lg p-4 hover:bg-gray-300 transition-colors">
                            <img
                                src={item.cover}
                                alt={item.title}
                                className="w-full aspect-square object-cover rounded-lg mb-3"
                            />
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.artist}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Made for You Section */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Made for you</h2>
                    <button className="text-red-500">Show all</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {playlists.map((playlist, index) => (
                        <div key={index} className="bg-gray-200 rounded-lg p-4 hover:bg-gray-300 transition-colors">
                            <div className="grid grid-cols-2 gap-1 mb-3">
                                {playlist.covers.map((cover, i) => (
                                    <img
                                        key={i}
                                        src={cover}
                                        alt=""
                                        className="w-full aspect-square object-cover"
                                    />
                                ))}
                            </div>
                            <h3 className="font-semibold">{playlist.title}</h3>
                            <p className="text-gray-600 text-sm">{playlist.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Player Bar */}
            <div className="absolute bottom-10 left-0 right-0 border-t w-full">
                <div className="w-[90%] mx-auto px-3 py-3 flex items-center justify-between rounded-full bg-white/60 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <button className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full" title='Play'>
                            <Icon name='FaPlay' className="w-6 h-6" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full" title='Shuffle'>
                            <Icon name='FaShuffle' className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full" title='Repeat'>
                            <Icon name='RiLoopRightLine' className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4 w-full max-w-md mt-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full" title='Skip Back'>
                            <Icon name='FaBackward' className="w-5 h-5" />
                        </button>
                        <img
                            src={'https://picsum.photos/48/48?random=' + getRandomNumber(1, 100)}
                            alt="Now playing"
                            className="w-12 h-12 rounded shrink-0"
                        />
                        <div className="w-full">
                            <div>
                                <h4 className="font-medium text-sm">Nightclubbing</h4>
                                <p className="text-xs text-gray-600">Iggy Pop - The Idiot</p>
                            </div>
                            <div className="flex items-center space-x-2 w-full">
                                <span className="text-sm text-gray-500">0:58</span>
                                <div className="flex-1 h-1 bg-gray-200 rounded-full">
                                    <div className="w-1/4 h-full bg-gray-600 rounded-full"></div>
                                </div>
                                <span className="text-sm text-gray-500">4:16</span>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full" title='Skip Forward'>
                            <Icon name='FaForward' className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Icon name='BiVolume' className="w-5 h-5" />
                        <div className="w-24 h-1 bg-gray-200 rounded-full">
                            <div className="w-2/3 h-full bg-gray-600 rounded-full"></div>
                        </div>
                        <Icon name='BiVolumeFull' className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;