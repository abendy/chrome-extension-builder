import ext from './browser-api';

export default (ext.storage.sync ? ext.storage.sync : ext.storage.local);
