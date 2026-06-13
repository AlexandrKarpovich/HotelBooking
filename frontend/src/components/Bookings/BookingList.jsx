import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Users, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isManager, isAdmin } = useAuth();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки бронирований');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await bookingsAPI.confirm(id);
      toast.success('Бронирование подтверждено');
      loadBookings();
    } catch (error) {
      toast.error('Ошибка подтверждения');
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingsAPI.cancel(id);
      toast.success('Бронирование отменено');
      loadBookings();
    } catch (error) {
      toast.error('Ошибка отмены');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Подтверждено' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Ожидает' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Отменено' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Мои бронирования</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">У вас пока нет бронирований</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{booking.title}</h3>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{booking.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{booking.guests_count} гостей</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{booking.price_per_night} ₽ / ночь</span>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm"
                    >
                      Подтвердить
                    </button>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 text-sm"
                    >
                      Отменить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;