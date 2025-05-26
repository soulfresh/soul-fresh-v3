interface Link {
  name: string;
  url: string;
}

interface Preview {
  type: string;
  meta?: unknown;
  src?: {
    large: string[];
    small: string[];
  };
}

export interface Project {
  id: string;
  name: string;
  tools: string[];
  year: string | number;
  color: string;
  company: string;
  positions: string[];
  team?: number;
  clients: string[];
  description: string;
  links: Link[];
  preview: Preview;
  enabled?: boolean;
}

interface About {
  contact: string;
  available: boolean;
  bio: string;
  practices: string[];
  technologies: string[];
  frameworks: string[];
  software: string[];
  languages: string[];
  linkedin: string;
  github: string;
}

export interface ProjectsData {
  about: About;
  projects: Project[];
}

export const data: ProjectsData = {
  about: {
    contact: "makecontact",
    available: true,
    bio: "I enjoy building products that delight users. I am tests first and work well in collaborative and creative environments. I believe customer research is key to understanding what you should build next, prototyping will help you deliver a great product the first time and metrics must be your gauge of success. I provide leadership and believe in empowering others.",
    practices: [
      "Agile",
      "TDD",
      "UI/UX Design",
      "REST",
      "SOA",
      "Product Management",
      "User Testing",
      "Team Management",
      "Audio Production",
      "Video Production",
    ],
    technologies: ["ESP32", "OpenGL", "WebRTC", "Bluetooth", "MIDI", "OSC"],
    frameworks: [
      "React Native",
      "React",
      "Expo",
      "Next.js",
      "Vue.js",
      "Angular",
      "NodeJS",
      "D3",
      "Juce",
      "Processing",
      "OpenFrameworks",
      "Arduino",
      "Jest",
      "Google Test",
      "Docker",
      "Postgres",
      "MySQL",
    ],
    software: [
      "After Effects",
      "FinalCut Pro",
      "Illustrator",
      "Photoshop",
      "Flash",
      "Cubase",
      "ProTools",
      "Ableton Live",
    ],
    languages: ["Typescript", "C++", "GraphQL", "Java", "PHP", "SQL"],
    linkedin: "https://www.linkedin.com/in/marcwren/",
    github: "https://github.com/soulfresh",
  },
  projects: [
    {
      id: "aptsnap",
      name: "Apt Snap!",
      tools: ["React Native", "Typescript", "Expo", "GraphQL", "OAuth"],
      year: 2025,
      color: "#76b4dc",
      company: "Apartment Snapshot",
      positions: ["Software Lead"],
      team: 3,
      clients: [],
      description: `
An iOS/Android/Web app for metrics reporting in the apartment rental industry.
The app provides executive level reporting accross multiple properties as well as
detailed reporting for on-site property personnel. Designed with a
user-centric approach, the app transforms the typically mundane task of metrics
tracking into an engaging experience. Key features include
performance-based bonus tracking, achievement awards, real-time mobile
notifications, and location-aware reporting capabilities.
`,
      links: [
        {
          name: "Apartment Snapshot",
          url: "https://www.apartmentsnapshot.com/",
        },
      ],
      preview: {
        type: "video",
        meta: {
          // img: "Zespri.jpg",
          img: "AptSnap.jpg",
        },
        src: {
          // large: ["Zespri 960 x 720.webm", "Zespri 960 x 720.mp4"],
          large: ["AptSnap 960 x 720.webm", "AptSnap 960 x 720.mp4"],
          // small: ["Zespri 640 x 480.webm", "Zespri 640 x 480.mp4"],
          small: ["AptSnap 640 x 480.webm", "AptSnap 640 x 480.mp4"],
          // small: ["AptSnap 720 x 480.webm", "AptSnap 720 x 480.mp4"],
        },
      },
    },
    {
      id: "self-tour",
      name: "PowerPro Self Tours",
      tools: ["Typescript", "Next.js"],
      year: 2024,
      color: "#76b4dc",
      company: "PowerPro Leasing",
      positions: ["Software Developer"],
      team: 3,
      clients: [],
      description: `
PowerPro Self Tours offer apartment seekers a simple, mobile self tour
experience. Schedule a self tour on any of the industry standard apartment
rental platforms. Then receive an SMS/email link to a personalized tour
with interactive property map, remote door access, customized quotes and detailed
information about the property.
`,
      links: [
        {
          name: "PowerPro Self Tours",
          url: "https://powerproleasing.com/self-tour/",
        },
      ],
      preview: {
        type: "video",
        meta: {
          img: "PowerPro Self Tour.jpg",
        },
        src: {
          large: [
            "PowerPro Self Tour 960 x 720.webm",
            "PowerPro Self Tour 960 x 720.mp4",
          ],
          small: [
            "PowerPro Self Tour 640 x 480.webm",
            "PowerPro Self Tour 640 x 480.mp4",
          ],
        },
      },
    },
    {
      id: "spider-points",
      name: "Spider Points Plugin",
      tools: ["C++", "OpenGL", "FFGL"],
      year: 2023,
      color: "#76b4dc",
      company: "Now We're In Stereo",
      positions: ["Software Developer"],
      team: 1,
      clients: [],
      description: `
    A VJ plugin for Resolume and other FFGL compatible software. The plugin
    generates a randomized web of points that animate in 3D space with various
    animations that can be synced to audio/midi.

    "Elevate your live visuals with this dynamic source plugin, where weird and
    wonderful shapes dance to the beat, creating a visually immersive experience."
    `,
      links: [
        {
          name: "Juicebar Plugins",
          url: "https://get-juicebar.com/detail/spider-points",
        },
      ],
      preview: {
        type: "video",
        meta: {
          img: "Spider Points.jpg",
        },
        src: {
          large: [
            "Spider Points 960 x 540.webm",
            "Spider Points 960 x 540.mp4",
          ],
          small: [
            "Spider Points 640 x 360.webm",
            "Spider Points 640 x 360.mp4",
          ],
        },
      },
    },
    {
      id: "moongold",
      name: "Moongold Music",
      tools: ["React", "NodeJS", "Vite", "Google Sheets API", "Firebase"],
      year: 2022,
      color: "#76b4dc",
      company: "Moongold",
      positions: ["Software Developer"],
      team: 1,
      clients: [],
      description: `
    Band website for Moongold. Dynamically generated based
    on the artist catalog in Google Sheets. The band can add new releases in the
    spreadsheet and run a CLI program to generate release
    assets and deploy the update to Google Firebase.
    `,
      links: [
        {
          name: "Moongold",
          url: "https://moongoldmusic.com/",
        },
      ],
      preview: {
        type: "video",
        meta: {
          img: "Moongold.jpg",
        },
        src: {
          large: ["Moongold 960 x 720.webm", "Moongold 960 x 720.mp4"],
          small: ["Moongold 640 x 480.webm", "Moongold 640 x 480.mp4"],
        },
      },
    },
    {
      id: "collection-builder",
      name: "Collection Builder",
      tools: ["React", "Hasura GraphQL", "Docker", "Postgres"],
      year: 2020,
      color: "#76b4dc",
      company: "Nine Dot Arts",
      positions: ["Software Developer"],
      team: 1,
      clients: [],
      description: `
Nine Dot Arts is a leading art consultancy that provides art curation and management services for
public and private spaces. The Collection Builder app allows curators to manage art installations
by searching artworks and laying them out in a virtual space. Projects can then be printed or 
shared with clients for review.
`,
      links: [],
      preview: {
        type: "video",
        meta: {
          img: "Collection Builder.jpg",
        },
        src: {
          large: [
            "Collection Builder 960 x 720.webm",
            "Collection Builder 960 x 720.mp4",
          ],
          small: [
            "Collection Builder 640 x 480.webm",
            "Collection Builder 640 x 480.mp4",
          ],
        },
      },
    },
    {
      id: "stagency",
      name: "Stagency",
      tools: ["React", "Hasura GraphQL", "Docker", "Postgres"],
      year: 2021,
      color: "#76b4dc",
      company: "Stagency",
      positions: ["Software Lead"],
      team: 2,
      clients: [],
      description: `
Prototype web application for artist tour scheduling and management. The app
helps tour managers calculate expenses and profit margins as well as manage
show schedule and logistics.
`,
      links: [],
      preview: {
        type: "video",
        meta: {
          img: "Stagency.jpg",
        },
        src: {
          large: ["Stagency 960 x 720.webm", "Stagency 960 x 720.mp4"],
          small: ["Stagency 640 x 480.webm", "Stagency 640 x 480.mp4"],
        },
      },
    },
    {
      id: "zespri",
      name: "Zespri",
      tools: ["Vue.js", "Javascript", "SCSS"],
      year: 2019,
      color: "#76b4dc",
      company: "LRXD",
      positions: ["Software Developer"],
      team: 3,
      clients: ["Zespri"],
      description:
        "Responsive microsite for Zespri's 2019 Wander & Win campaign.",
      links: [],
      preview: {
        type: "video",
        meta: {
          img: "Zespri.jpg",
        },
        src: {
          large: ["Zespri 960 x 720.webm", "Zespri 960 x 720.mp4"],
          small: ["Zespri 640 x 480.webm", "Zespri 640 x 480.mp4"],
        },
      },
    },
    {
      id: "flash",
      name: "Flash Development",
      tools: ["Actionscript", "Javascript", "Flash", "After Effects"],
      year: 2003,
      color: "#76b4dc",
      company: "Xylem Interactive",
      positions: ["Designer", "Web Developer", "Animator"],
      team: 4,
      clients: ["Chipotle", "McDonalds", "Jeppesen", "Red Robin"],
      description:
        "Design, animation and web development for Xylem Interactive, a Flash focused digital web adgency.",
      links: [],
      preview: {
        type: "video",
        meta: {
          img: "Flash.jpg",
        },
        src: {
          large: ["Flash 960 x 720.webm", "Flash 960 x 720.mp4"],
          small: ["Flash 640 x 480.webm", "Flash 640 x 480.mp4"],
        },
      },
    },
    {
      id: "opengl",
      name: "OpenGL",
      tools: [
        "Processing",
        "OpenFrameworks",
        "OpenGL",
        "FreeFrame",
        "C++",
        "Java",
      ],
      year: 2008,
      color: "#ec3b02",
      company: "sfFreeFrame",
      positions: [],
      clients: [],
      description:
        "3d video plugins for video and VJ software using the FreeFrame plugin architecture.",
      links: [],
      preview: {
        type: "video",
        meta: {
          img: "OpenGL.jpg",
        },
        src: {
          large: ["OpenGL Work 960 x 720.webm", "OpenGL Work 960 x 720.mp4"],
          small: ["OpenGL Work 640 x 480.webm", "OpenGL Work 640 x 480.mp4"],
        },
      },
    },
    {
      id: "beatport",
      name: "Beatport",
      tools: ["Actionscript", "Javascript", "PHP", "MySQL"],
      year: 2007,
      color: "#99cf00",
      company: "Beatport",
      positions: [
        "Product Manager",
        "Director of Software Development",
        "Software Developer",
      ],
      team: 20,
      clients: [],
      description: `
Flash and HTML based eCommerce applications built for DJs. Scalable REST based
SOA that processed thousands of transactions and tens of thousands of audio
streams a day. Held positions as Product Manager for Beatport and Beatport Sounds,
Director of Software Development and Software Team Lead.
`,
      links: [
        {
          name: "Beatport",
          url: "https://www.beatport.com/",
        },
      ],
      preview: {
        type: "video",
        meta: {
          img: "Beatport.jpg",
        },
        src: {
          large: ["Beatport 960 x 720.webm", "Beatport 960 x 720.mp4"],
          small: ["Beatport 640 x 480.webm", "Beatport 640 x 480.mp4"],
        },
      },
    },
    {
      id: "powerpro",
      name: "PowerPro Dashboard",
      tools: ["Angular", "D3", "Typescript", "SCSS", "Jasmine"],
      year: 2018,
      color: "#5fa3ec",
      company: "PowerPro Leasing",
      positions: ["Software Developer"],
      team: 3,
      clients: [],
      links: [
        {
          name: "PowerPro Leasing",
          url: "http://www.powerproleasing.com/",
        },
      ],
      description: `
Responsive reporting dashboard for PowerPro Leasing, a unified
platform for prospect management in the apartment rental industry. The
dashboard provides property managers with actionable insights by summarizing
prospect engagement and conversion metrics. Key features include PDF/CSV
export, automated email reporting, custom responsive 
charts, and fully customizable dashboards.
`,
      preview: {
        type: "video",
        meta: {
          img: "PowerPro.jpg",
        },
        src: {
          large: ["PowerPro 960 x 720.webm", "PowerPro 960 x 720.mp4"],
          small: ["PowerPro 640 x 480.webm", "PowerPro 640 x 480.mp4"],
        },
      },
    },
    {
      id: "bitmod",
      name: "BitMod",
      tools: [
        "C++",
        "Arduino",
        "ESP32",
        "NodeJS",
        "Javascript",
        "Vue.js",
        "Jasmine",
        "Google Test",
      ],
      year: 2019,
      color: "#d5df7e",
      company: "BitMod",
      positions: [],
      clients: [],
      links: [],
      description:
        "Software and hardware for intuitive control of lighting, video and sound. Microcontroller development using ESP32 and Arduino. Product design and fabrication.",
      preview: {
        type: "video",
        meta: {
          img: "BitMod2.jpg",
        },
        src: {
          large: ["BitMod 960 x 540.webm", "BitMod 960 x 540.mp4"],
          small: ["BitMod 640 x 360.webm", "BitMod 640 x 360.mp4"],
        },
      },
    },
    {
      id: "foxden",
      name: "FoxDen",
      tools: [
        "AngularJS",
        "Ionic",
        "SASS",
        "NodeJS",
        "WebRTC",
        "Bluetooth",
        "Jitsi Meet",
        "Mocha/Chai",
      ],
      year: 2016,
      color: "#5695ab",
      company: "ReadyTalk",
      positions: ["Software Developer"],
      team: 10,
      clients: [],
      links: [],
      description: `
WebRTC based video conferencing web and mobile application. Custom hardware with
Bluetooth discovery of nearby meeting rooms. Android and iOS apps for remote
control of video conferencing hardware and mobile meetings.
`,
      preview: {
        type: "video",
        meta: {
          img: "Foxden.jpg",
        },
        src: {
          large: ["Foxden 960 x 720.webm", "Foxden 960 x 720.mp4"],
          small: ["Foxden 640 x 480.webm", "Foxden 640 x 480.mp4"],
        },
      },
    },
    {
      id: "ello",
      name: "Ello",
      tools: ["Javascript", "LESS", "Mocha"],
      year: 2015,
      color: "#000000",
      company: "Ello",
      positions: ["Software Developer"],
      team: 8,
      clients: [],
      description:
        "Privacy focused social networking site with a large community of designers, artists and musicians.",
      links: [],
      preview: {
        type: "video",
        meta: {
          img: "Ello.jpg",
        },
        src: {
          large: ["Ello 960 x 720.webm", "Ello 960 x 720.mp4"],
          small: ["Ello 640 x 480.webm", "Ello 640 x 480.mp4"],
        },
      },
    },
    {
      id: "shutterstock",
      name: "Shutterstock Music",
      tools: [],
      year: 2014,
      color: "#e84b33",
      company: "Shutterstock",
      positions: ["Product Manager"],
      team: 5,
      clients: [],
      links: [
        {
          name: "Shutterstock Music",
          url: "https://www.shutterstock.com/music/",
        },
      ],
      description:
        "Sync music licensing website expands the content licensing offering for Shutterstock.com. Managed development team, business relationships, product vision and user testing.",
      preview: {
        type: "video",
        meta: {
          img: "Shutterstock.jpg",
        },
        src: {
          large: ["Shutterstock 960 x 720.webm", "Shutterstock 960 x 720.mp4"],
          small: ["Shutterstock 640 x 480.webm", "Shutterstock 640 x 480.mp4"],
        },
      },
    },
    // Hiding non-work projects for now but could bring them back later
    // {
    //   id: "echo-machine",
    //   name: "Echo Machine",
    //   tools: [],
    //   year: 2005,
    //   color: "#000000",
    //   company: "",
    //   positions: [],
    //   clients: [],
    //   links: [],
    //   preview: {
    //     type: "video",
    //     meta: {
    //       img: "Echo Machine.jpg",
    //     },
    //     src: {
    //       large: ["Echo Machine 960 x 720.webm", "Echo Machine 960 x 720.mp4"],
    //       small: ["Echo Machine 640 x 480.webm", "Echo Machine 640 x 480.mp4"],
    //     },
    //   },
    // },
    // {
    //   id: "moongold",
    //   enabled: true,
    //   name: "Moongold",
    //   tools: [],
    //   year: 2011,
    //   color: "#4e8bae",
    //   company: "Moongold",
    //   positions: [],
    //   clients: [],
    //   description: "Soul / Downtempo",
    //   links: [
    //     {
    //       name: "Bandcamp",
    //       icon: "fab fa-bandcamp",
    //       url: "https://moongoldmusic.bandcamp.com/album/moongold",
    //     },
    //     {
    //       name: "Spotify",
    //       icon: "fab fa-spotify",
    //       url: "https://open.spotify.com/album/23hqlkxBej7XjFUlMpkXKH",
    //     },
    //     {
    //       name: "iTunes",
    //       icon: "fab fa-itunes",
    //       url: "https://itunes.apple.com/us/album/friday-saturday-sunday-ep/id1091490097?uo=4&app=itunes&at=1001lry3&ct=dashboard",
    //     },
    //     {
    //       name: "Google Play",
    //       icon: "fab fa-google-play",
    //       url: "https://play.google.com/store/music/album/Moongold_Friday_Saturday_Sunday?id=Buop2bc3yhau2nszun4tw47fvfq",
    //     },
    //     {
    //       name: "Amazon Music",
    //       icon: "fab fa-amazon",
    //       url: "http://www.amazon.com/gp/product/B01CQW8PTC/?tag=distrokid06-20",
    //     },
    //   ],
    //   preview: {
    //     type: "music",
    //     src: [],
    //     meta: {
    //       id: 513497906,
    //       img: "https://f4.bcbits.com/img/a4204002963_16.jpg",
    //     },
    //   },
    // },
    // {
    //   id: "move-shake-pause-repeat",
    //   enabled: true,
    //   name: "Move Shake Pause Repeat",
    //   tools: [],
    //   year: 2018,
    //   color: "#eca800",
    //   company: "Move Shake Pause Repeat",
    //   positions: [],
    //   clients: [],
    //   description: "Post Rock",
    //   links: [
    //     {
    //       name: "Bandcamp",
    //       icon: "fab fa-bandcamp",
    //       url: "https://moveshakepauserepeat.bandcamp.com/album/move-shake-pause-repeat",
    //     },
    //     {
    //       name: "Spotify",
    //       icon: "fab fa-spotify",
    //       url: "https://open.spotify.com/album/2USwvMh5tK2PAGxl7fcrQA",
    //     },
    //     {
    //       name: "iTunes",
    //       icon: "fab fa-itunes",
    //       url: "https://itunes.apple.com/us/album/move-shake-pause-repeat/1449436404?uo=4&app=music&at=1001lry3&ct=dashboard&app=itunes&at=1001lry3&ct=dashboard",
    //     },
    //     {
    //       name: "Google Play",
    //       icon: "fab fa-google-play",
    //       url: "https://play.google.com/store/music/album/Move_Shake_Pause_Repeat_Move_Shake_Pause_Repeat?id=B7iagss6ejaj7pt3zpwx253huky",
    //     },
    //     {
    //       name: "Amazon Music",
    //       icon: "fab fa-amazon",
    //       url: "http://www.amazon.com/gp/product/B07M83DHYL/?tag=distrokid06-20",
    //     },
    //   ],
    //   preview: {
    //     type: "music",
    //     src: [],
    //     meta: {
    //       id: 4267962352,
    //       img: "https://f4.bcbits.com/img/a1231200312_16.jpg",
    //     },
    //   },
    // },
  ],
};
