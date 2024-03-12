class PredictiveSearch {
  constructor() {
    this.container = document.getElementById('Search-Drawer');
    this.form = this.container.querySelector('form.searchform');
    this.button = document.querySelectorAll('.thb-quick-search');
    this.input = this.container.querySelector('input[type="search"]');
    this.defaultTab = this.container.querySelector('.side-panel-content--initial');
    this.predictiveSearchResults = this.container.querySelector('.side-panel-content--has-tabs');

    // Create a custom clear button
    this.clearButton = document.createElement('div');
    this.clearButton.className = 'custom-clear-button';
    this.clearButton.textContent = 'Clear';
    this.container.appendChild(this.clearButton);

    // Bind event listeners in the constructor
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));

    // Add an event listener for the custom clear button
    this.clearButton.addEventListener('click', () => {
     
      this.input.value = ''; // Clear the input field
      this.onChange(); // Trigger the onChange event manually
    });

    // Hide the default clear button
    this.input.addEventListener('search', () => {
      this.clearButton.style.display = 'none';
    });

    // Show the custom clear button when there's input
    this.input.addEventListener('input', () => {
      this.clearButton.style.display = this.input.value.length ? 'block' : 'none';
    });

    this.button.forEach((item, i) => {
      item.addEventListener('click', (event) => {
        var _this = this;
        event.preventDefault();
        document.getElementsByTagName("body")[0].classList.toggle('open-cc');
        this.container.classList.toggle('active');
        if (this.container.classList.contains('active')) {
          setTimeout(function () {
            _this.input.focus({
              preventScroll: true
            });
          }, 100);
          dispatchCustomEvent('search:open');
        }

        return false;
      });
    });
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      this.predictiveSearchResults.classList.remove('active');
      return;
    }
    this.predictiveSearchResults.classList.add('active');
    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length) {
      event.preventDefault();
    }
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      return;
    }

    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();

    this.predictiveSearchResults.classList.add('loading');

    fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product,article,query&${encodeURIComponent('resources[limit]')}=10&section_id=predictive-search`)
      .then((response) => {
        this.predictiveSearchResults.classList.remove('loading');
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;

        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        throw error;
      });
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;

    let _this = this,
      submitButton = this.container.querySelector('#search-results-submit');

    submitButton.addEventListener('click', () => {
      _this.form.submit();
    });
  }

  close() {
    this.container.classList.remove('active');
  }
}

window.addEventListener('load', () => {
  if (typeof PredictiveSearch !== 'undefined') {
    new PredictiveSearch();
  }
});

function clearSearch() {
  var searchInput = document.getElementById('side-panel-search-input');
  var clearButton = document.querySelector('.custom-clear-button');

  searchInput.value = '';
  clearButton.style.display = 'none';
}

// Show the custom clear button when there's input
document.getElementById('side-panel-search-input').addEventListener('focus', function() {
  var clearButton = document.querySelector('.custom-clear-button');
  clearButton.style.display = this.value.length ? 'inline-block' : 'none';
});

document.getElementById('side-panel-search-input').addEventListener('input', function() {
  var clearButton = document.querySelector('.custom-clear-button');
  clearButton.style.display = this.value.length ? 'inline-block' : 'none';
});

document.getElementById('side-panel-search-input').addEventListener('blur', function() {
  var clearButton = document.querySelector('.custom-clear-button');
  clearButton.style.display = 'none';
});

