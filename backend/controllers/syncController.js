import asyncHandler from 'express-async-handler';
import { syncRecentUpdates, syncAllAnime } from '../services/syncService.js';
import logger from '../utils/logger.js';

const triggerRecentSync = asyncHandler(async (req, res) => {
  logger.info('Triggering recent sync');

  const result = await syncRecentUpdates();

  res.status(200).json({
    message:  'Recent sync triggered',
    ...result
  })

} )

const triggerFullSync = asyncHandler(async (req, res) => {
    // Увага: Повна синхронізація може зайняти багато часу і ресурсів!
    // В реальному додатку це краще робити як окремий фоновий процес,
    // а не через HTTP запит, який може перерватися за таймаутом.
    // Для простоти прикладу, поки що захистимо його middleware 'protect'.

    logger.info('Manual trigger for full anime sync received.');

    // Запускаємо процес повної синхронізації
    // Оскільки це може бути довга операція, можна відповісти клієнту одразу,
    // а синхронізацію запустити у фоновому режимі.
    // Наприклад: syncAllAnime().catch(err => logger.error('Full sync failed:', err));
    // та повернути статус 202 Accepted.
    // Для простоти прикладу, чекаємо завершення:
    const result = await syncAllAnime();


    res.json({
        message: 'Full sync triggered',
        ...result,
    });
});

export { triggerRecentSync, triggerFullSync };