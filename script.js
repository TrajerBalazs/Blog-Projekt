// Állítsd be a Render URL-t az API végpont eléréséhez
const apiUrl = "https://blog-projekt.onrender.com";

// A többi kód változatlan marad...

// Bejegyzések lekérése az API-ból
async function fetchPosts() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Hiba történt a bejegyzések lekérésekor:", err);
    return [];
  }
}

// Bejegyzések megjelenítése a főoldalon
async function displayPosts() {
  const posts = await fetchPosts();
  const postsContainer = document.getElementById("blog-posts");
  if (postsContainer) {
    postsContainer.innerHTML = "<h2>Legfrissebb bejegyzések</h2>";

    posts.forEach((post) => {
      const postElement = document.createElement("article");
      postElement.classList.add("post");
      postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.summary}</p>
                <a href="post.html?id=${post._id}">Olvass tovább</a>
            `;
      postsContainer.appendChild(postElement);
    });
  }
}

// Bejegyzések megjelenítése az admin oldalon
async function displayAdminPosts() {
  const posts = await fetchPosts();
  const adminPostsContainer = document.getElementById("admin-posts");
  if (adminPostsContainer) {
    adminPostsContainer.innerHTML = "<h2>Meglévő Bejegyzések</h2>";

    posts.forEach((post) => {
      const postElement = document.createElement("article");
      postElement.classList.add("post");
      postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.summary}</p>
                <button onclick="deletePost('${post._id}')">Törlés</button>
                <button onclick="editPost('${post._id}')">Szerkesztés</button>
            `;
      adminPostsContainer.appendChild(postElement);
    });
  }
}

// Bejegyzés törlése
async function deletePost(id) {
  await fetch(`${apiUrl}/${id}`, {
    method: "DELETE",
  });

  displayAdminPosts(); // Frissítjük az admin oldalt
  displayPosts(); // Frissítjük a főoldalt
}

// Bejegyzés szerkesztése
async function editPost(id) {
  const response = await fetch(`${apiUrl}/${id}`);
  const postToEdit = await response.json();

  document.getElementById("title").value = postToEdit.title;
  document.getElementById("summary").value = postToEdit.summary;
  document.getElementById("content").value = postToEdit.content;

  document.getElementById("post-form").onsubmit = async function (event) {
    event.preventDefault();
    const updatedPost = {
      title: document.getElementById("title").value,
      summary: document.getElementById("summary").value,
      content: document.getElementById("content").value,
    };

    await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPost),
    });

    displayAdminPosts();
    displayPosts();
  };
}

// Új bejegyzés hozzáadása
document
  .getElementById("post-form")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();
    const newPost = {
      title: document.getElementById("title").value,
      summary: document.getElementById("summary").value,
      content: document.getElementById("content").value,
    };

    addPost(newPost);
    document.getElementById("post-form").reset();
  });

async function addPost(post) {
  await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  displayAdminPosts();
  displayPosts();
}

// Bejegyzés megjelenítése a post.html oldalon
async function displayPost() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (postId) {
    const response = await fetch(`${apiUrl}/${postId}`);
    const post = await response.json();

    const postContent = document.getElementById("post-content");
    if (postContent && post) {
      postContent.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content}</p>
            `;
    }
  }
}
