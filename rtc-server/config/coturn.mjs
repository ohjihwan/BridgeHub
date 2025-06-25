import { getTurnCredentials } from "../utils/ice.mjs";

export const iceServers = (() => {
  const { urls, username, credential } = getTurnCredentials();
  return [
    { urls, username, credential }
  ];
})();