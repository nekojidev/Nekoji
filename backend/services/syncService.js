import Anime from '../models/Anime.model.js'
import {getPopularAnime, getAnimeDetails} from '../services/anilibriaApi.js'
import logger from '../utils/logger.js'
import {set, del} from './cacheService.js'
 

const CACHE_TTL_AFTER_SYNC = 300; // 5 хвилин

// @desc    Зберегти або оновити дані аніме в локальній БД
// @param   {Object} animeData - Об'єкт з даними аніме з API
const saveOrUpdateAnime = async (animeData) => {
  try {
    // Перевіряємо, чи animeData існує та має необхідне поле 'id'
    if (!animeData || !animeData.id) {
        logger.warn('Attempted to save/update with invalid anime data:', animeData);
        return null; // Або викинути помилку, залежно від бажаної поведінки
    }

    const animeApiId = String(animeData.id); // Перетворюємо ID на рядок для консистентності

    // Шукаємо аніме за apiId (ID з Anilibria)
    logger.debug(`Attempting to find anime with apiId: ${animeApiId}`);
    const existingAnime = await Anime.findOne({ apiId: animeApiId });
    logger.debug(`Find result for apiId ${animeApiId}: ${existingAnime ? 'Found' : 'Not Found'}`);


    if (existingAnime) {
      // Якщо аніме існує, оновлюємо його дані
      logger.debug(`Updating existing anime with apiId: ${animeApiId}`);
      existingAnime.apiName = 'anilibria';
      existingAnime.title = animeData.names?.ru || animeData.names?.en || 'Без назви';
      existingAnime.titles = animeData.names;
      existingAnime.poster = animeData.posters?.original?.url ; // Зберігаємо тільки URL постера
      existingAnime.description = animeData.description;
      existingAnime.year = animeData.season?.year;
      existingAnime.type = animeData.type?.string;
      existingAnime.type_code = animeData.type?.code;
      existingAnime.status = animeData.status?.code;
      existingAnime.status_string = animeData.status?.string;
      existingAnime.episodes = animeData.player?.episodes?.last || 0; // Використовуємо останній епізод як кількість
      existingAnime.genres = animeData.genres; // Зберігаємо як масив рядків
      existingAnime.team = animeData.team; // Зберігаємо весь об'єкт team
      existingAnime.player = animeData.player; // Зберігаємо весь об'єкт player
      existingAnime.torrents = animeData.torrents; // Зберігаємо весь об'єкт torrents
      existingAnime.lastChange = animeData.last_change;
      existingAnime.updated = animeData.updated;
      existingAnime.season = animeData.season;
      existingAnime.franchises = animeData.franchises;
      existingAnime.blocked = animeData.blocked;
      existingAnime.in_favorites = animeData.in_favorites;
      existingAnime.code = animeData.code;
      existingAnime.announce = animeData.announce;

      logger.debug(`Saving updated anime with apiId: ${animeApiId}`);
      await existingAnime.save();
      logger.info(`Updated anime in DB: ${existingAnime.title} (${existingAnime.apiId})`);
      return { anime: existingAnime, created: false };
    } else {
      // Якщо аніме не існує, створюємо новий запис
      logger.debug(`Creating new anime with apiId: ${animeApiId}`);
      const newAnime = await Anime.create({
        apiName: 'anilibria',
        apiId: animeApiId,
        title: animeData.names?.ru || animeData.names?.en || 'Без назви',
        titles: animeData.names,
        poster: animeData.posters?.original?.url, // Зберігаємо тільки URL постера
        description: animeData.description,
        year: animeData.season?.year,
        type: animeData.type?.string,
        type_code: animeData.type?.code,
        status: animeData.status?.code,
        status_string: animeData.status?.string,
        // Використовуємо player.episodes.last для кількості епізодів, якщо доступно, інакше 0
        // Або animeData.player?.episodes?.list ? Object.keys(animeData.player.episodes.list).length : 0
        episodes: animeData.player?.episodes?.last || 0, // Використовуємо останній епізод як кількість
        genres: animeData.genres, // Зберігаємо як масив рядків
        team: animeData.team, // Зберігаємо весь об'єкт team
        player: animeData.player, // Зберігаємо весь об'єкт player
        torrents: animeData.torrents, // Зберігаємо весь об'єкт torrents
        lastChange: animeData.last_change,
        updated: animeData.updated,
        season: animeData.season,
        franchises: animeData.franchises,
        blocked: animeData.blocked,
        in_favorites: animeData.in_favorites,
        code: animeData.code,
        announce: animeData.announce,
      });
      logger.info(`Created new anime in DB: ${newAnime.title} (${newAnime.apiId})`);
      return { anime: newAnime, created: true };
    }
  } catch (error) {
    // Покращене логування помилок при збереженні/оновленні
    if (error.name === 'ValidationError') {
        logger.error(`Mongoose Validation Error for anime ${animeData?.id}: ${error.message}`, error.errors);
    } else if (error.code === 11000) {
        logger.error(`MongoDB Duplicate Key Error for anime ${animeData?.id}: ${error.message}`);
    } else {
        // Логуємо загальну помилку збереження/оновлення з деталями
        logger.error(`Error saving/updating anime ${animeData?.id}: ${error.message}`, error);
    }
    // Викидаємо помилку далі, щоб її міг обробити контролер або викликаюча функція
    throw error;
  }
};

// @desc    Синхронізувати останні оновлення з Anilibria API
// @returns {Object} - Кількість створених та оновлених записів
const syncRecentUpdates = async () => {
  let createdCount = 0;
  let updatedCount = 0;

  try {
    logger.info('Starting recent updates sync from Anilibria API...');
    const recentUpdatesResponse = await getPopularAnime(1, 50);
    if (!recentUpdatesResponse || !Array.isArray(recentUpdatesResponse.list)) {
        logger.warn('Anilibria API /title/updates did not return expected list format.');
        return { createdCount: 0, updatedCount: 0 };
    }

    const recentUpdates = recentUpdatesResponse.list;

    if (recentUpdates.length === 0) {
      logger.info('No recent updates found from Anilibria API.');
      return { createdCount: 0, updatedCount: 0 };
    }

    // Проходимося по кожному оновленню та зберігаємо/оновлюємо в БД
    for (const update of recentUpdates) {
      if (!update || !update.id) {
          logger.warn('Skipping invalid update object:', update);
          continue; // Пропускаємо некоректний об'єкт
      }
      try {
        logger.debug(`Processing recent update for anime ID: ${update.id}`); // Додано лог
        // Отримуємо повні деталі аніме, оскільки список оновлень може не містити всіх полів
        const animeDetails = await getAnimeDetails(update.id);
        if (animeDetails) {
             const result = await saveOrUpdateAnime(animeDetails);
             if (result && result.created) { // Перевіряємо, що saveOrUpdateAnime повернула результат
               createdCount++;
             } else if (result && !result.created) {
               updatedCount++;
             }
        } else {
            logger.warn(`Could not fetch details for recent update with ID: ${update.id}`);
        }
      } catch (innerError) {
        // Логуємо помилку обробки конкретного аніме з його ID
        logger.error(`Failed to process recent update for anime ID ${update.id}: ${innerError.message}`, innerError); // Додано innerError
        // Продовжуємо обробку інших оновлень, не зупиняємося на помилці одного
      }
    }

    logger.info(`Recent updates sync complete. Created: ${createdCount}, Updated: ${updatedCount}`);

    // Після успішної синхронізації, очищаємо кеш списків, щоб фронтенд отримав свіжі дані
    // Адаптуйте ключі кешу, якщо використовуєте інші параметри пагінації
    await del('popular_page_1_per_10');
    // Можливо, потрібно очистити кеш інших популярних сторінок або використовувати більш гнучкий підхід

    return { createdCount, updatedCount };

  } catch (error) {
    logger.error(`Error during recent updates sync: ${error.message}`, error); // Додано error
    throw new Error('Failed to synchronize recent updates');
  }
};

// @desc    Синхронізувати ВСІ аніме з Anilibria API (потребує ітерації по API)
//          Ця функція може зайняти багато часу і ресурсів!
const syncAllAnime = async () => {
    logger.info('Starting full anime sync from Anilibria API...');
    let createdCount = 0;
    let updatedCount = 0;
    let currentPage = 1;
    const itemsPerPage = 50; // Кількість елементів на сторінці для запиту

    try {
        while (true) {
            logger.info(`Fetching page ${currentPage} of anime updates from Anilibria API...`);
            // Використовуємо /title/updates для ітерації, оскільки Anilibria API може не мати прямого ендпоінта "отримати все"
            // Цей підхід синхронізує всі аніме, які коли-небудь оновлювалися і потрапляють в пагінацію /title/updates
            const pageDataResponse = await getPopularAnime(currentPage, itemsPerPage);

            // Перевіряємо, що відповідь має поле 'list' і воно є масивом
            if (!pageDataResponse || !Array.isArray(pageDataResponse.list)) {
                 logger.warn(`Anilibria API /title/updates for page ${currentPage} did not return expected list format. Stopping sync.`);
                 // Зупиняємо цикл у разі неочікуваного формату
                 break;
            }

            const pageData = pageDataResponse.list;
            // console.log(pageData)

            if (pageData.length === 0) {
                logger.info(`No more data found on page ${currentPage}. Full sync finished.`);
                break; // Зупиняємо цикл, якщо сторінка порожня
            }

            for (const animeSummary of pageData) {
              if (!animeSummary || !animeSummary.id) {
                logger.warn('Skipping invalid anime summary object during full sync:', animeSummary);
                continue; // Пропускаємо некоректний об'єкт
              }
              try {
                logger.debug(`Processing anime ID: ${animeSummary.id} from page ${currentPage}`); // Додано лог
                console.log(animeSummary.id)
                    // Отримуємо повні деталі для кожного аніме
                    const animeDetails = await getAnimeDetails(animeSummary.id);
                    // console.log(animeDetails)
                    if (animeDetails) {
                        const result = await saveOrUpdateAnime(animeDetails);
                        if (result && result.created) { // Перевіряємо, що saveOrUpdateAnime повернула результат
                            createdCount++;
                        } else if (result && !result.created) {
                            updatedCount++;
                        }
                    } else {
                         logger.warn(`Could not fetch details for anime ID: ${animeSummary.id} during full sync.`);
                    }
                 } catch (innerError) {
                     // Логуємо помилку обробки конкретного аніме з його ID та сторінкою
                     logger.error(`Failed to process anime ID ${animeSummary.id} from page ${currentPage} during full sync: ${innerError.message}`, innerError); // Додано innerError
                     // Продовжуємо, не зупиняємося на помилці
                 }
            }

            currentPage++; // Переходимо до наступної сторінки
            // Важливо додати затримку між запитами, щоб не перевантажувати Anilibria API
            await new Promise(resolve => setTimeout(resolve, 500)); // Затримка 500 мс
        }

        logger.info(`Full anime sync complete. Created: ${createdCount}, Updated: ${updatedCount}`);

        await del('popular_page_1_per_10');

        return { createdCount, updatedCount };

    } catch (error) {
        logger.error(`Error during full anime sync: ${error.message}`, error); // Додано error
        throw new Error('Failed to synchronize all anime'); // Викидаємо, щоб контролер міг обробити
    }
};


// Експорт функцій сервісу синхронізації
export {
  saveOrUpdateAnime,
  syncRecentUpdates,
  syncAllAnime, // Експортуємо функцію повної синхронізації
};
