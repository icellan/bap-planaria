import ReconnectingEventSource from './lib/reconnecting-eventsource';
import { BAP_BITCOM_ADDRESS } from './config';
import {
  indexBAPTransactions,
  processBlockEvents,
} from './bap.js';

export const watchBAPTransactions = async function (queryFind = false) {
  // Base64 encode your bitquery
  queryFind = queryFind || { 'out.s2': BAP_BITCOM_ADDRESS };
  const query = { q: { find: queryFind } };
  const b64 = Buffer.from(JSON.stringify(query))
    .toString('base64');

  // Subscribe
  const url = `https://txo.bitsocket.network/s/${b64}`;
  console.log('starting socket listener on', url);
  const sock = new ReconnectingEventSource(url);
  sock.onmessage = async function (e) {
    // console.log('SOCKET DATA', e.data);
    const events = JSON.parse(e.data).data;
    events.forEach((event) => {
      processBlockEvents(event);
    });
  };

  // get mined blocks
  await indexBAPTransactions();
  setInterval(async () => {
    await indexBAPTransactions();
  }, 5 * 60 * 1000); // run every 5 minutes to get new blocks
};
