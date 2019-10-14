# [bobba.io](https://bobba.io/) client &middot; [![GitHub license](https://img.shields.io/badge/license-GNU-blue.svg)](https://github.com/josedn/bobba_client/blob/master/LICENSE) 
![bobba](https://i.imgur.com/SKaFSwX.png)

Habbo Hotel (r60+) remake made with modern (as 2019) technologies.
## Features:
* Built-in avatar imager
* Built-in furni imager
* Walking, sitting, waving, blinking and speaking animations.
* Basic furni interaction (double clicking a furni will change its state)
* Furni particle system  (the farther elements are drawn first, so there's a 3D illusion)
* Furni animations
* Chat bubbles handled by game engine
* Catalogue
* Furni inventory
* Console / Messenger
* Navigator

## Installation
To run your own 'bobba' you will have to consider 3 parts:
* Client: You'll have to build this project and deploy it to a web server.
* Server: bobba.io project includes a compatible server written in Java. You'll have to deploy it too in order to make your client useful. 
 Available at: [bobba_server](https://github.com/Josedn/bobba_server)
* Assets: Like Habbo, avatar and furni assets are not included in the client, so you'll have to provide it with a web hosted folder with your assets.
You can generate your furni assets using this node-based tool: [bobba_furni_converter](https://github.com/Josedn/bobba_furni_converter)
And your avatar assets with the PHP-based tool from [bobba_avatarimager](https://github.com/Josedn/bobba_avatarimager). (Thanks Tsuka).

## Requirements
* Nodejs 10
* npm

## Building
To build the client execute the following commands:

    git clone https://github.com/Josedn/bobba_client.git
    cd bobba_client
    npm install
    npm start
Then you'll be running the React development server.
If you want to deploy it, run

    npm run serve

## Related projects
* [bobba_server](https://github.com/Josedn/bobba_server): Official compatible bobba server.
* [bobba_furni_converter](https://github.com/Josedn/bobba_furni_converter): Furni assets generation tool.
* [bobba_avatarimager](https://github.com/Josedn/bobba_avatarimager): Avatar assets generation tool.
* [bobba_cms](https://github.com/Josedn/bobba_cms): Unfinished CMS made for bobba in React.
* [battleball_client](https://github.com/Josedn/battleball_client): Bobba 1.0 client
* [battleball_server](https://github.com/Josedn/battleball_server): Bobba 1.0 server


Made with <3 by Relevance.