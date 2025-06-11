import * as rtcService from '../services/rtc.mjs';
import { generateTurnCredentials } from '../utils/ice.mjs';

const { username, credential } = generateTurnCredentials('bridgehub_secret_123');

const iceServers = [
  {
    urls: ['turn:54.252.32.250:3478?transport=udp'],
    username,
    credential
  }
];


export const ping = (req, res) => {
  res.status(200).json({ message: 'pong from rtc controller' });
};
// Offer
export const receiveOffer = async (req, res, next) => {
  try {
    const { offer, userId } = req.body;
    const answer = await rtcService.processOffer(offer, userId);
    res.status(200).json({ answer });
  } catch (err) {
    next(err);
  }
};

// Answer
export const receiveAnswer = async (req, res, next) => {
  try {
    const { answer, userId } = req.body;
    await rtcService.processAnswer(answer, userId);
    res.status(200).json({ message: 'Answer received and processed' });
  } catch (err) {
    next(err);
  }
};

// Candidate
export const receiveCandidate = async (req, res, next) => {
  try {
    const { candidate, userId } = req.body;
    await rtcService.processCandidate(candidate, userId);
    res.status(200).json({ message: 'Candidate received and processed' });
  } catch (err) {
    next(err);
  }
};