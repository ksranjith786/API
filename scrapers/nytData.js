const axios = require('axios');
const csv = require('csvtojson');
const logger = require('../utils/logger');
const { updateCache } = require('../utils/nyt_cache');

const US_COUNTY_DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
const US_STATE_DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
const US_NATION_WIDE_DATA_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv';
const REDIS_KEYS = ['nyt_counties', 'nyt_states', 'nyt_nationwide'];

const nytData = async (keys, redis) => {
	try {
		const _resolveData = async (url, index) => {
			const { data } = await axios.get(url);
			const parsedData = await csv().fromString(data);
			redis.set(keys[REDIS_KEYS[index]], JSON.stringify(parsedData));
		};

		await Promise.all([
			US_COUNTY_DATA_URL,
			US_STATE_DATA_URL,
			US_NATION_WIDE_DATA_URL
		].map(_resolveData));
		logger.info('NYT Data successfully retrieved');
		await updateCache();
	} catch (err) {
		logger.err('Error: Requesting NYT data failed!', err);
	}
};

module.exports = {
	nytData
};
