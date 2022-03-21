# Web Graffiti

This extension allows you and at least one other person to draw on a webpage you are both on. There are no servers between you and your colleagues. Data is sent and received via p2p.

Tested on Chrome.
Peering IDs are powered and provided by PeerJS and the official PeerServer.

## Installation

1) Open Chrome
2) Type in the address bar "chrome://extensions/"
3) Enable "Developer mode" at the top right hand corner
4) After you downloaded and unpacked this repo, click on "Load unpacked"
5) Navigate to this repo's folder and select it

## How to use

Clicking on the extension will provide you with your drawing tools and your Peer ID. Your Peer ID changes everytime you visit a new page or refresh. 

Upon opening the same page as your colleague, provide to him or her your Peer ID or vise versa. It takes time for the connection to establish but a popup will eventually appear saying that the connection was successful. 

To ensure everyone is having the same experience, resize your window to 1280x720 and be on the same webpage. An indicator at the top left of the web page is provided as guidance.

Write the web! Literally!

## WIP

1) Develop a system in which clients would not connect if they are not on the same webpage
2) Increase efficiency. Currently, the extension uses more bandwidth and CPU cycles than what I would like
3) Automatically resize client's window to 1280x720 (likely impossible due to the browser's security)