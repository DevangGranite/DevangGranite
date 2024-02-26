jQuery(document).ready(function () {

    jQuery('.edit-name').click(function () {
        jQuery('.profile-form-section').addClass('active-form');
        jQuery('.update-name-section').addClass('active-section');    
        jQuery('html, body').animate({ scrollTop: 0 }, 'fast'); // Scroll to the top
    });

    jQuery('.edit-email').click(function () {
        jQuery('.profile-form-section').addClass('active-form');
        jQuery('.update-email-section').addClass('active-section');    
        jQuery('html, body').animate({ scrollTop: 0 }, 'fast'); // Scroll to the top
    });

    jQuery('.edit-address').click(function () {
        jQuery('.profile-form-section').addClass('active-form');
        jQuery('.update-delivery-address-section').addClass('active-section');    
        jQuery('html, body').animate({ scrollTop: 0 }, 'fast'); // Scroll to the top
    });

    jQuery('.back-link').click(function () {
        setTimeout(() => {
            jQuery('.profile-form-section').removeClass('active-form');
        }, 800);
        jQuery('.update-name-section, .update-email-section, .update-delivery-address-section').removeClass('active-section');    
        jQuery('html, body').animate({ scrollTop: 0 }, 'fast'); // Scroll to the top
    });

});