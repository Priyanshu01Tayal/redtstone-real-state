import React, { useState } from 'react';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-[#C62828] hover:bg-red-50 rounded-full transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C62828] text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-[#EEEEEE] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-4 py-3 bg-[#F8F8F8]">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-[#222222]">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-[#FFEBEE] text-[#C62828] text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#C62828] hover:underline font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#EEEEEE]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-[#777777] text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 15).map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3 ${
                      !notif.isRead ? 'bg-[#FFEBEE]/30' : ''
                    }`}
                  >
                    <div
                      className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        !notif.isRead ? 'bg-[#C62828]' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#222222]">{notif.title}</p>
                      <p className="text-xs text-[#777777] mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
