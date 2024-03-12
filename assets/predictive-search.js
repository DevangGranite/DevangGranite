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

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', this.onFormSubmit.bind(this));
    this.input.addEventListener('input', debounce(this.onChange.bind(this), 300));
    this.clearButton.addEventListener('click', this.clearInput.bind(this));
    this.button.forEach(item => {
      item.addEventListener('click', (event) => {
        this.handleButtonClick(event);
      });
    });

    this.input.addEventListener('input', this.updateClearButtonDisplay.bind(this));
    this.input.addEventListener('focus', this.updateClearButtonDisplay.bind(this));
    this.input.addEventListener('blur', () => {
      this.clearButton.style.display = 'none';
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

  handleButtonClick(event) {
    event.preventDefault();
    document.getElementsByTagName("body")[0].classList.toggle('open-cc');
    this.container.classList.toggle('active');

    if (this.container.classList.contains('active')) {
      setTimeout(() => {
        this.input.focus({
          preventScroll: true
        });
      }, 100);
      dispatchCustomEvent('search:open');
    }
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

    let submitButton = this.container.querySelector('#search-results-submit');
    submitButton.addEventListener('click', () => {
      this.form.submit();
    });
  }

  clearInput() {
    this.input.value = '';
    this.clearButton.style.display = 'none';
  }

  updateClearButtonDisplay() {
    this.clearButton.style.display = this.input.value.length ? 'block' : 'none';
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

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function dispatchCustomEvent(eventName) {
  const event = new Event(eventName);
  document.dispatchEvent(event);
}
