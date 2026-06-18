'use client'

import { useState } from 'react'

interface LeaderboardTabsProps {
  globalUsers: any[]
  friendUsers?: any[]
}

export default function LeaderboardTabs({ globalUsers, friendUsers = [] }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState('global')

  return (
    <>
      <div className="flex gap-6 border-b border-gray-800 mb-6">
        <button
          className={`pb-3 text-sm font-bold transition-all ${
            activeTab === 'global'
              ? 'text-white border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('global')}
        >
          🌍 Global
        </button>
        <button
          className={`pb-3 text-sm font-bold transition-all ${
            activeTab === 'friends'
              ? 'text-white border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('friends')}
        >
          👥 Venner
        </button>
      </div>

      <div className="space-y-2">
        {activeTab === 'global'
          ? globalUsers.map((user, index) => (
              <div
                key={user.id}
                className="slide-in bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold text-lg w-8">#{index + 4}</span>
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {(user.display_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white font-medium">{user.display_name || 'Ukendt'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold">{user.total_points || 0} point</span>
                </div>
              </div>
            ))
          : friendUsers.length > 0
          ? friendUsers.map((user, index) => (
              <div
                key={user.id}
                className="slide-in bg-[#1a1a2e]/80 backdrop-blur-md rounded-xl p-4 border border-[#2a2a3e] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold text-lg w-8">#{index + 1}</span>
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {(user.display_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white font-medium">{user.display_name || 'Ukendt'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold">{user.total_points || 0} point</span>
                </div>
              </div>
            ))
          : (
              <p className="text-gray-400 text-center py-8">Du har ingen venner endnu. Tilføj venner på profilen!</p>
            )}
      </div>
    </>
  )
}