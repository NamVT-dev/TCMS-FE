import React from 'react';
import { X, Clock, Calendar } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 flex justify-between items-start">
          <h3 className="text-lg font-bold text-white pr-8 leading-snug">
            {notification.title}
          </h3>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 bg-white/10 rounded-full hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(notification.createAt).split('lúc')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(notification.createAt).split('lúc')[1] || formatDate(notification.createAt)}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
              notification.type === 'system' ? 'bg-blue-100 text-blue-600' :
              notification.type === 'promo' ? 'bg-pink-100 text-pink-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {notification.type || 'Thông báo'}
            </span>
          </div>

          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {notification.body}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;