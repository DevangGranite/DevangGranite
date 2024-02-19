if (!customElements.get('account-subscription')) {
  class FormHandler extends HTMLElement {
    constructor() {
      super();
      this.inputElements = this.querySelectorAll('input, select');
      this.submitButton = this.querySelector('[type="submit"]');
      this.changeEvent = new Event('change', {
        bubbles: true
      });
      this.setInitials();
      this.inputElements.forEach(element => {
        element.addEventListener('change', () => {
          this.checkInputsChange();
        });
      });
    }

    setInitials() {
      this.initialValues = Array.from(this.inputElements).map(element => {
        return ({
          id: element.id,
          value: element.value
        });
      });
    }
    checkInputsChange() {
      let changeState = false;

      this.inputElements.forEach(element => {
        if (element.value !== this.initialValues.find(input => input.id === element.id).value) {
          changeState = true;
          console.log(element.value)
          console.log(this.initialValues.find(input => input.id === element.id).value)

        }
      });
      changeState ? this.submitButton.removeAttribute('disabled') : this.submitButton.setAttribute('disabled', true);
    }
  }
  class AccountSubscriptionForm extends FormHandler {
    constructor() {
      super();
      this.editPauseStatusButton = this.querySelector('.account-pause-options--dropdown');
      this.cancelSubscriptionButton = this.querySelectorAll('.account-open-cancel--modal, .account-close-cancel-modal--icon, .account-close-cancel-modal--button');
      this.cancelSubscriptionModal = this.querySelector('.account-cancel-subscription-modal--wrapper');
      this.quantityInput = document.getElementById('quantity');
      this.quantityMinus = this.querySelector('.account-quantity--minus');
      this.quantityPlus = this.querySelector('.account-quantity--plus');
      this.statusInput = this.querySelectorAll('[name="pause_resume"]');
      this.statusText = document.getElementById('pause_resume');
      this.nextDelivery = document.getElementById('next_date');

      this.eventListeners();
    }

    eventListeners() {
      this.statusInput.forEach(input => {
        input.addEventListener('change', e => {
          let newDate = new Date(), datePretty;
          newDate = new Date(newDate.setDate(newDate.getDate() + parseInt(e.target.value.substring(0, 1)) * 7));
          datePretty = newDate.getDate() + this.calculateSuffix(newDate.getDay()) + ' ' + newDate.toLocaleString('default', { month: 'long' });

          this.statusText.innerText = `Paused until ${datePretty}`;
          this.nextDelivery.value = datePretty;
          this.nextDelivery.setAttribute('value', datePretty);
        });
      });
      this.quantityPlus.addEventListener('click', e => {
        e.preventDefault();
        this.quantityChange(1);
      });
      this.quantityMinus.addEventListener('click', e => {
        e.preventDefault();
        this.quantityChange(-1);
      });
      this.cancelSubscriptionButton.forEach(cancel => {
        cancel.addEventListener('click', e => {
          e.preventDefault();
          this.toggleCancelModal();
        });
      });
      this.editPauseStatusButton.addEventListener('click', e => {
        e.preventDefault();
        this.statusChangeToggle(e);
      });
    }
    calculateSuffix(n) {
      return n>3&&n<21?"th":n%10===1?"st":n%10===2?"nd":n%10===3?"rd":"th";
    }
    quantityChange(quantity) {
      if (quantity < 0) {
        if (parseInt(this.quantityInput.value) > 1) {
          this.quantityInput.value = parseInt(this.quantityInput.value) + quantity;
        }
      }
      else {
        this.quantityInput.value = parseInt(this.quantityInput.value) + quantity;
      }
      this.quantityInput.dispatchEvent(this.changeEvent);
    }
    toggleCancelModal() {
      document.querySelector('body').classList.toggle('overflow-hidden');
      this.cancelSubscriptionModal.classList.toggle('opened-cancel-modal');
    }
    statusChangeToggle() {
      this.editPauseStatusButton.classList.toggle('opened-modal');
    }
  }

  customElements.define('account-subscription', AccountSubscriptionForm);

  class AccountDeliveryAddress extends FormHandler {
    constructor() {
      super();
      this.mapWrapper = document.getElementById('map-wrapper');
      this.mapOpener = document.querySelectorAll('#full_address, .account-location--picker');
      this.cities = this.querySelector('[name="city"]');
      this.districts = this.querySelector('[name="district"]');

      this.eventListeners();
      this.initMap();
      this.loadDistricts();
    }
    loadDistricts() {
      fetch('https://alainappuat.gdadmin.org/customerApiv3/getCityDistricts/')
        .then(response => response.json())
        .then(data => {
          let options = [];

          data.response.forEach(city => {
            options.push(`<option ${city.id === 29 ? 'selected' : ''} id="${city.id}" value="${city.city_name}">${city.city_name}</option>`);
          });
          this.cities.querySelector('option').remove();
          this.cities.insertAdjacentHTML('afterbegin', options.join(''));

          return 29;
        })
        .then(id => {
          this.switchDistricts(id);
        })
        .catch(error => {
          console.error('Error fetching cities:', error);
        });
    }
    switchDistricts(id) {
      fetch(`https://alainappuat.gdadmin.org/customerApiv3/getCityDistricts/${id}`)
        .then(response => response.json())
        .then(data => {
          let options = [];

          data.response.forEach((district, index) => {
            options.push(`<option ${index === 0 ? 'selected' : ''} id="${district.id}" value="${district.district_name}">${district.district_name}</option>`);
          });
          this.districts.querySelectorAll('option').forEach(option => {
            option.remove();
          });

          this.districts.insertAdjacentHTML('afterbegin', options.join());

          this.setInitials();
        })
        .catch(error => {
          console.error('Error fetching districts:', error);
        });
    }
    eventListeners() {
      this.cities.addEventListener('change', (e) => {
        this.switchDistricts(e.target.options[e.target.selectedIndex].id);
      });
      this.mapOpener.forEach(opener => {
        opener.addEventListener('click', e => {
          e.preventDefault();
          this.toggleMap();
        })
      });
    }
    toggleMap() {
      this.mapWrapper.classList.toggle('opened-map');
    }
    updateLocation(location) {
      // Update the input field with the selected location
      let apiAdd = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAEbeab1tjvjCM0g95bVgRTI1iR5yPln1Q&latlng=${location.lat()},${location.lng()}`
      /** get address form lag and lng **/
      fetch(apiAdd)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          document.getElementById('full_address').value = data.results[0]['formatted_address'];
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
    initMap() {
      const self = this;
      // Create a new map instance and set its properties
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 24.503960010032717, lng: 54.41030493578774 }, // Set the initial map center
        zoom: 6, // Set the initial zoom level
        mapTypeControl: true,
      });


      // Add a click event listener to the map to capture the selected location
      google.maps.event.addListener(this.map, 'click', function(event) {
        self.updateLocation(event.latLng);
      });

      // Add a dragend event listener to the map to capture the dragged location
      google.maps.event.addListener(this.map, 'dragend', function() {
        self.updateLocation(self.map.getCenter());
      });
    }
  }

  customElements.define('account-delivery-address', AccountDeliveryAddress);
}
