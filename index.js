const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === 'N/A' ? ' ' : movie.Poster;
    return `
      <img src="${imgSrc}" />
      ${movie.Title} (${movie.Year})
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: 'c103c741',
        // i: 'tt0372784',
        s: searchTerm,
      },
    });
    if (response.data.Error) {
      throw new Error('Movie(s) not found');
    }

    return response.data.Search;
  },
};

createAutoComplete({
  root: document.querySelector('#left-autocomplete'),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  },
});

createAutoComplete({
  root: document.querySelector('#right-autocomplete'),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: 'c103c741',
      i: movie.imdbID,
    },
  });

  summaryElement.innerHTML = movieTemplate(response.data);
  side === 'left' ? (leftMovie = response.data) : (rightMovie = response.data);

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    '#left-summary .notification'
  );
  const rightSideStats = document.querySelectorAll(
    '#right-summary .notification'
  );

  leftSideStats.forEach((leftStat, i) => {
    const rightStat = rightSideStats[i];

    const leftSideValue = parseInt(leftStat.dataset.value);
    const rightSideValue = parseInt(rightStat.dataset.value);

    if (rightSideValue > leftSideValue) {
      rightStat.classList.add('is-primary');
      leftStat.classList.add('is-danger');
    } else {
      leftStat.classList.add('is-primary');
      rightStat.classList.add('is-danger');
    }
  });
};

const movieTemplate = (movieDetail) => {
  const dollars = parseInt(movieDetail.BoxOffice.replace(/\D+/g, ''));
  const metaScore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/\D+/g, ''));
  const awards = calcAward(movieDetail.Awards);

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" alt="movie poster" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification ">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification ">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metaScore} class="notification ">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification ">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification ">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};

const calcAward = (awardsDetail) => {
  const awardArr = [];
  awardsDetail.split(' ').forEach((word) => {
    const val = parseInt(word);
    if (!isNaN(val)) {
      awardArr.push(val);
    }
  });
  return awardArr[0] + awardArr[1];
};
