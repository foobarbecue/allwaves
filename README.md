# About this repo

This repository hosts the code for https://allwav.es and some associated software.

Allwav.es is a side project for sharing and reviewing videos and GPS data from my Soloshot robot camera.

This early proof-of-concept is also an experiment in minimalist web dev. To keep it simple and cheap, the site has:

- **No build step.** Code is html, css, and js (using native ESM modules).
- **No server-side app.** It's just static pages.
- **Few dependencies, all loaded from external CDNs.** This means no package manager (e.g. npm) is needed. It also means
  I'm probably loading a ton of duplicate js and that if I add more dependencies, I will run into conflicts and other
  dependency management issues.
- **No database.** State is stored in YouTube playlists and comments. .SESSION files from the camera are included in
  their original format and GPS data is extracted from them, mapped, and plotted client-side.
- **No type hinting or specifications.** This is likely to cause bugs, but I code faster without types.
- **No AI-generated code**. I want to write every line by hand so that there are no surprises.

If this proof-of-concept is successful, particularly if other Soloshot users are interested in uploading data, I will
most likely rewrite the app using a full-stack web framework of some sort. Possibly sveltekit or meteor.js .

# Directories & files

- **cli_tools** contains some node.js scripts related to site admin
- **modules** contains all the javascript for https://allwav.es
- **seshfiles** contains .SESSION files from my surfing sessions
- **index.html** is the front page of https://allwav.es