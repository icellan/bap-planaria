import fetch from 'node-fetch';
import { TOKEN } from './config';

export const getBitbusBlockEvents = async function (query, parser = 'txo') {
  parser = parser === 'bob' ? 'bob' : 'txo';
  const response = await fetch(`https://${parser}.bitbus.network/block`, {
    method: 'post',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
      token: TOKEN,
      format: 'json',
    },
    body: JSON.stringify(query),
  });
  return response.json();
};
