export default function handler(req, res) {
  res.status(200).json({ 
    status: 'OK', 
    message: 'VidyaShare API is running on Vercel!',
    timestamp: new Date().toISOString()
  });
}