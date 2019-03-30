import $ from 'jquery';
import { throttle } from 'lodash';
import { Players } from './components/video-player';
import { Dimensions } from './components/dimensions';
import { Projects } from './components/projects';
import { selectors } from './components/selectors';
import { Years } from './components/years';
import { LeftColors, RightColors } from './components/color-boxes';
import { BackgroundColors } from './components/background-colors';
import { SineWaveDrawing } from './components/background-drawing';
import { Menu } from './components/menu';
import { Contact } from './components/contact';
import { Logo } from './components/logo';

let initialized = false;
const win = $(window);
const header = $(selectors.header);
const root = $(selectors.root);
const work = $(selectors.work);
const projects = $(selectors.project);
const dimensions = new Dimensions();

// Get the ids of all our projects.
const projectIds = [];
projects.each((i, p) => {
  projectIds.push(p.getAttribute('id'));
});

const colorsL = new LeftColors(root, projectIds);
colorsL.init();

const years = new Years(root);
years.init();

const bgColors = new BackgroundColors(root, projectIds);
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
  drawing.init();
  const contact = new Contact($('#contact [name=cSlot]'), 'makecontact');
  initialized = true;
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

// Once the logo is done animating, initialize the rest of our components.
logo.once('ready', () => {
  projectsHelper = new Projects();
  players = new Players();
  drawing = new SineWaveDrawing($('body'), projectIds);

  projectsHelper.init(work);
  projectsHelper.on('focused', (i) => {
    requestAnimationFrame(() => {
      const project = projects.eq(i);
      players.focus(project);
      years.focus(i);
    });
  });
  projectsHelper.testFocus(dimensions.viewportH);

  // Setup video players.
  players.init(work);
  players.on('ready', onResize);

  document.addEventListener('visibilitychange', (e) => {
    if (document.hidden) {
      players.backgrounded();
    } else {
      players.foregrounded();
    }
  });

  win.on('load', () => {
    start();
    onResize();
  });

  win.on('resize', onResize);
  win.scroll(() => onScroll(false));
});

// Start the logo animation and wait for it to complete.
logo.init();

