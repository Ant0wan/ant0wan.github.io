const username = "Ant0wan";
const perPage = 100; // Max allowed by GitHub API

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);

  return response;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function fetchAllGists() {
  let allGists = [];
  let page = 1;
  let hasMore = true;
  let error = null;

  while (hasMore) {
    try {
      const response = await fetchWithTimeout(
        `https://api.github.com/users/${username}/gists?per_page=${perPage}&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const gists = await response.json();
      allGists = [...allGists, ...gists];

      // Check pagination
      const linkHeader = response.headers.get('Link');
      hasMore = linkHeader && linkHeader.includes('rel="next"');
      page++;

    } catch (err) {
      console.error(`Error fetching gists page ${page}:`, err);
      error = err;
      hasMore = false;
    }
  }

  if (error && allGists.length === 0) {
    throw error;
  }

  return allGists;
}

function getLanguageClass(filename, language) {
  const ext = filename.split('.').pop().toLowerCase();
  const lang = (language || 'text').toLowerCase();

  // Special cases for file extensions
  if (ext === 'yml' || ext === 'yaml') return 'language-yaml';
  if (ext === 'js') return 'language-javascript';
  if (ext === 'py') return 'language-python';
  if (ext === 'sh') return 'language-bash';
  if (ext === 'json') return 'language-json';
  if (ext === 'md') return 'language-markdown';
  if (ext === 'html' || ext === 'htm') return 'language-html';
  if (ext === 'service') return 'language-ini'; // Systemd service files
  if (ext === 'ini' || ext === 'cfg' || ext === 'ext') return 'language-ini';

  // Fallback to GitHub's language if it matches a Prism language
  if (Prism.languages[lang]) return `language-${lang}`;

  // Default to text if no match
  return 'language-text';
}

async function processGist(gist, index) {
  const container = document.getElementById('gist-container');
  const indexList = document.getElementById('index-list');

  const gistId = `gist-${index}`;
  const title = gist.description || `Gist ${index + 1}`;
  const fileList = Object.values(gist.files);
  const firstFile = fileList[0];
  const isSvg = firstFile.filename.toLowerCase().endsWith('.svg');
  const isMd = firstFile.filename.toLowerCase().endsWith('.md');
  const createdAt = formatDate(gist.created_at);
  const languageClass = getLanguageClass(firstFile.filename, firstFile.language);

  // Add to index
  const li = document.createElement('li');
  li.innerHTML = `<a href="#${gistId}">${title}</a>`;
  indexList.appendChild(li);

  // Gist block
  const gistDiv = document.createElement('div');
  gistDiv.className = 'gist';
  gistDiv.id = gistId;

  // Create files container
  const filesContainer = document.createElement('div');
  filesContainer.className = 'files';

  // Add creation date for each file
  Object.keys(gist.files).forEach(() => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span class="file-date">${createdAt}</span>
    `;
    filesContainer.appendChild(fileItem);
  });

  gistDiv.innerHTML = `
    <h2><a href="${gist.html_url}" target="_blank">${title}</a></h2>
  `;

  // Append the files container
  gistDiv.appendChild(filesContainer);

  if (firstFile && firstFile.raw_url) {
    try {
      if (isSvg) {
        gistDiv.innerHTML += `
          <div class="svg-container">
            <img src="${firstFile.raw_url}" alt="${firstFile.filename}">
          </div>
        `;
      } else if (isMd) {
        const fileRes = await fetchWithTimeout(firstFile.raw_url);
        const markdown = await fileRes.text();
        gistDiv.innerHTML += `
          <div class="markdown-content">
            ${marked.parse(markdown)}
          </div>
        `;
      } else {
        const fileRes = await fetchWithTimeout(firstFile.raw_url);
        const code = await fileRes.text();
        gistDiv.innerHTML += `
          <pre><code class="${languageClass}">${escapeHtml(code)}</code></pre>
        `;
      }
    } catch (e) {
      console.error(`Error loading file ${firstFile.filename}:`, e);
      gistDiv.innerHTML += `<p>Could not load file preview.</p>`;
    }
  }

  container.appendChild(gistDiv);

  // Highlight the code block for this gist only
  const codeElement = gistDiv.querySelector('code');
  if (codeElement) {
    Prism.highlightElement(codeElement);
  }
}

async function fetchGists() {
  const container = document.getElementById('gist-container');
  const indexList = document.getElementById('index-list');

  try {
    container.innerHTML = `
      <div class="loading">
        <p>Loading gists (this may take a moment)...</p>
        <p id="loading-progress" class="progress">Starting...</p>
      </div>
    `;

    const gists = await fetchAllGists();

    if (gists.length === 0) {
      container.innerHTML = '<p>No gists found for this user.</p>';
      indexList.innerHTML = '<li>No public gists available</li>';
      return;
    }

    // Clear loading message
    container.innerHTML = '';
    indexList.innerHTML = '';

    // Process each gist one by one and display immediately
    for (let i = 0; i < gists.length; i++) {
      const progress = document.getElementById('loading-progress');
      if (progress) {
        progress.textContent = `Loading gist ${i + 1} of ${gists.length}...`;
      }
      await processGist(gists[i], i);
    }

    // Remove progress indicator if it exists
    const progress = document.getElementById('loading-progress');
    if (progress) {
      progress.remove();
    }

  } catch (error) {
    console.error('Failed to load gists:', error);
    container.innerHTML = `
      <div class="error">
        <p>Failed to load gists. Possible reasons:</p>
        <ul>
          <li>GitHub API rate limit exceeded (try again later)</li>
          <li>Network connectivity issues</li>
          <li>User "${username}" doesn't exist or has no public gists</li>
        </ul>
        <p>Try refreshing the page or check the console for details.</p>
      </div>
    `;
    indexList.innerHTML = '<li>Error loading index</li>';
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Start fetching gists when the page loads
document.addEventListener('DOMContentLoaded', fetchGists);
