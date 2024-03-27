/**
 *  @class
 *  @function BackgroundVideo
 */
if (!customElements.get('background-video')) {
  class CustomVideo extends HTMLElement {
    constructor() {
      super();

      this.tl = false;
      this.splittext = false;
      this.paused = false;
      this.toggle = this.querySelector('.background-video__controls button');
    }
    connectedCallback() {
      let _this = this;

      // Video Support.
      this.video_container = this.querySelector('.video-section--container');

      if (this.video_container.querySelector('iframe')) {
        this.video_container.querySelector('iframe').onload = function() {
          _this.videoPlay();
        };
      }

      // Controls.
      if (this.toggle) {
        this.toggle.addEventListener('click', this.setupControlEvents.bind(this));
      }
    }
    disconnectedCallback() {
      if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
        this.tl.kill();
        this.splittext.revert();
      }
    }
    setupControlEvents() {
      if (this.paused) {
        this.videoPlay();
        if (this.toggle) {
          this.toggle.classList.remove('paused');
        }
      } else {
        this.videoPause();
        if (this.toggle) {
          this.toggle.classList.add('paused');
        }
      }
    }
    videoPlay() {
      setTimeout(() => {
        console.log(this.video_container.dataset.provider)
        if (this.video_container.dataset.provider === 'youtube') {
          this.video_container.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            event: "command",
            func: "playVideo",
            args: ""
          }), "*");
        } else if (this.video_container.dataset.provider === 'vimeo') {
          this.video_container.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            method: "play"
          }), "*");
        } else if (this.video_container.dataset.provider === 'hosted') {
          this.video_container.querySelector('video').play();
        }

        this.paused = false;
      }, 10);
    }
    videoPause() {
      console.log(this.video_container.dataset.provider)

      setTimeout(() => {
        if (this.video_container.dataset.provider === 'youtube') {
          this.video_container.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            event: "command",
            func: "pauseVideo",
            args: ""
          }), "*");
        } else if (this.video_container.dataset.provider === 'vimeo') {
          this.video_container.querySelector('iframe').contentWindow.postMessage(JSON.stringify({
            method: "pause"
          }), "*");
        } else if (this.video_container.dataset.provider === 'hosted') {
          this.video_container.querySelector('video').pause();
        }

        this.paused = true;
      }, 10);
    }
  }
  customElements.define('custom-video', CustomVideo);
}