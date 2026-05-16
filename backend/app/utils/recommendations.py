import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..models import Booking, UserView

class RecommendationEngine:
    """Рекомендательная система на основе контента"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _get_booking_features(self, booking: Booking) -> str:
        """Извлечение признаков из бронирования для векторизации"""
        features = f"{booking.location} {booking.title} {booking.description or ''}"
        return features.lower()
    
    def _build_similarity_matrix(self, bookings: List[Booking]) -> np.ndarray:
        """Построение матрицы схожести между бронированиями"""
        if len(bookings) < 2:
            return np.array([[1.0]])
        
        features = [self._get_booking_features(b) for b in bookings]
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(features)
        
        similarity_matrix = cosine_similarity(tfidf_matrix)
        
        return similarity_matrix
    
    def get_recommendations_for_user(self, user_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Получение рекомендаций для пользователя на основе просмотров"""
        
        user_views = self.db.query(UserView).filter(
            UserView.user_id == user_id
        ).order_by(UserView.view_count.desc()).all()
        
        if not user_views:
            return self._get_popular_bookings(limit)
        
        viewed_booking_ids = [uv.booking_id for uv in user_views]
        
        all_bookings = self.db.query(Booking).filter(
            Booking.id.notin_(viewed_booking_ids),
            Booking.status.in_(['pending', 'confirmed', 'completed'])
        ).all()
        
        if not all_bookings:
            return []
        
        viewed_bookings = self.db.query(Booking).filter(
            Booking.id.in_(viewed_booking_ids)
        ).all()
        
        all_for_similarity = viewed_bookings + all_bookings
        similarity_matrix = self._build_similarity_matrix(all_for_similarity)
        
        n_viewed = len(viewed_bookings)
        if n_viewed == 0:
            return self._get_popular_bookings(limit)
        
        view_weights = {}
        for uv in user_views:
            view_weights[uv.booking_id] = min(uv.view_count, 10)
        
        scores = []
        for i, booking in enumerate(all_bookings):
            score = 0
            for j, viewed_booking in enumerate(viewed_bookings):
                similarity = similarity_matrix[j][n_viewed + i]
                weight = view_weights.get(viewed_booking.id, 1)
                score += similarity * weight
            scores.append(score / n_viewed)
        
        recommendations = sorted(
            zip(all_bookings, scores),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        result = []
        for booking, score in recommendations:
            result.append({
                "id": booking.id,
                "title": booking.title,
                "location": booking.location,
                "price_per_night": booking.price_per_night,
                "description": booking.description,
                "similarity_score": float(score),
                "reason": self._get_recommendation_reason(booking, viewed_bookings)
            })
        
        return result
    
    def _get_popular_bookings(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Получение самых популярных бронирований"""
        popular = self.db.query(
            Booking.id,
            Booking.title,
            Booking.location,
            Booking.price_per_night,
            Booking.description
        ).filter(
            Booking.status.in_(['pending', 'confirmed', 'completed'])
        ).order_by(Booking.created_at.desc()).limit(limit).all()
        
        return [
            {
                "id": b.id,
                "title": b.title,
                "location": b.location,
                "price_per_night": b.price_per_night,
                "description": b.description,
                "similarity_score": 0.0,
                "reason": "Популярное предложение"
            }
            for b in popular
        ]
    
    def _get_recommendation_reason(self, booking: Booking, viewed_bookings: List[Booking]) -> str:
        """Генерация причины рекомендации"""
        max_similarity = 0
        most_similar = None
        
        for viewed in viewed_bookings:
            similarity = 0
            if viewed.location == booking.location:
                similarity += 0.5
            if abs(viewed.price_per_night - booking.price_per_night) / max(viewed.price_per_night, booking.price_per_night) < 0.3:
                similarity += 0.3
            
            if similarity > max_similarity:
                max_similarity = similarity
                most_similar = viewed
        
        if most_similar and max_similarity > 0.5:
            return f"Похоже на '{most_similar.title}'"
        elif booking.location:
            return f"Популярно в {booking.location}"
        else:
            return "Рекомендуем для вас"
    
    def get_similar_bookings(self, booking_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Получение похожих бронирований"""
        target_booking = self.db.query(Booking).filter(Booking.id == booking_id).first()
        
        if not target_booking:
            return []
        
        other_bookings = self.db.query(Booking).filter(
            Booking.id != booking_id,
            Booking.status.in_(['pending', 'confirmed', 'completed'])
        ).all()
        
        if not other_bookings:
            return []
        
        all_bookings = [target_booking] + other_bookings
        similarity_matrix = self._build_similarity_matrix(all_bookings)
        
        scores = similarity_matrix[0][1:]
        
        recommendations = sorted(
            zip(other_bookings, scores),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        return [
            {
                "id": booking.id,
                "title": booking.title,
                "location": booking.location,
                "price_per_night": booking.price_per_night,
                "description": booking.description,
                "similarity_score": float(score)
            }
            for booking, score in recommendations
        ]
    
    def track_view(self, user_id: int, booking_id: int):
        """Трекинг просмотра бронирования"""
        from sqlalchemy.sql import func
        
        view = self.db.query(UserView).filter(
            UserView.user_id == user_id,
            UserView.booking_id == booking_id
        ).first()
        
        if view:
            view.view_count += 1
            view.viewed_at = func.now()
        else:
            view = UserView(
                user_id=user_id,
                booking_id=booking_id,
                view_count=1
            )
            self.db.add(view)
        
        self.db.commit()