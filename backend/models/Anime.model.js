// server/src/models/Anime.js
// Модель для зберігання даних аніме з зовнішніх API

import mongoose from 'mongoose';

const animeSchema = new mongoose.Schema({
  apiId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  titles: {
    ru: String, // Російська назва
    en: String, // Англійська назва
    jp: String, // Японська назва
    alternative: String, // Додаємо поле alternative
  },
  // Постер
  poster: {
    type: String, // URL постера
  },
  // Опис
  description: {
    type: String,
  },
  // Рік виходу
  year: {
    type: Number,
  },
  // Тип (TV, Movie, OVA тощо)
  type: {
    type: String, // Зберігаємо string з API
  },
   // Код типу (1, 0 тощо)
  type_code: {
    type: Number,
  },
  // Статус (Ongoing, Released, Announced)
  status: {
    type: Number, // Використовуємо Number (code)
  },
  // Рядкове представлення статусу
  status_string: {
    type: String,
  },
  // Кількість епізодів (загальна або остання доступна)
  episodes: {
    type: Number,
  },
  // Жанри (зберігаємо як масив рядків, як в API)
  genres: [{
    type: String,
  }],
  // Інформація про команду (озвучка, перекладачі тощо)
  team: {
      voice: [{ type: String }], // Озвучка (масив рядків)
      translator: [{ type: String }], // Перекладачі (масив рядків)
      editing: [{ type: String }], // Редактори (масив рядків)
      decor: [{ type: String }], // Оформлення (масив рядків)
      timing: [{ type: String }], // Таймінг (масив рядків)
  },
  // Інформація про плеєр (озвучка, епізоди, посилання)
  player: {
    episodes: { // Інформація про діапазон епізодів
      first: Number,
      last: Number,
      string: String,
    },
    list: Object, // Список епізодів з посиланнями (об'єкт)
    // Додаткова інформація про плеєр, якщо потрібна
    alternative_player: String,
    host: String,
    is_rutube: Boolean,
    rutube: Object, // Дані Rutube, якщо є
  },
  // Інформація про торренти
  torrents: {
      episodes: { // Інформація про діапазон епізодів в торрентах
          first: Number,
          last: Number,
          string: String,
      },
      list: Array, // Список торрентів (масив об'єктів)
  },
  // Дата останнього оновлення в API (для відстеження змін)
  lastChange: {
    type: Number, // Unix timestamp, як в API Anilibria
  },
  // Дата оновлення тайтла в API
  updated: {
      type: Number, // Unix timestamp
  },
  // Інформація про сезон
  season: {
      string: String, // Наприклад, "весна"
      code: Number, // Код сезону
      year: Number, // Рік сезону
      week_day: Number, // День тижня виходу
  },
  // Інформація про франшизи
  franchises: Array, // Масив об'єктів франшиз

  // Інформація про блокування
  blocked: {
      copyrights: Boolean,
      geoip: Boolean,
      geoip_list: Array,
  },
  // Кількість у избранному на Anilibria
  in_favorites: Number,
  // Код тайтла
  code: String,
  // Анонс (якщо є)
  announce: Object, // Може бути об'єктом або null

}, {
  timestamps: true // Додає createdAt та updatedAt
});

// Експорт моделі 'Anime'
export default mongoose.model('Anime', animeSchema);
