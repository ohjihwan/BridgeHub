export const ping = (req, res) => {
  res.status(200).json({ message: 'pong from match controller' });
};