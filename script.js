const API_KEY = "9IADG7DQtaW2xk4A6PevDnlgZG3u4t0Zjd6eaRNL";
const APOD_API = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

fetch(APOD_API)
    .then(response => response.json())
    .then(data => {
        if (data.media_type === 'image') {
            document.getElementById('APOD-image').src = data.url;
        } else {
            document.getElementById('APOD-image').style.display = 'none';
        }
        document.getElementById('APOD-date').textContent = data.date;
        document.getElementById('APOD-title').textContent = data.title;
        document.getElementById('APOD-description').textContent = data.explanation;
    })

// Global variables to keep track of the current search parameters and pagination
let currentPage = 1;
let currentSearchTerm = "nebula";
let currentMediaType = "image";

async function fetchNasaImages(searchTerm = "nebula", mediaType = "image", page = 1) {
    // Construct the API URL with query parameters including pagination and page size (12 items per page)
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerm)}&media_type=${mediaType}&page=${page}&page_size=12`;

    // Fetch data from NASA API
    const response = await fetch(url);
    const data = await response.json();

    // Check if results exist; if no results on first page, show alert and hide "Load More" button
    if (!data.collection || !data.collection.items || data.collection.items.length === 0) {
      if (page === 1) alert("No results found for: " + searchTerm);
      document.getElementById("load-more-btn").style.display = "none";
      return;
    }

    // Extract items array from API response
    const items = data.collection.items;
    const gallery = document.getElementById("nasa-gallery");

    //clear the existing gallery to show new results
    if(page === 1) {
      gallery.innerHTML = ""; 
    }

    // Create container div for each image and caption
    items.forEach(item => {
      const media = item.links?.[0];
      const imgUrl = media?.href;
      const title = item.data?.[0]?.title || "No Title";

      if (imgUrl) {
        // Create container div for each image and caption
        const container = document.createElement('div');
        container.classList.add('gallery-item');

        const imgEl = document.createElement('img');
        imgEl.src = imgUrl;
        imgEl.alt = title;
        imgEl.title = title;

        imgEl.onclick = () => {
          const overlay = document.createElement('div');
          overlay.classList.add('image-overlay');
          const overlayImg = document.createElement('img');
          overlayImg.src = imgEl.src;
          overlayImg.alt = imgEl.alt;
          overlay.appendChild(overlayImg);
          document.body.appendChild(overlay);
          overlay.onclick = () => document.body.removeChild(overlay);
        };

        const caption = document.createElement('p');
        caption.textContent = title;

        container.appendChild(imgEl);
        container.appendChild(caption);
        gallery.appendChild(container);
      }
    });



    // Show the "Load More" button
    document.getElementById("load-more-btn").style.display = items.length < 12 ? "none" : "inline-block";
}

async function updateGallery() {
  currentPage = 1;
  // Get values from form inputs
  const searchInput = document.getElementById("search-input").value.trim();
  const mediaType = document.getElementById("media-type").value;
  const presetKeyword = document.getElementById("preset-keyword").value;
  // Use input search term if provided; otherwise use preset keyword or default to "nebula"
  currentSearchTerm = searchInput || presetKeyword || "nebula";
  currentMediaType = mediaType;

  // Fetch images using current parameters and page 1
  await fetchNasaImages(currentSearchTerm, currentMediaType, currentPage);
}

// Attach event listener to search form submission to trigger gallery update without page reload
document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  updateGallery();
});

// Update gallery when media type selection changes
document.getElementById("media-type").addEventListener("change", updateGallery);
// Update gallery when preset keyword selection changes
document.getElementById("preset-keyword").addEventListener("change", updateGallery);

// "Load More" button loads next page of images without clearing existing ones
document.getElementById("load-more-btn").addEventListener("click", () => {
  currentPage++;
  fetchNasaImages(currentSearchTerm, currentMediaType, currentPage);
});


// Initial load of the gallery with default parameters
updateGallery();