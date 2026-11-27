import { data as projectsData } from "./data";

// Sort and augment projects as in layout.pug
export const projects = [...(projectsData.projects || [])];
projects.sort((a, b) => Number(b.year) - Number(a.year));

if (!projects.find((p) => p.preview?.type === "experience")) {
  projects.push({
    id: "experience",
    name: "Me",
    year: "About",
    preview: {
      type: "experience",
      meta: projectsData.about,
    },
    description: "",
    tools: [],
    color: "",
    company: "",
    positions: [],
    clients: [],
    links: [],
  });
}
if (!projects.find((p) => p.preview?.type === "contact")) {
  projects.push({
    id: "contact",
    name: "Me",
    year: "Contact",
    preview: {
      type: "contact",
      meta: projectsData.about,
    },
    description: "",
    tools: [],
    color: "",
    company: "",
    positions: [],
    clients: [],
    links: [],
  });
}

/** Projects shown on the home page (the ones rendered as `[name=project]`). */
export const visibleProjects = projects.filter(
  (p) => p.enabled === undefined || p.enabled === true,
);
