# Windows Node Version Manager
------------------------------

### Table of Contents
1. [Intro](#intro)
2. [Setup](#setup)
3. [Usage](#usage)
   * [init](#init)
   * [install](#install)
   * [use](#use)
   * [list](#list)
   * [implode](#implode)
4. [To-do](#to-do)

------------------------------

### Intro

I started this project because I wanted to play with building a CLI tool in Node and at that moment I was having issues with managing different versions of Node on Windows; I also wanted a tool that doesn't require admin privileges to install itself or other Node versions. Se here we are :)

Granted, this tool requires Node to be present beforehand, but after I finish writing the important bits, it will be able to coexist with it.

------------------------------

### Setup

This is pretty straight forward; just run the following command and the tool should be available for use:

```
npm i -g wnvm
```

------------------------------

### Usage

```
wnvm init                                   Initialise the tool
wnvm install [version] [architecture]       Install specified [version]
wnvm use [version]                          Switch to specified [version]
wnvm List                                   List installed versions
wnvm implode                                Revert environment to how it was before the tool was initialised
```

#### init

This initialises the tool; in order to do this, the following steps are followed:

1. Looks for previously installed version of Node in the default location of this tool: `%HOME%\.wnvm` e.g. `C:\Users\Alex-Radu\.wnvm`

2. Makes a note of gloabally installed `npm` packages so that it can migrate them if the user so wants it

3. It also makes a note of the value for the `Path` environment variable and `npm prefix`

4. Creates a directory junction at `%HOME%\.wnvm\active` that initially points to the folder where Node is installed

5. Sets up `NODE_HOME` and `WNVM_HOME` environment variables and adds them to `Path`. `WNVM_HOME` is used for the location of the `wnvm` executable and `NODE_HOME` for the active version of Node

6. Sets `npm prefix` to point to the directory junction

7. Writes a `.wnvmrc` file used to keep track of what the tool is doing

#### install

This installs the specified `version` of node (e.g. `8.0.0`, `9,4,0`, etc.); additionally, the command can be followed by an architecture specification (e.g. `86` or `64`) to override the default system architecture

This is achieved by downloading the binary from [https://nodejs.org/dist/](https://nodejs.org/dist/) and extracting the archive in the `.wnvm` folder

Note: If the specified version can't be found, the tool will try and recommend a similar version: something that has the same `major` version and either the same `minor` or the same `patch` version.

#### use

Activates the specified `version`. This is done by simply changing where the directory junction points at. For example, if `active` was pointing to `8.0.0` (the folder containing Node version `8.0.0`) and we want to switch to version `9.0.0`, we simply points `active` to that folder.

#### list

Pretty self explanatory; shows all installed versions of Node and highlights the one that is active, if such a version exists.

#### implode

Reverts all changes made by this tool: puts back the original values for `Path` and `npm prefix`, removes `WNVM_HOME` and `NODE_HOME` environment variables and deletes the directory junction - `active`

------------------------------

### To-do

* allow user to change default location for the `.wnvm` folder
* allow user to migrate gloabal `npm` packages when installing a new version
* add `proxy` support for users on a corporate network
