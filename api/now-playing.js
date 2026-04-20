const getAccessToken = async () => {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
    }),
  });
  return res.json();
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  const debug = req.query?.debug === '1';

  try {
    const { access_token } = await getAccessToken();
    if (debug && !access_token) return res.json({ error: 'no_access_token' });

    const nowRes = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // 204 = nothing playing; fall through to recently played
    if (nowRes.status !== 204 && nowRes.status < 400) {
      const data = await nowRes.json();
      if (debug) return res.json({ nowStatus: nowRes.status, data });
      if (data?.item) {
        const isEpisode = data.currently_playing_type === 'episode';
        return res.json({
          isPlaying: data.is_playing,
          title: data.item.name,
          artist: isEpisode ? data.item.show?.name : data.item.artists?.[0]?.name,
        });
      }
    } else if (debug) {
      return res.json({ nowStatus: nowRes.status });
    }

    // Fallback: last played track
    const recentRes = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=1',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const recentData = await recentRes.json();
    const track = recentData.items?.[0]?.track;

    if (!track) return res.json({ isPlaying: false, title: null, artist: null });

    return res.json({
      isPlaying: false,
      title: track.name,
      artist: track.artists[0].name,
    });
  } catch {
    // Never surface errors — just return empty so the bar stays hidden
    return res.status(200).json({ isPlaying: false, title: null, artist: null });
  }
}
