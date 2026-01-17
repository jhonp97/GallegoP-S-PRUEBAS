import fetch from "node-fetch";

export const getGoogleReviews = async (req, res) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${process.env.GOOGLE_PLACE_ID}&fields=reviews,rating&reviews_sort=newest&key=${process.env.GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.result || !data.result.reviews) {
      return res.json({ reviews: [] });
    }

    const reviews = data.result.reviews
      .slice(0, 5)
      .map(r => ({
        author: r.author_name,
        text: r.text,
        rating: r.rating,
        time: r.relative_time_description,
      }));

    res.json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo reseñas" });
  }
};
