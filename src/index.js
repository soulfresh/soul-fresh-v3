import $ from 'jquery';
import { throttle } from 'lodash';
import { Players } from './components/video-player';
import { Dimensions } from './components/dimensions';
import { Projects } from './components/projects';
import { selectors } from './components/selectors';
import { Years } from './components/years';
import { LeftColors, RightColors } from './components/color-boxes';
import { BackgroundColors } from './components/background-colors';
import {
  DrawingSwitcher,
  SineWaveDrawing,
  BoxesDrawing,
  TriangleDrawing
} from './components/background-drawing';
import { Menu } from './components/menu';
import { Contact } from './components/contact';
import { Logo } from './components/logo';

let debug = false;
let initialized = false;
const win = $(window);
const header = $(selectors.header);
const root = $(selectors.root);
const work = $(selectors.work);
const projects = $(selectors.project);
const dimensions = new Dimensions();

const log = function() {
  if (debug) {
    console.log(arguments);
  }
};

// Get the ids of all our projects.
const data = [];
projects.each((i, p) => {
  const id = p.getAttribute('id');
  const video = p.querySelector(selectors.videoPlaceholder);

  data.push({
    id: id,
    type: video ? 'video' : 'audio'
  });
});

const colorsL = new LeftColors(root, data);
colorsL.init();

const years = new Years(root);
years.init();

const bgColors = new BackgroundColors(root, data);
bgColors.init();

const menu = new Menu(header);
menu.init();

var projectsHelper, players, drawing;

const parallax = () => {
  const scrolled = dimensions.scrollPercent();

  years.scroll(scrolled, dimensions.scrollH, dimensions.viewportH);
  colorsL.scroll(scrolled, dimensions.scrollH, dimensions.viewportH);
  drawing.scroll(scrolled);
};

const focusTracker = throttle(
  (viewportH) => {
    projectsHelper.testFocus.call(projectsHelper, viewportH)
  },
  500,
  {leading: false, trailing: true}
);

const start = () => {
  log('[start] begin');
  drawing.init();
  log('[start] drawing initialized');
  const contact = new Contact($('#contact [name=cSlot]'), 'makecontact');
  initialized = true;
  log('[start] end');
};

const onScroll = (resizing = false) => {
  requestAnimationFrame(() => {
    parallax();
    focusTracker(dimensions.viewportH);
    if (!resizing) {
      menu.close();
    }
  });
};

const onResize = throttle(() => {
    requestAnimationFrame(() => {
      dimensions.update();
      years.resize();
      drawing.resize();

      // Update the positions of everything.
      onScroll(true);
    });
  },
  500,
  {trailing: true, leading: false}
);

const logo = new Logo();

// TODO The page scroll gets janky the further down the page we scroll.
// See if there are any additional optimizations we can make.
// Also take advantage of scroll hinting.

// Once the logo is done animating, initialize the rest of our components.
logo.once('ready', () => {
  // console.profileEnd();
  log('[logo ready] begin');
  projectsHelper = new Projects();
  players = new Players();

  drawing = new DrawingSwitcher($('body'));

  projectsHelper.init(work);
  log('[logo ready] project helper initialized');

  projectsHelper.on('focused', (i) => {
    requestAnimationFrame(() => {
      const project = projects.eq(i);
      players.focus(i);
      years.focus(i);
    });
  });
  projectsHelper.testFocus(dimensions.viewportH);
  log('[logo ready] project helper first focus test');

  // Setup video players.
  players.init(work);
  players.on('ready', onResize);
  log('[logo ready] players initialized');

  document.addEventListener('visibilitychange', (e) => {
    if (document.hidden) {
      players.backgrounded();
    } else {
      players.foregrounded();
    }
  });

  win.on('resize', onResize);
  window.addEventListener('scroll', () => onScroll(false), {passive: true});

  // TODO We are missing this event.
  setTimeout(() => {
    log('[logo next frame] begin');
    start();
    onResize();
    log('[logo next frame] end');
  });
  log('[logo ready] end');
});

win.ready(() => {
  log('[window ready] begin');
  // console.profile();
  // Start the logo animation and wait for it to complete.
  logo.init();
  log('[window ready] end');
});

