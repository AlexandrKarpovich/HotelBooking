import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { Sparkles, MapPin, DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await bookingsAPI.getRecommendations(10);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Не удалось загрузить рекомендации');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      await bookingsAPI.trackView(id);
      toast.success('Информация сохранена для улучшения рекомендаций');
    } catch (error) {
      console.error('Error tracking view:', error);
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
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Персональные рекомендации</h1>
        </div>
        <p className="text-gray-600 ml-11">
          Основаны на ваших просмотрах и предпочтениях
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет рекомендаций</h3>
          <p className="text-gray-600">
            Посмотрите больше отелей, чтобы получить персонализированные предложения
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 flex items-center justify-center">
                  <Hotel className="w-16 h-16 text-white opacity-50" />
                </div>
                {index === 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    Топ recommendation
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{rec.title}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{rec.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{rec.price_per_night} ₽ / ночь</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {rec.description || 'Нет описания'}
                </p>

                <button
                  onClick={() => handleView(rec.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Добавьте импорт Hotel в начале файла
const Hotel = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default Recommendations;