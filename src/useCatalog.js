import { useCallback, useEffect, useState } from "react";
import { iemApi, categoryApi, errorMessage } from "./api.js";

const tuningApi = categoryApi("tunings");
const genreApi = categoryApi("genres");

export default function useCatalog() {
  const [iems, setIems] = useState([]);
  const [tunings, setTunings] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [i, t, g] = await Promise.all([
        iemApi.list(),
        tuningApi.list(),
        genreApi.list()
      ]);
      setIems(i);
      setTunings(t);
      setGenres(g);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { iems, tunings, genres, loading, error, reload };
}
