const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let db = null;

const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDbandServer();

//API 1
const getMovieName = (movieItem) => {
  return {
    movieName: movieItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const movieNameQuery = `select movie_name from movie;`;

  const movieArray = await db.all(movieNameQuery);
  response.send(movieArray.map((movieItem) => getMovieName(movieItem)));
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movieAddQuery = `
    insert into movie(director_id,movie_name,lead_actor)
    values(${directorId},"${movieName}","${leadActor}");
    `;
  const newMovie = await db.run(movieAddQuery);
  const movieId = newMovie.lastID;
  response.send("Movie Successfully Added");
});

//API 3
const getMovieData = (movieData) => {
  return {
    movieId: movieData.movie_id,
    directorId: movieData.director_id,
    movieName: movieData.movie_name,
    leadActor: movieData.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `select * from movie where movie_id=${movieId};
    `;
  const movieData = await db.get(movieQuery);
  response.send(getMovieData(movieData));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateQueryDet = `
    update movie
    set director_id=${directorId},
    movie_name="${movieName}",
    lead_actor="${leadActor}"
    where movie_id=${movieId};
    `;
  await db.run(updateQueryDet);
  response.send("Movie Details Updated");
});
//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const delQuery = `delete from movie where movie_id=${movieId};
    `;
  await db.run(delQuery);
  response.send("Movie Removed");
});
//API 6
const getDirectorsList = (eachDirec) => {
  return {
    directorId: eachDirec.director_id,
    directorName: eachDirec.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const directorsQuery = `
    select * from director;
    `;
  const direcorData = await db.all(directorsQuery);
  response.send(direcorData.map((eachDirec) => getDirectorsList(eachDirec)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
