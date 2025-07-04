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
        container.style.display = "inline-block";
        container.style.margin = "10px";
        container.style.textAlign = "center";
        container.style.width = "200px";

        // Create the image element
        const imgEl = document.createElement('img');
        imgEl.src = imgUrl;
        imgEl.alt = title;
        imgEl.title = title;
        imgEl.style.width = "200px";
        imgEl.style.borderRadius = "8px";
        imgEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

        // Add a click event listener to the image element
        imgEl.onclick = () => {
          // Create a new div element to serve as the overlay
        const overlay = document.createElement('div');
        // Add the CSS class that styles the overlay
        overlay.classList.add('image-overlay');

        // Create a new image element for the enlarged image inside the overlay
        const overlayImg = document.createElement('img');
         // Set the source of the enlarged image
        overlayImg.src = imgEl.src;
         // Set the alt text for accessibility
        overlayImg.alt = imgEl.alt;

        // Add the enlarged image element as a child of the overlay div
        overlay.appendChild(overlayImg);

         // Add the overlay div to the end of the body so it appears on top of everything
        document.body.appendChild(overlay);

        // Add a click event listener to the overlay itself
        // Clicking anywhere on the overlay will remove it, closing the enlarged view
        overlay.onclick = () => {
          document.body.removeChild(overlay);
        };
      };

        // Create caption below image
        const caption = document.createElement('p');
        caption.textContent = title;
        caption.style.fontSize = "14px";
        caption.style.marginTop = "8px";
        caption.style.color = "#333";

        // Add image and caption to container div
        container.appendChild(imgEl);
        container.appendChild(caption);
        // Append container to gallery section
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
