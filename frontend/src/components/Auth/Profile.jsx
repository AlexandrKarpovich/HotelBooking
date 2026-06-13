import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Badge, Key, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, changePassword } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Новые пароли не совпадают');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordData.current_password, passwordData.new_password);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      default: return 'Пользователь';
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Профиль пользователя</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">
                {user.first_name?.[0] || user.username?.[0]}
              </span>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
              <p className="text-blue-100">@{user.username}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleColor(user.role)}`}>
                {getRoleText(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pb-3 border-b">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Имя пользователя</p>
                <p className="text-gray-900">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pb-3 border-b">
              <Badge className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Полное имя</p>
                <p className="text-gray-900">{user.first_name} {user.last_name}</p>
              </div>
            </div>

            {user.created_at && (
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Дата регистрации</p>
                  <p className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>Сменить пароль</span>
            </button>
          </div>

          {/* Change Password Form */}
          {showPasswordForm && (
            <form onSubmit={handleSubmitPassword} className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Смена пароля</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текущий пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Подтверждение пароля
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

