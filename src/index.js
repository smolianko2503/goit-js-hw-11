import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');
const input = document.querySelector('input[name="searchQuery"]');

const KEY = '33189178-525f8a1defc89c7722c2aac0c';
const BASE_URL = 'https://pixabay.com/api/';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let page = 1;
const per_page = 40;

form.addEventListener('submit', onSearchPictures);
loadMoreBtn.addEventListener('click', onLoadMore);

loadMoreBtn.style.display = 'none';

async function onSearchPictures(evt) {
  evt.preventDefault();
  page = 1;
  const query = input.value.trim();

  if (query === '') {
    gallery.innerHTML = '';
    Notiflix.Notify.failure('Enter a search query');
    return;
  }

  const response = await fetchApi(query, page);

  try {
    if (response.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      gallery.innerHTML = '';
      loadMoreBtn.style.display = 'none';
    } else {
      gallery.innerHTML = '';
      renderMakup(response.hits);
      Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
      loadMoreBtn.style.display = 'block';
      lightbox.refresh();
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore(evt) {
  page += 1;
  const query = input.value.trim();

  const response = await fetchApi(query, page);
  try {
    if (response.totalHits < page * per_page) {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.style.display = 'none';
    }
    renderMakup(response.hits);
    lightbox.refresh();
  } catch {
    err => console.log(err);
  }
}

async function fetchApi(query, page) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

function renderMakup(images) {
  const markup = images
    .map(image => {
      const {
        id,
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
      <div class="container-card">
        <a class="gallery-item-link" href="${largeImageURL}">
          <div class="gallery-item" id="${id}">
            <img class="gallery-image" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">Likes<span>${likes}</span></p>
              <p class="info-item">Views<span>${views}</span></p>
              <p class="info-item">Comments<span>${comments}</span></p>
              <p class="info-item">Downloads<span>${downloads}</span></p>
            </div>
          </div>
        </a>
        </div>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}
