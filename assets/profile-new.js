document.querySelector('.edit-name').addEventListener('click', e => {
    document.querySelector('.profile-form-section').classList.add('active-form');
    document.querySelector('.update-name-section').classList.add('active-section');
});
document.querySelector('.edit-email').addEventListener('click', e => {
    document.querySelector('.profile-form-section').classList.add('active-form');
    document.querySelector('.update-email-section').classList.add('active-section');
});
document.querySelector('.edit-address').addEventListener('click', e => {
    document.querySelector('.profile-form-section').classList.add('active-form');
    document.querySelector('.update-delivery-address-section').classList.add('active-section');
});
document.querySelectorAll('.back-link').forEach(backlink => {
    backlink.addEventListener('click', e => {
        setTimeout(() => {
            document.querySelector('.profile-form-section').classList.remove('active-form');
        },800);
        document.querySelector('.update-name-section').classList.remove('active-section');
        document.querySelector('.update-email-section').classList.remove('active-section');
        document.querySelector('.update-delivery-address-section').classList.remove('active-section');
    });
});
document.addEventListener("DOMContentLoaded", function() {
var scrollToTopLinks = document.querySelectorAll(".edit-link");
scrollToTopLinks.forEach(function(scrollToTopLink) {
    scrollToTopLink.addEventListener("click", function(event) {
        event.preventDefault();
        var offset = 100; // Adjust this value to set the space from the top
        var targetPosition = 0;
        var currentPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        var distance = currentPosition - targetPosition;
        var duration = 500; // Adjust this value to set the duration of the scroll animation

        var start = null;
        window.requestAnimationFrame(function step(timestamp) {
            if (!start) start = timestamp;
            var progress = timestamp - start;
            window.scrollTo(0, easeInOutQuad(progress, currentPosition, -currentPosition, duration, offset));
            if (progress < duration) window.requestAnimationFrame(step);
            else window.scrollTo(0, targetPosition + offset);
        });
    });
});
});

function easeInOutQuad(t, b, c, d, offset) {
t /= d / 2;
if (t < 1) return c / 2 * t * t + b;
t--;
return -c / 2 * (t * (t - 2) - 1) + b;
}