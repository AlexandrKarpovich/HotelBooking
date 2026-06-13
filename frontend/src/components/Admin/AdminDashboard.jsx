import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Shield, Users, BookOpen, DollarSign, TrendingUp, MapPin, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, bookingsRes, statsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllBookings(),
        adminAPI.getStatistics(),
      ]);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await adminAPI.changeRole(userId, role);
      toast.success('Роль изменена');
      loadData();
    } catch (error) {
      toast.error('Ошибка изменения роли');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await adminAPI.blockUser(userId);
      toast.success('Пользователь заблокирован');
      loadData();
    } catch (error) {
      toast.error('Ошибка блокировки');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminAPI.unblockUser(userId);
      toast.success('Пользователь разблокирован');
      loadData();
    } catch (error) {
      toast.error('Ошибка разблокировки');
    }
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
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Админ панель</h1>
        </div>
        <p className="text-gray-600 ml-11">Управление пользователями и бронированиями</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{statistics.total_users || 0}</span>
            </div>
            <p className="text-gray-600">Всего пользователей</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{statistics.total_bookings || 0}</span>
            </div>
            <p className="text-gray-600">Всего бронирований</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">{statistics.confirmed_bookings || 0}</span>
            </div>
            <p className="text-gray-600">Подтвержденных</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {(statistics.total_revenue || 0).toLocaleString()} ₽
              </span>
            </div>
            <p className="text-gray-600">Общий доход</p>
          </div>
        </div>
      )}

      {/* Top Locations */}
      {statistics?.top_locations && statistics.top_locations.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Топ локации
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {statistics.top_locations.map((loc, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{loc.location}</span>
                <span className="text-blue-600 font-semibold">{loc.count} бронирований</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Пользователи
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.first_name} {user.last_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">Пользователь</option>
                      <option value="manager">Менеджер</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.is_blocked ? 'Заблокирован' : 'Активен'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {user.is_blocked ? (
                        <button
                          onClick={() => handleUnblockUser(user.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Разблокировать"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Заблокировать"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;