import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { Calendar, MapPin, DollarSign, Users, FileText, Hotel } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    price_per_night: '',
    check_in_date: '',
    check_out_date: '',
    guests_count: 1,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.title || !formData.location || !formData.price_per_night) {
      toast.error('Заполните все обязательные поля');
      return false;
    }

    if (!formData.check_in_date || !formData.check_out_date) {
      toast.error('Укажите даты заезда и выезда');
      return false;
    }

    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);

    if (checkIn >= checkOut) {
      toast.error('Дата выезда должна быть позже даты заезда');
      return false;
    }

    if (checkIn < new Date()) {
      toast.error('Дата заезда не может быть в прошлом');
      return false;
    }

    if (formData.price_per_night <= 0) {
      toast.error('Цена должна быть больше 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        guests_count: parseInt(formData.guests_count),
        check_in_date: new Date(formData.check_in_date).toISOString(),
        check_out_date: new Date(formData.check_out_date).toISOString(),
      };

      await bookingsAPI.create(dataToSend);
      toast.success('Бронирование успешно создано');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка при создании бронирования');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Создание бронирования</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название отеля *
            </label>
            <div className="relative">
              <Hotel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например: Grand Hotel Moscow"
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Локация *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Город, улица, метро"
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Опишите особенности отеля, удобства, условия проживания..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена за ночь (₽) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="price_per_night"
                  value={formData.price_per_night}
                  onChange={handleChange}
                  placeholder="5000"
                  min="0"
                  step="1"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество гостей
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="guests_count"
                  value={formData.guests_count}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата заезда *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="check_in_date"
                  value={formData.check_in_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата выезда *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="check_out_date"
                  value={formData.check_out_date}
                  onChange={handleChange}
                  min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать бронирование'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBooking;