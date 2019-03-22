import $ from 'jquery';
import { throttle } from 'lodash';
import { Players } from './components/video-player';
import { Dimensions } from './components/dimensions';
import { Projects } from './components/projects';
import { selectors } from './components/selectors';
import { Years } from './components/years';
import { LeftColors, RightColors } from './components/left-colors';

var documentReady = false;
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

const colorsR = new RightColors(root, projectIds);
colorsR.init();

const years = new Years(root);
years.init();

const resizeBottomPadding = () => {
  // Calculate bottom padding so last item aligns to top of page.
  work.css('padding-bottom', dimensions.bottomPadding);
};
// Get this close. We'll recalculate once the videos are loaded.
resizeBottomPadding();

colorsL.resize();
colorsR.resize();

const projectsHelper = new Projects();
projectsHelper.init(work);

projectsHelper.on('focused', (i) => {
  const project = projects.eq(i);
  players.focus(project);
  years.focus(i);
});

projectsHelper.on('hidden', (i) => {
  years.unfocus(i);
});

// Setup video players.
const players = new Players();
players.init(work);

const parallax = () => {
  const scrolled = dimensions.scrollPercent();

  years.scroll(scrolled, dimensions.scrollH);
  colorsR.scroll(scrolled, dimensions.scrollH);
  colorsL.scroll(scrolled, dimensions.scrollH);
};

const focusTracker = throttle(
  projectsHelper.testFocus.bind(projectsHelper),
  500,
  {leading: false, trailing: true}
);

const onScroll = () => {
  parallax();
  focusTracker(dimensions.viewportH);
};

const onResize = () => {
  dimensions.update();
  resizeBottomPadding();
  years.resize();
  colorsR.resize();

  // Update the positions of everything.
  onScroll();
};

const ready = () => {
  requestAnimationFrame(() => onResize());
}

players.on('ready', () => ready());

win.on('load', () => {
  documentReady = true;
  ready();
});

win.on('resize', onResize);
win.scroll(onScroll);

