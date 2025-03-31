

export const InviteBox = () => {
    const teamMembers = [
        { name: 'Emma Smith', email: 'emma.smith@example.com' },
        { name: 'Alex Chen', email: 'alex.chen@example.com' },
        { name: 'Sarah Jones', email: 'sarah.jones@example.com' },
        { name: 'David Kim', email: 'david.kim@example.com' }
    ];
    return (
        <div className="space-y-8">
            {/* Team Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Your team</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="flex-1 p-2 border rounded-md"
                        />
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                            Invite
                        </button>
                    </div>
                    <div className="space-y-3">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                <div>
                                    <div className="text-sm font-medium">{member.name}</div>
                                    <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}