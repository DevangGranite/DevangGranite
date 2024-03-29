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

/** store cooket */
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

/** get cooket value by cookie name*/
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

/** delete/erase cooket by cookie name*/
 function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

class UpdateProfile extends HTMLElement{
    constructor() {
        super();
        this.eventElement = new Event('change');
        this.updateNameBtn = this.querySelector('#updateUserName');
        this.updateEmailBtn = this.querySelector('#updateEmailBtn');
        this.updateAddressBtn = this.querySelector('#updateAddress');
        this.address_id = this.querySelector('input[name="address_id"]');
        this.customer_id = this.querySelector('input[name="customer_id"]');
        this.first_name = this.querySelector('input[name="first_name"]');
        this.last_name = this.querySelector('input[name="last_name"]');
        this.newEmail = this.querySelector('input[name="new_email"]');
        this.newEmailConfirm = this.querySelector('input[name="new_email_confirm"]');
        this.email_confirm_error = this.querySelector('.email_confirm_error');
        this.address1 = this.querySelector('input[name="addressInput"]');
        this.address2 = this.querySelector('input[name="address2"]');
        this.city = this.querySelector('select[name="city"]');
        this.district = this.querySelector('select[name="district"]');
        this.lat = this.querySelector('input[name="lat"]');
        this.lang = this.querySelector('input[name="lang"]');

        this.evenetListener();
    }
    evenetListener(){

        // Update first name and last name
        this.updateNameBtn.addEventListener('click', e => {
            e.preventDefault();
            fetch(`https://alainuat.gdadmin.org/laravel/public/api/customer/update/profile`, {
                method: 'POST',
                body:JSON.stringify({id:this.customer_id.value,first_name:this.first_name.value,last_name:this.last_name.value,user_id:getCookie('user_id')})
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }
                return response.json();  
            }).then(data => {
                console.log('Customer profile edit',data);
            }).catch(error => {
                console.error('Customer profile edit Error fetching data:', error);
            }); 
        });

        // Update email address
        this.updateEmailBtn.addEventListener('click', e => {
            if(this.newEmail.value != this.newEmailConfirm.value){
                this.email_confirm_error.innerText = "Email address doesn't match.";
            }else{
                /** update email in shopify database */
                fetch(`https://alainuat.gdadmin.org/laravel/public/api/customer/update/profile`, {
                    method: 'POST',
                    body:JSON.stringify({id:this.customer_id.value,email:this.newEmail.value,user_id:getCookie('user_id')})
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.status}`);
                    }
                    return response.json();  
                }).then(data => {
                    let responce = JSON.parse(data.customer);
                    console.log('Customer profile edit',responce);
                    if(responce.errors){
                        if(responce.errors.email)
                            this.email_confirm_error.innerText = "Email has already been taken.";
                    }else{
                        /** update email in mss */

                        var headers = new Headers();
                        headers.append("token", "123456");
                        headers.append("lancode", "en");
                        headers.append("Content-Type", "application/json");

                        var raw = JSON.stringify({
                            "email_id": this.newEmail.value,
                            "user_id": getCookie('user_id')
                        });

                        var requestOptions = {
                            method: 'POST',
                            headers: headers,
                            body: raw,
                            redirect: 'follow'
                        };

                        fetch("https://alainappuat.gdadmin.org/shopifyApiV2/updateEmailAddress", requestOptions)
                        .then(response => response.text())
                        .then(data => {
                            console.log('MSS Customer email edit',data);
                            window.location.href = '/pages/profile'
                        }).catch(error => 
                            console.log('MSS email update error', error)
                        );
                    }
                    
                }).catch(error => {
                    console.error('Customer profile edit Error fetching data:', error);
                });
                this.email_confirm_error.innerText = "";
            }
        });

        // Update address
        this.updateAddressBtn.addEventListener('click', e => {
            e.preventDefault();
            fetch(`https://alainuat.gdadmin.org/laravel/public/api/customer/update/address`, {
                method:'POST',
                body:JSON.stringify(
                    {
                        address_id:this.address_id.value,
                        customer_id:this.customer_id.value,
                        address1:this.address1.value,
                        address2:this.address2.value,
                        city:this.city.options[this.city.selectedIndex].text,
                        province_code: this.district.options[this.district.selectedIndex].text.split(' ').map(word => word.charAt(0)).join(''),
                        province:this.district.options[this.district.selectedIndex].text,
                        country_name:`United Arab Emirates`
                    })
            }).then(response => {
                if(!response.ok) {
                    throw new Error(`Newtwork response was not ok: ${response.status}`);
                }
                return response.json();
            }).then(data => {
                console.log('Customer address edit',data);
                let responce = JSON.parse(data.customer);
                if(!responce.errors){
                    fetch(`https://alainappuat.gdadmin.org/shopifyApiV2/Addresses/${getCookie('user_id')}`, {
                        method:'GET',
                        headers:{
                            'lancode':'en',
                            'token':'123456'
                        }
                    }).then(responce => {
                        if(!responce.ok) {
                            throw new Error(`Network response was not ok: ${responce.status}`);
                        }
                        return responce.json();
                    }).then(data => {
                        console.log('Customer Address',data);
                        data.response.forEach(address => {
                            if(address.is_default == 1){
                                var headers = new Headers();
                                headers.append("token", "123456");
                                headers.append("lancode", "en");
                                headers.append("Content-Type", "application/json");

                                var raw = JSON.stringify({
                                    address:this.address2.value,
                                    address_id:address.id,
                                    city_code:this.city.value,
                                    district_code:this.district.value,
                                    lat:this.lat.value,
                                    lng:this.lang.value,
                                    location:this.address1.value,
                                    user_id:getCookie('user_id')
                                });
                                console.log('Address raw',raw);
                                fetch(`https://alainappuat.gdadmin.org/shopifyApiV2/updateAddresses`, {
                                    method:'POST',
                                    headers:headers,
                                    body:raw
                                }).then(response => response.text())
                                .then(data => {
                                    console.log('Customer address updated',data);
                                    window.location.href = '/pages/profile'
                                }).catch(error => console.log('MSS customer address update error',error));
                            }
                        });
                    }).catch(error => {
                        console.log('Get customer address Error fetching data:',error);
                    });
                }else{
                    this.querySelector(".update-delivery-address-form .error").innerText = "{{ customer.addresses.update_error | t }}";
                }
            }).catch(error => {
                console.error('Customer address edit Error fetching data:',error);
            });
        });
    }
}
customElements.define('update-profile', UpdateProfile);