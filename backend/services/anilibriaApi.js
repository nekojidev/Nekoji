import axios from 'axios';
import logger from '../utils/logger.js';

const ANILIBRIA_API_URL = process.env.ANILIBRIA_API_URL;

if(!ANILIBRIA_API_URL){
  logger.error('ANILIBRIA_API_URL is not defined in environment variables');
}


const api = axios.create({
  baseURL: ANILIBRIA_API_URL,
  // timeout: 15000,
});


const getPopularAnime = async (page = 1, itemsPerPage = 50) => {
  try {
    const response = await api.get('/title/updates' , {
      params: {
        page: page,
        items_per_page: itemsPerPage,
      }
    } )
    logger.info(`Fetched popular anime from Anilibria API (Page: ${page})`)
    return response.data
  } catch (error) {
    logger.error(`Request to Anilibria API failed: ${error.message}`);
    throw new Error('Failed to fetch popular anime');
  }
}


const searchAnime = async (searchParams) => {
  try {
    const response = await api.get('/title/search', {
      search: searchParams.title,
      genres: searchParams.genres,
    })
    logger.info(`Searched anime in Anilibria API (Query: ${searchParams.title}) `)
    return response.data
  } catch (error) {
    logger.error('Error searching anime in Anilibria API:', error.message);
    throw new Error('Failed to search anime');
  }
}

const getAnimeDetails = async (animeId) => {
  try {
    const response = await api.get('/title', {
      params: {
        id: animeId
      }
    });
    // console.log(response.data)
    // console.log(response.data)
    // This is where it returns null if response.data is empty
    if(response.data  ){
      logger.info(`Fetched anime details from Anilibria API (ID: ${animeId})`);

      return response.data
    } else {
      logger.warn(`Anime details not found for ID: ${animeId} `);
    }

  } catch (error) {
    logger.error(`Error fetching anime details from Anilibria API: ${error.message}`);
    throw new Error('Failed to fetch anime details');
  }
}


export {
  getPopularAnime,
  searchAnime,
  getAnimeDetails
}

