// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { LogIn, Mail, Lock } from 'lucide-react';
// import toast from 'react-hot-toast';
//
// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//   });
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await login(formData.username, formData.password);
//       navigate('/');
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'Ошибка при входе');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//             <LogIn className="w-8 h-8 text-blue-600" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900">Добро пожаловать</h2>
//           <p className="text-gray-600 mt-2">Войдите в свой аккаунт</p>
//         </div>
//
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Имя пользователя
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 value={formData.username}
//                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                 className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>
//           </div>
//
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Пароль
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>
//           </div>
//
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//           >
//             {loading ? 'Вход...' : 'Войти'}
//           </button>
//         </form>
//
//         <p className="text-center mt-6 text-gray-600">
//           Нет аккаунта?{' '}
//           <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
//             Зарегистрироваться
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };
//
// export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Добро пожаловать</h2>
          <p className="text-gray-600">Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;