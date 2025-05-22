"use client";

import React from "react";
import $ from "jquery";
import { throttle } from "lodash";

import {
  PlayersInteractivity as Players,
  Dimensions,
  ProjectsInteractivity as Projects,
  selectors,
  Years,
  LeftColors,
  BackgroundColors,
  DrawingSwitcher,
  MenuInteractivity as Menu,
  ContactInteractivity as Contact,
  Logo,
} from "@/components";

const debug = false;

export function legacyInit() {
  const win = $(window);
  const header = $(selectors.header);
  const root = $(selectors.root);
  const work = $(selectors.work);
  const projects = $(selectors.project);
  const dimensions = new Dimensions();

  const log = function (...args: unknown[]) {
    if (debug) {
      console.log(...args);
    }
  };

  // Get the ids of all our projects.
  const data: { id: string | null; type: "video" | "audio" }[] = [];
  projects.each((_i, p) => {
    const id = p.getAttribute("id");
    const video = p.querySelector(selectors.videoPlaceholder);
    data.push({
      id: id,
      type: video ? "video" : "audio",
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

  let projectsHelper: Projects, players: Players, drawing: DrawingSwitcher;

  const parallax = () => {
    const scrolled = dimensions.scrollPercent();
    years.scroll(scrolled, dimensions.scrollH);
    colorsL.scroll(scrolled, dimensions.scrollH, dimensions.viewportH);
    drawing.scroll(scrolled);
  };

  const focusTracker = throttle(
    (viewportH) => {
      projectsHelper.testFocus.call(projectsHelper, viewportH);
    },
    500,
    { leading: false, trailing: true },
  );

  const start = () => {
    log("[start] begin");
    drawing.init();
    log("[start] drawing initialized");
    new Contact($(selectors.contact), "makecontact");
    log("[start] end");
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

  const onResize = throttle(
    () => {
      requestAnimationFrame(() => {
        dimensions.update();
        years.resize();
        drawing.resize();
        // Update the positions of everything.
        onScroll(true);
      });
    },
    500,
    { trailing: true, leading: false },
  );

  const logo = new Logo();

  // TODO The page scroll gets janky the further down the page we scroll.
  // See if there are any additional optimizations we can make.
  // Also take advantage of scroll hinting.

  // Once the logo is done animating, initialize the rest of our components.
  logo.once("ready", () => {
    // console.profileEnd();
    log("[logo ready] begin");
    projectsHelper = new Projects();
    players = new Players();
    drawing = new DrawingSwitcher($("body"));
    projectsHelper.init(work);
    log("[logo ready] project helper initialized");
    projectsHelper.on("focused", (i) => {
      requestAnimationFrame(() => {
        // const project = projects.eq(i);
        players.focus(i);
        years.focus(i);
      });
    });
    projectsHelper.testFocus(dimensions.viewportH);
    log("[logo ready] project helper first focus test");
    // Setup video players.
    players.init(work);
    players.on("ready", onResize);
    log("[logo ready] players initialized");
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        players.backgrounded();
      } else {
        players.foregrounded();
      }
    });
    win.on("resize", onResize);
    window.addEventListener("scroll", () => onScroll(false), { passive: true });
    // TODO We are missing this event.
    setTimeout(() => {
      log("[logo next frame] begin");
      start();
      onResize();
      log("[logo next frame] end");
    });
    log("[logo ready] end");
  });

  win.ready(() => {
    log("[window ready] begin");
    // console.profile();
    // Start the logo animation and wait for it to complete.
    logo.init();
    log("[window ready] end");
  });
}

export const Init = () => {
  React.useEffect(() => {
    legacyInit();
  }, []);
  return null;
};
