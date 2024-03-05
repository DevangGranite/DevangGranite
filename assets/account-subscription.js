if (!customElements.get('account-subscription')) {
  class FormHandler extends HTMLElement {
    constructor() {
      super();
      this.userId = 79895;
      this.userAddressId = 5858;
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
    resetInitials() {
      this.setInitials();
      this.submitButton.setAttribute('disabled', 'true');
      window.addEventListener('click', this.removeMessages);
    }
    removeMessages() {
      document.querySelectorAll('.form--success, .form--error').forEach(message => {
        message.remove();
      });
      window.removeEventListener('click', this.removeMessages);
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
        }
      });
      changeState ? this.submitButton.removeAttribute('disabled') : this.submitButton.setAttribute('disabled', true);
    }
  }
  class AccountSubscriptionForm extends FormHandler {
    constructor() {
      super();
      this.emptyScreen = document.getElementById('account-subscriptions--empty');
      this.presentScreen = document.getElementById('account-subscriptions--present');
      this.editPauseStatusButton = this.querySelector('.account-pause-options--dropdown');
      this.cancelSubscriptionButton = this.querySelectorAll('.account-open-cancel--modal, .account-close-cancel-modal--icon, .account-close-cancel-modal--button');
      this.cancelSubscriptionModal = this.querySelector('.account-cancel-subscription-modal--wrapper');
      this.quantityMinus = this.querySelector('.account-quantity--minus');
      this.quantityPlus = this.querySelector('.account-quantity--plus');
      this.cancelAction = this.querySelector('[data-cancel]');

      this.formDataFields();
      this.initSubscriptionData();
      this.eventListeners();
    }
    formDataFields() {
      this.quantityInput = document.getElementById('quantity');
      this.statusInput = this.querySelectorAll('[name="pause_resume"]');
      this.statusText = document.getElementById('pause_resume');
      this.nextDelivery = document.getElementById('next_date');
      this.productLink = this.querySelectorAll('[data-product]');
      this.totalPrice = this.querySelector('[data-total]');
      this.initialPrice = this.querySelector('[data-initialprice]');
      this.address = this.querySelector('[name="address"]');
    }
    initSubscriptionData() {
      fetch('https://alainappuat.gdadmin.org/shopifyApiV2/subscriptionList', {
        method: 'POST',
        headers: {
          'lancode': 'en',
          'token': 123456,
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          user_id: this.userId,
          status: 1
        })
      })
        .then(response => response.json()).then(response => {
          console.log(response);
          const subscriptionData = response.response[0];
          console.log(subscriptionData)
          if (subscriptionData) {
            const productData = subscriptionData.custom_orders[0];
            this.setSubscriptionFields(subscriptionData, productData);
            this.setInitials();
            this.presentScreen.style.display = 'block';
          }
          else {
            this.emptyScreen.style.display = 'flex';
          }
        })
        .catch(() => {
          this.submitButton.insertAdjacentHTML('afterend', `<div class="form--error">Something went wrong</div>`);
        });
    }
    setSubscriptionFields(subscriptionData, productData) {
      this.orderId = subscriptionData.id;
      this.productLink.forEach(product => {
        product.innerText = productData.product_name;
      });
      this.productPrice = (productData.price_per_unit + productData.price_per_unit * parseFloat(productData.vat)/100);
      this.nextDelivery.value = this.prettyDate(new Date(subscriptionData.delivery_date));
      this.inititalDeliveryDate = subscriptionData.delivery_date;
      this.nextDeliveryDate = subscriptionData.delivery_date;
      this.address.value = `${subscriptionData.location}, ${subscriptionData.state}, ${subscriptionData.city}`;
      this.initialQuantity = productData.quantity
      this.quantityInput.value = this.initialQuantity;
      this.totalPrice.innerText = (this.productPrice * this.quantityInput.value).toFixed(2);
      this.initialPrice.innerText = (this.productPrice * this.quantityInput.value).toFixed(2);
    }
    placeSubscription() {
      fetch('https://alainappuat.gdadmin.org/shopifyApiV2/placeSubscription', {
        method: 'POST',
        headers: {
          'lancode': 'en',
          'token': '123456',
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          user_id: 79895,
          user_address_id: 5858,
          sub_total: 14,
          total_vat: 0.7,
          grand_total: 14.7,
          items: [{
            product_id: 1,
            quantity: 5
          }],
          submitNew: 1
        })
      })
        .then(response => response.json())
        .then(response => {
          console.log(response);
        })
        .catch((e) => {
          console.log(e)
        })
    }
    changeSubscriptionStatus(status, start_date, end_date) {
      fetch('https://alainappuat.gdadmin.org/shopifyApiV2/changeSubscriptionStatus', {
        method: 'POST',
        headers: {
          'lancode': 'en',
          'token': '123456',
          'Content-type': 'application/json',
          'vendor_id': '2'
        },
        body: JSON.stringify({
          user_id: this.userId,
          status,
          order_id: this.orderId,
          start_date,
          end_date
        })
      })
        .then(response => response.json())
        .then(response => {
          console.log(response);
          this.submitButton.insertAdjacentHTML('afterend', `<div class="form--success">Status Updated</div>`);
          this.resetInitials();
          status === 2 && window.location.reload();
        })
        .catch(() => {
          this.submitButton.insertAdjacentHTML('afterend', `<div class="form--error">Something went wrong</div>`);
        })
    }
    editSubscription() {
      fetch('https://alainappuat.gdadmin.org/shopifyApiV2/editSubscription', {
        method: 'POST',
        headers: {
          'lancode': 'en',
          'token': '123456',
          'Content-type': 'application/json',
          'vendor_id': '2'
        },
        body: JSON.stringify({
          user_id: this.userId,
          user_address_id: this.userAddressId,
          order_id: this.orderId,
          isUpdate: 1,
          quantity: parseInt(this.quantityInput.value),
        })
      })
      .then(response => response.json())
      .then(response => {
        console.log(response)
        this.submitButton.insertAdjacentHTML('afterend', `<div class="form--success">Quantity Updated</div>`);
        this.resetInitials();
      })
      .catch(e => {
        console.log(e);
      });
    }
    eventListeners() {
      this.submitButton.addEventListener('click', e => {
        e.preventDefault();

        if (this.initialQuantity !== parseInt(this.quantityInput.value)) {
          this.editSubscription();
        }
        if (new Date(this.inititalDeliveryDate).getTime() !== new Date(this.nextDeliveryDate).getTime()) {
          const startDate = this.inititalDeliveryDate, endDate = this.nextDeliveryDate;
          this.changeSubscriptionStatus(3, startDate, endDate);
        }
      });
      this.cancelAction.addEventListener('click', () => {
        let cancelTime = new Date();
        cancelTime.setDate(cancelTime.getDate() - 1);
        console.log(cancelTime)
        this.changeSubscriptionStatus(2, cancelTime, cancelTime);
      });
      this.statusInput.forEach(input => {
        input.addEventListener('change', e => {
          this.editStatusDates(e);
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
    editStatusDates(e) {
      let oldDate = new Date(this.inititalDeliveryDate), datePretty;
      oldDate = new Date(oldDate.setDate(oldDate.getDate() + parseInt(e.target.value.substring(0, 1)) * 7));
      this.nextDeliveryDate = oldDate;
      datePretty = this.prettyDate(oldDate);

      this.statusText.innerText = `Paused until ${datePretty}`;
      this.nextDelivery.value = datePretty;
      this.nextDelivery.dispatchEvent(this.changeEvent);
      this.nextDelivery.setAttribute('value', datePretty);
    }
    calculateSuffix(n) {
      return n>3&&n<21?"th":n%10===1?"st":n%10===2?"nd":n%10===3?"rd":"th";
    }
    prettyDate(date) {
      return date.getDate() + this.calculateSuffix(date.getDay()) + ' ' + date.toLocaleString('default', { month: 'long' });
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
      this.totalPrice.innerText = (this.productPrice * this.quantityInput.value).toFixed(2);
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
      this.address = this.querySelector('[name="full_address"]');
      this.address1 = this.querySelector('[name="address1"]');
      this.districts = this.querySelector('[name="district"]');
      this.getAddress();
      this.eventListeners();
    }
    getAddress() {
      fetch(`https://alainappuat.gdadmin.org/shopifyApiV2/Addresses/${this.userId}`, {
        method: 'GET',
        headers: {
          'lancode': 'en',
          'token': '123456',
          'Content-type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          const address = data.response[0];
          if (address) {
            this.address1.value = address.address;
            this.initMap(address.lat, address.lng);
            this.loadDistricts(address.city_id, address.district_id);
          }
        })
        .catch(error => {
          console.error('Error updating address:', error);
        });
    }
    updateAddress() {
      fetch(`https://alainappuat.gdadmin.org/shopifyApiV2/updateAddresses`, {
        method: 'POST',
        headers: {
          'lancode': 'en',
          'token': '123456',
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          address: this.address1.value,
          address_id: this.userAddressId,
          city_code: document.querySelector(`option[value="${this.cities.value}"]`).id,
          district_code: document.querySelector(`option[value="${this.districts.value}"]`).id,
          lat: this.lat,
          lng: this.lng,
          location: this.address.value,
          user_id: this.userId
        })
      })
        .then(response => response.json())
        .then(data => {
          this.submitButton.insertAdjacentHTML('afterend', `<div class="form--success">${data.message}</div>`);
          console.log(data)
          this.resetInitials();
        })
        .catch(error => {
          this.submitButton.insertAdjacentHTML('afterend', `<div class="form--error">Error Updating Address</div>`);
          this.resetInitials();

          console.error('Error updating address:', error);
        });
    }
    loadDistricts(cityId, districtId) {
      fetch('https://alainappuat.gdadmin.org/customerApiv3/getCityDistricts/')
        .then(response => response.json())
        .then(data => {
          let options = [];

          data.response.forEach(city => {
            options.push(`<option ${city.id === cityId ? 'selected' : ''} id="${city.id}" value="${city.city_name}">${city.city_name}</option>`);
          });
          this.cities.querySelector('option').remove();
          this.cities.insertAdjacentHTML('afterbegin', options.join(''));
        })
        .then(() => {
          this.switchDistricts(cityId, districtId);
        })
        .catch(error => {
          console.error('Error fetching cities:', error);
        });
    }
    switchDistricts(cityId, districtId) {
      fetch(`https://alainappuat.gdadmin.org/customerApiv3/getCityDistricts/${cityId}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          let options = [];

          data.response.forEach(district => {
            options.push(`<option ${district.id === districtId ? 'selected' : ''} id="${district.id}" value="${district.district_name}">${district.district_name}</option>`);
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
      this.submitButton.addEventListener('click', e => {
        e.preventDefault();
        this.updateAddress();
      });
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
    updateLocation(lat, lng) {
      // Update the input field with the selected location
      this.lat = lat;
      this.lng = lng;
      let apiAdd = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAEbeab1tjvjCM0g95bVgRTI1iR5yPln1Q&latlng=${lat},${lng}`
      /** get address form lag and lng **/
      fetch(apiAdd)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.address.value = data.results[0]['formatted_address'];
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
    initMap(lat, lng) {
      const self = this;
      // Create a new map instance and set its properties
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) }, // Set the initial map center
        zoom: 6, // Set the initial zoom level
        mapTypeControl: true,
      });
      this.updateLocation(lat, lng);

      // Add a click event listener to the map to capture the selected location
      google.maps.event.addListener(this.map, 'click', function(event) {
        self.updateLocation(event.latLng.lat(), event.latLng.lng());
      });

      // Add a dragend event listener to the map to capture the dragged location
      google.maps.event.addListener(this.map, 'dragend', function() {
        self.updateLocation(self.map.getCenter());
      });
    }
  }

  customElements.define('account-delivery-address', AccountDeliveryAddress);
}
