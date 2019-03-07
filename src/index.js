import $ from 'jquery';
import { throttle } from 'lodash';
import { Players } from './scripts/video-player';
import { Dimensions } from './scripts/dimensions';

const selectors = {
  root: '[name=root]',
  header: '[name=header]',
  work: '#work',
  project: '[name=project]',
  years: '[name=years]',
  year: '[name=year]',
  colorBoxes: '[name=colorBoxes]',
  colorBox: '[name=colorBox]',
  descriptionBoxes: '[name=descriptionBoxes]',
  descriptionBox: '[name=descriptionBox]',
  projectTitle: '[name=name]'
};

function createBoxes(root, total, name, classes) {
  for (let i = 0; i < total; i++) {
    root.append(`<div name="${name}" class="${classes}"></div>`);
  }
}

function colorize(elements, style) {
  elements.each((i) => {
    const hue = (360 / elements.length) * i;
    const color = `hsla(${hue}, 50%, 50%, 1)`;
    elements.eq(i).css(style, color);
  });
}

var documentReady = false;
const win = $(window);
const html = $('html');
const header = $(selectors.header);
const root = $(selectors.root);
const work = $(selectors.work);
const projects = $(selectors.project);
const yearsContainer = $('<div name="years" class="years"></div>');
const years = $(selectors.year);
const colorBoxContainer = $('<div name="colorBoxes" class="colors"></div>');
const descriptionBoxContainer = $('<div name="descriptionBoxes" class="description-boxes"></div>');
const dimensions = new Dimensions();

const yearsSizeRatio = 0.7;
const descriptionBoxRatio = 1.5;

// Move Year elements into their own container.
years.appendTo(yearsContainer);
root.prepend(yearsContainer);
root.prepend(colorBoxContainer);
root.append(descriptionBoxContainer);

createBoxes(colorBoxContainer, years.length, 'colorBox', 'color-box');
createBoxes(descriptionBoxContainer, years.length, 'descriptionBox', 'description-box');

const descriptionBoxes = $(selectors.descriptionBox);

colorize($(selectors.colorBox), 'background-color');
colorize(descriptionBoxes, 'background-color');
colorize($(selectors.projectTitle), 'background-color');
colorize(years, 'color');

var bottomPadding = 0;
const resizeBottomPadding = () => {
  // Calculate bottom padding so last item aligns to top of page.
  bottomPadding = win.height() - projects.last().outerHeight() - header.outerHeight();
  work.css('padding-bottom', bottomPadding);
};
// Get this close. We'll recalculate once the videos are loaded.
resizeBottomPadding();

// These should be calculated after DOM modifications.
const headerH = header.outerHeight();

const yearsH = yearsContainer.outerHeight();
const visibleH = years.last().outerHeight();
const boxesH = colorBoxContainer.outerHeight();

const resizeYears = () => {
  // Resize years to be a factor of their project height.
  projects.each((i) => {
    years.eq(i).height(projects.eq(i).outerHeight() * yearsSizeRatio);
  });
};
// Get these close. We'll recalculate once the videos are ready.
resizeYears();

const resizeDescriptionBoxes = () => {
  projects.each((i) => {
    let h = projects.eq(i).outerHeight() * descriptionBoxRatio;
    if (i === projects.length - 1) {
      // Add the bottom padding.
      h += bottomPadding;
    }
    descriptionBoxes.eq(i).height(h);
  });
}
resizeDescriptionBoxes();

// Setup video players.
const players = new Players();
players.init(work);

const parallax = () => {
  const scrolled = dimensions.scrollPercent();
  const yMove = (dimensions.scrollH * scrolled) * yearsSizeRatio;
  const dMove = (dimensions.scrollH * scrolled) * descriptionBoxRatio;
  const bMove = (boxesH - dimensions.viewportH) * scrolled;
  // console.log(scrolled, html.scrollTop(), dimensions.scrollH, yMove);

  yearsContainer.css('transform', `translateY(-${yMove}px)`);
  descriptionBoxContainer.css('transform', `translateY(-${dMove}px)`);
  colorBoxContainer.css('transform', `translateY(-${bMove}px)`);
};

const focusPlayers = throttle(players.focus.bind(players), 500, {leading: false, trailing: true});

const onScroll = () => {
  parallax();
  focusPlayers(dimensions.viewportH);
};

const ready = () => {
  if (players.ready && documentReady) {
    requestAnimationFrame(() => {
      console.log('PAGE READY');
      dimensions.update();
      resizeBottomPadding();
      resizeYears();
      resizeDescriptionBoxes();

      // Listen to scroll events on the body.
      onScroll();
      win.scroll(onScroll);
    });
  }
}

players.once('ready', () => {
  ready();
});

$(document).ready(() => {
  documentReady = true;
  ready();
});
