jQuery(document).ready(function () {

    jQuery('.edit-name').click(function () {
        jQuery('.profile-form-section').addClass('active-form');
        jQuery('.update-name-section').addClass('active-section');    
    })

    jQuery('.edit-email').click(function () {
        jQuery('.profile-form-section').addClass('active-form');
        jQuery('.update-email-section').addClass('active-section');    
    })

    jQuery('.edit-address').click(function () {
        jQuery('.profile-form-section').addClass('active-form');
        jQuery('.update-delivery-address-section').addClass('active-section');    
    })

    jQuery('.back-link').click(function () {
        setTimeout(() => {
            jQuery('.profile-form-section').removeClass('active-form');
        }, 800);
        jQuery('.update-name-section,.update-email-section,.update-delivery-address-section').removeClass('active-section');    
    })

})

function openPopup() {
    // Get the popupUpdate element
    var popup = document.getElementById("popupUpdate");

    // Set the display style to "block" to make it visible
    popup.style.display = "block";
}

/*** Pop up start MAP ***/

   var map;

    // Function to initialize the map
    function initMap() {
      // Create a new map instance and set its properties
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 25.199514, lng: 55.277397 }, // Set the initial map center
        zoom: 10, // Set the initial zoom level
      });

      // Add a click event listener to the map to capture the selected location
      google.maps.event.addListener(map, 'click', function(event) {
        updateLocation(event.latLng);
      });

      // Add a dragend event listener to the map to capture the dragged location
      google.maps.event.addListener(map, 'dragend', function() {
        updateLocation(map.getCenter());
      });
    }

    // Function to open the popup
   function openPopup() {
    var otpPopupHtml = document.getElementsByTagName( 'html' )[0];
    var popupElement = document.getElementById('popup');

    if (popupElement) {
        // Set display property to 'block'
        popupElement.style.display = 'block';

        // Add a class to the element
        otpPopupHtml.classList.add('popup-overlap');

        // Check if initMap function is defined before calling
        if (typeof initMap === 'function') {
            // Initialize the map when the popup is opened
            initMap();
        } else {
            console.error("initMap function is not defined");
        }
    } else {
        console.error("Element with ID 'popup' not found");
    }
}
    // Function to close the popup
  
    function closePopup() {
    var otpPopupHtml = document.getElementsByTagName( 'html' )[0];
    var popupElement = document.getElementById('popup');

    if (popupElement) {
        // Remove the class from the element
        otpPopupHtml.classList.remove('popup-overlap');

        // Set display property to 'none'
        popupElement.style.display = 'none';
    } else {
        console.error("Element with ID 'popup' not found");
    }
}

    // Function to update the location information
    function updateLocation(location) {
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
          document.getElementById('locationText').innerText = data.results[0]['formatted_address'];
          document.getElementById('locationInput').value = data.results[0]['formatted_address'];
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
      }
      /** END  get address form lag and lng **/ 
    // Function to handle Enter key on the address input field
    function handleEnterKey(event) {
      if (event.key === 'Enter') {
        // Prevent the default Enter key behavior (form submission)
        event.preventDefault();

        // Update location based on entered address
        updateLocationForAddress();
      }
    }

    // Function to update the location based on entered address
    function updateLocationForAddress() {
      var address = document.getElementById('addressInput').value;

      // Use Google Maps Geocoding API to convert the address into latitude and longitude
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': address }, function(results, status) {
        if (status == 'OK' && results[0]) {
          var location = results[0].geometry.location;

          // Update the map center
          map.setCenter(location);

          // Update the location information
          updateLocation(location);
        }
      });
    }

    // Function to show map based on entered address
    function showMapForAddress() {
      updateLocationForAddress();
    }
  
/*** Pop up end MAP ***/  