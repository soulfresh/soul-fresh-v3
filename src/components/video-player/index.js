import $ from 'jquery';
import EventEmitter from 'eventemitter3';
import { selectors } from '../selectors';

export class Players extends EventEmitter {
  constructor() {
    super();
    this.ready = false;
    this.paused = true;
    this.muted = false;
    this._backgrounded = false;
    this.nativeControls = false;
    this.errors = false;
    this.progressSpeed = 1000;
    // The PROJECT element that is focused.
    this.focused = null;
    this.debug = false;
  }

  log() {
    if (this.debug) {
      console.log(...arguments);
    }
  }

  init(root) {
    this.root = root;
    this.projects = $(selectors.project);
    this.videoContainers = $(this.root).find(selectors.container);
    this.videos = this.videoContainers.find(selectors.video);
    this.muteButtons = this.videoContainers.find(selectors.videoMute);
    this.notifyWhenReady();
    this.initPlayerButtons();
    this.lastProgressEvent = Date.now();

    this.onVideoProgress = this.updateVideoProgress.bind(this);

    // If we're starting out muted.
    if (this.muted) {
      this.muteAll();
    }

    // If we're starting out paused.
    if (this.paused) {
      this.setGlobalPausedState(true);
    }

    // Load a larger video if necessary.
    this.updateVideoDimensions();

    if (this.debug) {
      this.onAbort          = () => this.log('abort', ...arguments);
      this.onEmptied        = () => this.log('emptied', ...arguments);
      this.onError          = () => this.log('error', ...arguments);
      this.onCanPlay        = () => this.log('canplay', ...arguments);
      this.onCanPlayThrough = () => this.log('canplaythrough', ...arguments);
      this.onLoadedData     = () => this.log('loadeddata', ...arguments);
      this.onLoadedMetadata = () => this.log('loadedmetadata', ...arguments);
      this.onLoadStart      = () => this.log('loadstart', ...arguments);
      this.onSuspend        = () => this.log('suspend', ...arguments);
      this.onStalled        = () => this.log('stalled', ...arguments);
      this.onWaiting        = () => this.log('waiting', ...arguments);
      this.onPlaying        = () => this.log('playing', ...arguments);
      this.onPlay           = () => this.log('play', ...arguments);
      this.onPause          = () => this.log('pause', ...arguments);
    }
  }

  updateVideoDimensions() {
    // Update the dimensions of all the videos.
    const small = 640;
    const overThreshold = 1.0;
    const first = this.videos[0];

    if (first.clientWidth > small * overThreshold) {
      this.videos.each((i, v) => {
        const root = v.getAttribute('data-root');
        const large = v.getAttribute('data-large').split('||');
        // const small = v.getAttribute('data-small').split('||');

        $(v).find('source').each((j, s) => {
          const url = `${root}/${large[j]}`;
          s.setAttribute('src', url);
        });
        v.load();
      });
    }
  }

  updateVideoProgress() {
    this.lastProgressEvent = Date.now();
  }

  checkProgress() {
    // TODO Mute when window is backgrounded
    // TODO After enough data is loaded for the current video, start
    // preloading the next video.
    // TODO Test how quickly download is happening. If it's pretty fast
    // and the screen is large enough, boost the video quality for all videos.
    // Also do the inverse if downloads are slow.
    console.log('check progress');
    if (this.focused && !this.paused) {
      const v = this.focused[0].querySelector('video');
      const now = Date.now();

      if (now >= this.lastProgressEvent + this.progressSpeed) {
        this.log(`slow progress: ${now} >= ${this.lastProgressEvent + this.progressSpeed} = true`);
        this.loadingState(v);
      }
      else {
        this.log(`normal progress: ${now} >= ${this.lastProgressEvent + this.progressSpeed} = false`);
        if (!v.paused) {
          this.playingState(v);
        } else {
          this.pausedState(v);
        }
      }

      this.lastProgressEvent = now;
    }
  }

  listenToStateChanges(v) {
    // Turn on the loading state immediately.
    this.loadingState(v);

    // TODO Do this in a request animation frame so it will pause when backgrounded.
    this.interval = setInterval(this.checkProgress.bind(this), this.progressSpeed);
    v.addEventListener('timeupdate', this.onVideoProgress);

    if (this.debug) {
      v.addEventListener('abort'          , this.onAbort);
      v.addEventListener('emptied'        , this.onEmptied);
      v.addEventListener('error'          , this.onError);
      v.addEventListener('canplay'        , this.onCanPlay);
      v.addEventListener('canplaythrough' , this.onCanPlayThrough);
      v.addEventListener('loadedata'      , this.onLoadedData);
      v.addEventListener('loadedmetadata' , this.onLoadedMetadata);
      v.addEventListener('loadstart'      , this.onLoadStart);
      v.addEventListener('suspend'        , this.onSuspend);
      v.addEventListener('stalled'        , this.onStalled);
      v.addEventListener('waiting'        , this.onWaiting);
      v.addEventListener('playing'        , this.onPlaying);
      v.addEventListener('play'           , this.onPlay);
      v.addEventListener('pause'          , this.onPause);
    }
  }

  removeStateChanges(v) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    v.removeEventListener('timeupdate', this.onVideoProgress);

    if (this.debug) {
      v.removeEventListener('abort'          , this.onAbort);
      v.removeEventListener('emptied'        , this.onEmptied);
      v.removeEventListener('error'          , this.onError);
      v.removeEventListener('canplay'        , this.onCanPlay);
      v.removeEventListener('canplaythrough' , this.onCanPlayThrough);
      v.removeEventListener('loadedata'      , this.onLoadedData);
      v.removeEventListener('loadedmetadata' , this.onLoadedMetadata);
      v.removeEventListener('loadstart'      , this.onLoadStart);
      v.removeEventListener('suspend'        , this.onSuspend);
      v.removeEventListener('stalled'        , this.onStalled);
      v.removeEventListener('waiting'        , this.onWaiting);
      v.removeEventListener('playing'        , this.onPlaying);
      v.removeEventListener('play'           , this.onPlay);
      v.removeEventListener('pause'          , this.onPause);
    }
  }

  notifyWhenReady() {
    this.videos.each((i, v) => {
      if (v.readyState > 0) {
        this.ready = true;
      } else {
        v.addEventListener('loadedmetadata', (event) => {
          this.ready = true;
          this.emit('ready');
        });
      }
    });

    if (this.ready) {
      this.emit('ready');
    }
  }

  initPlayerButtons() {
    if (!this.nativeControls) {
      this.videoContainers.on('click', (event) => {
        const target = event.currentTarget;
        const video = target.querySelector(selectors.video);
        const project = $(target).closest(selectors.project);
        if (video.paused) {
          this.paused = false;
          this.play(project);
          this.setGlobalPausedState(false);
        } else {
          this.paused = true;
          this.pause(project);
          this.setGlobalPausedState(true);
        }
      });

      this.muteButtons.on('click', (event) => {
        event.stopPropagation();
        const target = event.currentTarget;
        const video = target.querySelector(selectors.video);
        const project = $(target).closest(selectors.project);
        this.muted = !this.muted;
        if (this.muted) {
          this.muteAll();
        } else {
          this.unmuteAll();
        }
      });
    }
  }

  setGlobalPausedState(paused = true) {
    if (paused) {
      $(document.body).addClass('media-paused');
    } else {
      $(document.body).removeClass('media-paused');
    }
  }

  setGlobalMutedState(muted = true) {
    if (muted) {
      document.body.classList.add('media-muted');
    } else {
      document.body.classList.remove('media-muted');
    }
  }

  disableCustomPlayButtons() {
    this.videoContainers.off('click');
  }

  muteAll() {
    this.changeAllMuteStates(true);
  }

  unmuteAll() {
    this.changeAllMuteStates(false);
  }

  changeAllMuteStates(muted = true) {
    this.videos.each((i, v) => {
      v.muted = muted;
    });
    this.muted = muted;
    this.setGlobalMutedState(this.muted);
    // if (muted) {
    //   document.body.classList.add('media-muted');
    // } else {
    //   document.body.classList.remove('media-muted');
    // }
  }

  pauseAllOthers(project) {
    for (let i = 0; i < this.projects; i++) {
      const p = this.projects[i];
      if (p[0] !== project[0]) {
        this.pause(p);
      }
    }
  }

  showAllControls() {
    this.disableCustomPlayButtons();
    this.videos.each((i, v) => v.controls = true);
    this.nativeControls = true;
    document.body.classList.add('show-native-media-controls');
  }

  useNativeControls() {
    this.log('Reverting to native video controls.');
    this.unmuteAll();
    this.showAllControls();
    if (this.focused) {
      const video = this.focused[0].querySelector('video');
      this.removeStateChanges(video);
    }
  }

  playingState(video) {
    const container = $(video).closest(selectors.container)
    container.addClass('playing');
    container.removeClass('loading');
  }

  pausedState(video) {
    const container = $(video).closest(selectors.container);
    container.removeClass('playing');
    container.removeClass('loading');
  }

  loadingState(video) {
    const container = $(video).closest(selectors.container);
    container.removeClass('playing');
    container.addClass('loading');
  }

  focus(project) {
    // Compare against the video node (rather than the jquery object)
    // because we know the video node won't change.
    if (this.focused && this.focused[0] !== project[0]) {
      this.pause(this.focused);
    }

    // If the project being focused has a video, store it
    // as the focused element. Otherwise, clear our currently
    // focused project because we don't care about this project.
    const video = project[0].querySelector('video');
    if (video) {
      this.focused = project;
      this.play(project);
    } else {
      this.focused = null;
    }
  }

  unfocus(project) {
    // If the project being unfocused is the item we currently have
    // as the focused project, clear the focused project. Otherwise,
    // leave the focused project alone.
    if (this.focused && this.focused[0] === project[0]) {
      this.focused = null;
    }

    this.pause(project);
  }

  backgrounded() {
    this._backgrounded = true;
    if (this.focused) {
      this.pause(this.focused);
    }
  }

  foregrounded() {
    this._backgrounded = false;
    if (this.focused) {
      console.log('restarting the focused player', this.focused);
      this.play(this.focused);
    }
  }

  play(project) {
    // Do the auto play functionality if we're using the custom
    // controls and we haven't globally paused video playback.
    if (!this.nativeControls && !this.paused) {
      this.pauseAllOthers(project);

      const video = project[0].querySelector('video');
      if (video.paused) {
        this.listenToStateChanges(video);
        const result = video.play();
        if (result && result.catch) {
          result
            .then(() => this.log('Playback started the first time.'))
            .catch((e) => {
              this.log('1. Could not play...trying again', e.name, e.message);
              this.errors = true;
              this.muteAll();

              video.play()
                .then(() => this.log('Playback started the second time.'))
                .catch((e) => {
                  this.log('2. Could not play video', e.name, e.message);
                  this.useNativeControls();
                })
              ;
            })
          ;
        }
      }
    }
  }

  pause(project) {
    const video = project[0].querySelector('video');
    if (!video.paused) {
      video.pause();
      this.removeStateChanges(video);
      this.pausedState(video);
    }
  }

  // Can be used to dynamically attach a video to the page.
  show(project) {
    const video = project.find(selectors.video);

    if (video.length < 1) {
      const image = project.find(selectors.poster);
      const container = project.find(selectors.container);
      const poster = image.attr('data-poster');
      const sources = image.attr('data-small-sd').split('||');
      const root = image.attr('data-root');

      // Generate the video element.
      const video = $(
        `<video name="video" loop preload="auto" poster=${poster}></video>`
      );
      sources.forEach((s) => {
        const parts = s.split('.');
        const type = parts[parts.length - 1];
        video.append(`<source src="${root}/${s}" type="video/${type}"></source>`);
      });

      // Remove the image.
      // TODO Don't remove the image because it causes a content flash.
      image.remove();

      // Add the video element.
      container.append(video);

      // Update the list of videos.
      this.videos = this.videoContainers.find(selectors.video);
    }
  }
}
