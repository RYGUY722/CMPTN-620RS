Ryan Sheffler's OntOS
=====================
Each project has its own branch. After the project's completion, the changes are merged back to the master branch and a new project branch is started.  
All lab questions can be found in the "questions" folder.  
  
**Project 1 branch:** Project1. 	Project 1 is done!  
**Project 2 branch:** Project2.	  Project 2 is done!    

**UPDATE, 9/8/2020 1:43 AM:** I just realized I wasn't referencing a specific issue number in my commits.... Oops... I can't edit them now, but they all definitely say what was added and which issue was addressed, just in words, not numbers. Will be including numbers in future commits.

*Keeping the below information for easy future access.*

2019 Browser-based Operating System in TypeScript
=================================================

This is Alan's Operating Systems class initial project.
See https://www.labouseur.com/courses/os/ for details.
It was originally developed by Alan and then enhanced by Bob Nisco and Rebecca Murphy over the years.
Fork this (or clone, but fork is probably better in case Alan changes anything about the initial project) into your own private repository. Or download it as a ZIP file. Then add Alan (userid *Labouseur*) as a collaborator.

Setup TypeScript
================

1. Install the [npm](https://www.npmjs.org/) package manager if you don't already have it.
1. Run `npm install -g typescript` to get the TypeScript Compiler. (You may need to do this as root.)


Workflow
=============

Some IDEs (e.g., Visual Studio Code, IntelliJ, others) natively support TypeScript-to-JavaScript compilation 
and have tools for debugging, syntax highlighting, and more.
If your development environment lacks these then you'll need to automate the compilation process with something like Gulp.

- Setup Gulp
1. `npm install -g gulp` to get the Gulp Task Runner.
1. `npm install -g gulp-tsc` to get the Gulp TypeScript plugin.

Run `gulp` at the command line in the root directory of this project.
Edit your TypeScript files in the source/scripts directory.

Gulp will automatically:

* Watch for changes in your source/scripts/ directory for changes to .ts files and run the TypeScript Compiler on them.
* Watch for changes to your source/styles/ directory for changes to .css files and copy them to the distrib/ folder if you have them there.


I find Gulp annoying, so consider use a compile script from the command line.

A Few Notes
===========

**What's TypeScript?**
TypeScript is a language that allows you to write in a statically-typed language that outputs standard JavaScript.
It's all kinds of awesome.

**Why should I use it?**
This will be especially helpful for an OS or a Compiler that may need to run in the browser as you will have all of the great benefits of strong type checking and scope rules built right into your language.

**Where can I get more info on TypeScript**
[Right this way!](http://www.typescriptlang.org/)
