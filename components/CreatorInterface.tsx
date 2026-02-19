
import React from 'react';
import { Icons } from '../constants';
import { ActiveUser } from '../types';

interface CreatorInterfaceProps {
  activeUsers: ActiveUser[];
}

const CreatorInterface: React.FC<CreatorInterfaceProps> = ({ activeUsers }) => {
  return (
    <div className="p-8 h-full overflow-y-auto max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-outfit font-bold text-rose-500 flex items-center gap-3">
            <Icons.Shield /> Creator Command Center
          </h2>
          <p className="text-gray-400 mt-2">Monitoring active sessions and system telemetry.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl border-rose-500/20">
            <p className="text-[10px] uppercase font-bold text-gray-500">Live Traffic</p>
            <p className="text-2xl font-bold font-outfit">{activeUsers.length}</p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border-indigo-500/20">
            <p className="text-[10px] uppercase font-bold text-gray-500">API Health</p>
            <p className="text-2xl font-bold font-outfit text-emerald-400">Stable</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Users List */}
        <div className="lg:col-span-2 glass rounded-[32px] border-white/5 p-6 space-y-6">
          <h3 className="font-bold font-outfit text-xl">Active Connections</h3>
          <div className="space-y-4">
            {activeUsers.length === 0 ? (
              <p className="text-gray-600 italic">No users currently connected.</p>
            ) : (
              activeUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-200">{user.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{user.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase">{user.lastAction}</p>
                    <p className="text-[10px] text-gray-600">{new Date(user.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Logs */}
        <div className="glass rounded-[32px] border-white/5 p-6 flex flex-col h-[500px]">
          <h3 className="font-bold font-outfit text-xl mb-4">Kernel Logs</h3>
          <div className="flex-1 bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-emerald-500/80 overflow-y-auto space-y-1">
            <p>[SYSTEM] Lumina Kernel 1.2.4 loaded.</p>
            <p>[NET] Listening on public relay server...</p>
            <p className="text-indigo-400">[AUTH] Creator privileges escalated.</p>
            {activeUsers.map(u => (
              <p key={u.id}>[CONN] Incoming session: {u.name} ({u.id.substring(0, 8)})</p>
            ))}
            <p>[SEC] End-to-end encryption heartbeat: OK</p>
            <p>[GEMINI] Synchronizing model 3.0-flash-preview...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorInterface;
