import Message from 'bsv-message';
import { DEBUG, AIP_BITCOM_ADDRESS, BAP_BITCOM_ADDRESS } from './config.js';

/**
 * Validate AIP signature
 *
 * @param opReturn
 * @returns {boolean}
 */
export const validAIPSignature = function (opReturn) {
  try {
    let messageBuffer = Buffer.concat([
      Buffer.from('6a', 'hex'), // OP_RETURN
      Buffer.from(opReturn[BAP_BITCOM_ADDRESS][0]),
      Buffer.from(opReturn[BAP_BITCOM_ADDRESS][1]),
      Buffer.from(opReturn[BAP_BITCOM_ADDRESS][2]),
      Buffer.from(opReturn[BAP_BITCOM_ADDRESS][3]),
      Buffer.from('7c', 'hex'),
    ]);

    if (opReturn[BAP_BITCOM_ADDRESS][4]) {
      // data included
      messageBuffer = Buffer.concat([
        messageBuffer,
        Buffer.from(BAP_BITCOM_ADDRESS),
        Buffer.from('DATA'),
        Buffer.from(opReturn[BAP_BITCOM_ADDRESS][2]),
        Buffer.from(opReturn[BAP_BITCOM_ADDRESS][4]),
        Buffer.from('7c', 'hex'),
      ]);
    }

    const bitcoinAddress = opReturn[AIP_BITCOM_ADDRESS][2];
    const signatureString = opReturn[AIP_BITCOM_ADDRESS][3];

    const message = Message(messageBuffer.toString());
    return message.verify(bitcoinAddress, signatureString);
  } catch (e) {
    if (DEBUG) console.error(e);
  }

  return false;
};
