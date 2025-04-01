'use client';
import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Member, getAllMembers } from '@/lib/admin-service';

interface MembersComponentProps {
    initialMembers?: Member[];
}

const MembersComponent = ({ initialMembers }: MembersComponentProps) => {
    const [members, setMembers] = useState<Member[]>(initialMembers || []);
    const [isLoading, setIsLoading] = useState(!initialMembers);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If initialMembers is provided, we don't need to fetch data
        if (initialMembers) {
            return;
        }

        const fetchMembers = async () => {
            try {
                setIsLoading(true);
                // Use the admin-service function instead of direct fetch
                const data = await getAllMembers();
                setMembers(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching members data:', err);
                setError('Failed to load members data. Please try again later.');
                // Fallback to empty array instead of mock data
                setMembers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [initialMembers]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Sidebar is assumed to be in a parent layout component */}

            <div className="p-6 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">
                        Members <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">{members.length}</span>
                    </h1>
                    <button className="flex items-center px-4 py-2 bg-black text-white rounded-md">
                        <Plus className="w-4 h-4 mr-2" /> Invite
                    </button>
                </div>

                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-8">Loading members data...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8">No members found. Invite team members to get started.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">NAME</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">EMAIL</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">ROLE</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => (
                                    <tr key={member.id} className="border-t">
                                        <td className="py-3 px-4">{member.name}</td>
                                        <td className="py-3 px-4">{member.email}</td>
                                        <td className="py-3 px-4">{member.role}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                className="text-gray-500 hover:text-gray-700"
                                                aria-label={`View details for ${member.name}`}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembersComponent;
