export const fetchMeters = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/meters/", {
        method: "GET",
      });

      const data = await res.json();

     
    } catch (err) {
      console.error("Error fetching meters:", err);
    } finally {
    }
  };